import assert from 'node:assert/strict';
import cc from '../public/case-crypto.js';
const pass='correct horse battery staple';
const {key,wraps,recoveryCode}=await cc.createCaseKey(pass);
assert.deepEqual(wraps.map(w=>w.kind),['password','recovery']);
assert.ok(wraps.every(w=>w.iterations>=600000&&w.version===1));
assert.match(recoveryCode,/^([A-Z2-9]{4}-){7}[A-Z2-9]{4}$/);
assert.ok(!JSON.stringify(wraps).includes(pass)&&!JSON.stringify(wraps).includes(recoveryCode),'Wraps must not contain secrets.');
assert.notEqual(cc.generateRecoveryCode(),cc.generateRecoveryCode());

const data=new TextEncoder().encode('session note: redacted sample');
const blob=await cc.encrypt(key,data);
assert.notDeepEqual(Array.from(blob.subarray(12,12+data.length)),Array.from(data),'Ciphertext must differ from plaintext.');
assert.notDeepEqual(Array.from(await cc.encrypt(key,data)),Array.from(blob),'Random IV per encryption.');
assert.deepEqual(Array.from(await cc.decrypt(key,blob)),Array.from(data));
const same=async k=>assert.deepEqual(Array.from(await cc.decrypt(k,blob)),Array.from(data));

// Other party unlocks with the shared password alone.
const viaPass=await cc.unlockCaseKey(pass,wraps);
assert.equal(viaPass.kind,'password');await same(viaPass.key);

// RECOVERY: forgot the password, still has the code. Code is forgiving about case/dashes/spaces.
const loose=recoveryCode.toLowerCase().replaceAll('-',' ');
const viaCode=await cc.unlockCaseKey(loose,wraps);
assert.equal(viaCode.kind,'recovery');await same(viaCode.key);

// Reset: unlock with code, add a new password wrap, then the new password works and old files still open.
const newPass='my brand new case password';
const newWrap=await cc.addPasswordWrap(recoveryCode,wraps,newPass);
assert.equal(newWrap.kind,'password');
const afterReset=[...wraps,newWrap];
await same((await cc.unlockCaseKey(newPass,afterReset)).key);
// If the old password wrap is deleted (compromise), the old password stops working.
const rotated=[wraps[1],newWrap];
await assert.rejects(cc.unlockCaseKey(pass,rotated),/Wrong case password or recovery code/);
await same((await cc.unlockCaseKey(newPass,rotated)).key);

// The OTHER party can rescue someone who lost everything, by adding a password wrap for them.
const rescue=await cc.addPasswordWrap(pass,wraps,'rescued participant password');
await same((await cc.unlockCaseKey('rescued participant password',[...wraps,rescue])).key);

// Fresh recovery code after the old one is lost/exposed; the new one works.
const {wrap:r2,recoveryCode:code2}=await cc.addRecoveryWrap(pass,wraps);
assert.notEqual(code2,recoveryCode);
await same((await cc.unlockCaseKey(code2,[wraps[0],r2])).key);

// Failures: wrong password, wrong code, tampered ciphertext, short password, malformed code, no wraps.
await assert.rejects(cc.unlockCaseKey('wrong password here',wraps),/Wrong case password or recovery code/);
await assert.rejects(cc.unlockCaseKey('AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA',wraps),/Wrong case password or recovery code/);
await assert.rejects(cc.addPasswordWrap('nope nope nope nope',wraps,newPass),/Wrong case password or recovery code/);
await assert.rejects(cc.createCaseKey('short'),/at least/);
await assert.rejects(cc.addPasswordWrap(pass,wraps,'short'),/at least/);
assert.throws(()=>cc.normalizeCode('not a code'),/valid recovery code/);
await assert.rejects(cc.unlockCaseKey(pass,[]),/No key wraps/);
const bad=blob.slice();bad[bad.length-1]^=1;
await assert.rejects(cc.decrypt(key,bad),/Could not decrypt/);
await assert.rejects(cc.decrypt(key,new Uint8Array(5)),/too short/);

// 5 MB round trip.
const big=new Uint8Array(5*1024*1024).fill(7);
assert.equal((await cc.decrypt(key,await cc.encrypt(key,big))).length,big.length);
console.log('Case crypto tests passed.');
