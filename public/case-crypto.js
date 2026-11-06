(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.AuditDefendCaseCrypto=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // Per-case password protection with recovery, end to end in the browser.
  //
  // A random data key (DEK) encrypts the files. The DEK is stored only in "wraps":
  // independent copies of the DEK, each locked by a different secret (a case password,
  // or a one-time recovery code). Any one secret opens the DEK. Wraps live in Firestore
  // under caseKeys/{caseId}/wraps/{wrapId}; the server never sees a secret or the DEK.
  //
  // Recovery paths:
  //  - Forgot the password, still have the recovery code  -> unlock with the code, add a new password wrap.
  //  - Forgot the password, the other party still has it  -> they unlock and add a new password wrap for you.
  //  - Lost the password AND the recovery code AND nobody else can unlock -> files are unrecoverable (by design).
  const ITERATIONS=600000;
  const MIN_PASSPHRASE=12;
  const CODE_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols, no I/O/0/1
  const CODE_LENGTH=32; // 32 symbols x 5 bits = 160 bits
  const subtle=()=>globalThis.crypto.subtle;
  const rand=n=>globalThis.crypto.getRandomValues(new Uint8Array(n));
  function toB64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s)}
  function fromB64(str){const s=atob(str);const out=new Uint8Array(s.length);for(let i=0;i<s.length;i++) out[i]=s.charCodeAt(i);return out}
  function checkPassphrase(p){
    if(typeof p!=='string'||p.length<MIN_PASSPHRASE) throw new Error(`Case password must be at least ${MIN_PASSPHRASE} characters.`);
  }
  function generateRecoveryCode(){
    const bytes=rand(CODE_LENGTH);
    let s='';for(const b of bytes) s+=CODE_ALPHABET[b&31]; // 256 % 32 === 0, so no bias
    return s.match(/.{4}/g).join('-');
  }
  function normalizeCode(code){
    const c=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(c.length!==CODE_LENGTH||[...c].some(ch=>!CODE_ALPHABET.includes(ch))) throw new Error('That is not a valid recovery code.');
    return c;
  }
  async function deriveKek(secret,salt,iterations){
    const base=await subtle().importKey('raw',new TextEncoder().encode(secret),'PBKDF2',false,['deriveKey']);
    return subtle().deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function wrap(rawDek,secret,kind){
    const salt=rand(16),iv=rand(12);
    if(kind==='recovery') secret=normalizeCode(secret); // same normalization as unlock, so dashes/case never matter
    const kek=await deriveKek(secret,salt,ITERATIONS);
    const wrapped=new Uint8Array(await subtle().encrypt({name:'AES-GCM',iv},kek,rawDek));
    return {version:1,kind,salt:toB64(salt),iterations:ITERATIONS,iv:toB64(iv),wrappedKey:toB64(wrapped)};
  }
  async function importDek(raw){return subtle().importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt'])}
  const secretFor=(wrap_,secret)=>wrap_.kind==='recovery'?normalizeCode(secret):secret;

  // Try every wrap with the given secret; return the raw DEK from the first that opens.
  async function unwrapRaw(secret,wraps){
    if(!Array.isArray(wraps)||wraps.length===0) throw new Error('No key wraps found for this case.');
    for(const w of wraps){
      if(!w||w.version!==1) continue;
      let s;
      try{s=secretFor(w,secret)}catch{continue} // e.g. a password tried against a recovery wrap
      try{
        const kek=await deriveKek(s,fromB64(w.salt),w.iterations);
        const raw=new Uint8Array(await subtle().decrypt({name:'AES-GCM',iv:fromB64(w.iv)},kek,fromB64(w.wrappedKey)));
        return {raw,kind:w.kind};
      }catch{/* try next wrap */}
    }
    throw new Error('Wrong case password or recovery code.');
  }

  // Creating a case yields a password wrap and a recovery wrap. Show the recovery code ONCE.
  async function createCaseKey(passphrase){
    checkPassphrase(passphrase);
    const raw=rand(32),recoveryCode=generateRecoveryCode();
    return {
      key:await importDek(raw),
      wraps:[await wrap(raw,passphrase,'password'),await wrap(raw,recoveryCode,'recovery')],
      recoveryCode
    };
  }
  // secret = case password or recovery code. Returns {key, kind} where kind says which opened it.
  async function unlockCaseKey(secret,wraps){
    const {raw,kind}=await unwrapRaw(secret,wraps);
    return {key:await importDek(raw),kind};
  }
  // Unlock with any current secret and add a NEW password wrap (forgot-password reset,
  // or giving another participant their own password). Returns the wrap to store.
  async function addPasswordWrap(currentSecret,wraps,newPassphrase){
    checkPassphrase(newPassphrase);
    const {raw}=await unwrapRaw(currentSecret,wraps);
    return wrap(raw,newPassphrase,'password');
  }
  // Issue a fresh recovery code (e.g. the old one was lost or exposed). Returns {wrap, recoveryCode}.
  async function addRecoveryWrap(currentSecret,wraps){
    const {raw}=await unwrapRaw(currentSecret,wraps);
    const recoveryCode=generateRecoveryCode();
    return {wrap:await wrap(raw,recoveryCode,'recovery'),recoveryCode};
  }
  // Output = 12-byte IV followed by ciphertext (includes the GCM tag).
  async function encrypt(key,bytes){
    const iv=rand(12);
    const ct=new Uint8Array(await subtle().encrypt({name:'AES-GCM',iv},key,bytes));
    const out=new Uint8Array(12+ct.length);out.set(iv,0);out.set(ct,12);return out;
  }
  async function decrypt(key,blob){
    if(!blob||blob.length<28) throw new Error('Encrypted file is too short.');
    try{return new Uint8Array(await subtle().decrypt({name:'AES-GCM',iv:blob.subarray(0,12)},key,blob.subarray(12)))}
    catch{throw new Error('Could not decrypt: wrong case password or corrupted file.')}
  }
  return {ITERATIONS,MIN_PASSPHRASE,CODE_LENGTH,generateRecoveryCode,normalizeCode,createCaseKey,unlockCaseKey,addPasswordWrap,addRecoveryWrap,encrypt,decrypt};
});
