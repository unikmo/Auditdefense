(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.AuditDefendVault=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const MAX_BYTES=10*1024*1024;
  const TYPES=['application/pdf','text/csv','application/json'];
  const ID=/^[A-Za-z0-9_-]{1,64}$/;
  const HEX64=/^[0-9a-f]{64}$/;
  function validate({name,type,size,attestedRedacted},gates){
    const errors=[];
    if(!name||/[\\/]/.test(name)) errors.push('Invalid file name.');
    if(!TYPES.includes(type)) errors.push('Only PDF, CSV or JSON files are accepted.');
    if(!Number.isFinite(size)||size<=0) errors.push('File is empty.');
    else if(size>=MAX_BYTES) errors.push('File must be under 10 MB.');
    // Until every production gate is complete, files must be attested redacted/synthetic.
    const phiOk=!!gates&&gates.phiAllowed===true;
    if(!phiOk&&attestedRedacted!==true) errors.push('Confirm the file is redacted or synthetic. Real PHI is not yet permitted.');
    return {ok:errors.length===0,errors};
  }
  async function sha256Hex(bytes){
    const buf=await globalThis.crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function objectPath({caseId,fileId}){
    if(![caseId,fileId].every(v=>typeof v==='string'&&ID.test(v))) throw new Error('Invalid path component.');
    return `evidence/${caseId}/${fileId}`;
  }
  // Files are encrypted in the browser (see case-crypto.js) before upload, so the stored
  // object is application/octet-stream and the real type travels as metadata. The file
  // name is deliberately NOT stored in plaintext metadata (names can contain PHI).
  // sha256 is the hash of the PLAINTEXT, for integrity checks after decryption.
  const STORED_TYPE='application/octet-stream';
  function metadata({sha256,originalType,uploadedBy}){
    if(!uploadedBy) throw new Error('uploadedBy is required.');
    if(!HEX64.test(sha256||'')) throw new Error('sha256 must be 64 hex chars.');
    if(!TYPES.includes(originalType)) throw new Error('originalType must be PDF, CSV or JSON.');
    return {redacted:'true',attested:'true',encrypted:'true',originalType,sha256,uploadedBy,uploadedAt:new Date().toISOString()};
  }
  // Written documents live under documents/ and may be edited/replaced; evidence under evidence/ may not.
  function objectPathFor(kind,{caseId,fileId}){
    if(kind!=='evidence'&&kind!=='documents') throw new Error('kind must be evidence or documents.');
    return objectPath({caseId,fileId}).replace(/^evidence\//,`${kind}/`);
  }
  // Append-only custody entry; callers persist it to Firestore (create-only rule).
  function custodyEntry({action,uid,caseId,fileId,sha256,at}){
    return {action,uid,caseId,fileId,sha256,at:at||new Date().toISOString()};
  }
  return {MAX_BYTES,TYPES,STORED_TYPE,validate,sha256Hex,objectPath,objectPathFor,metadata,custodyEntry};
});
