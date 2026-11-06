// Requires the Firebase emulators (Java + firebase-tools). Run: npm run test:rules
import fs from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {ref,uploadBytes,getBytes,deleteObject} from 'firebase/storage';
import {doc,setDoc,getDoc,deleteDoc,serverTimestamp} from 'firebase/firestore';
const env=await initializeTestEnvironment({projectId:'demo-auditdefend',
  firestore:{rules:fs.readFileSync('firestore.rules','utf8'),host:'127.0.0.1',port:8080},
  storage:{rules:fs.readFileSync('storage.rules','utf8'),host:'127.0.0.1',port:9199}});
// Case membership (seeded bypassing rules): case1 via providerCases (prov + atty); case2 via attorneyCases.
await env.withSecurityRulesDisabled(async ctx=>{
  const db=ctx.firestore();
  await setDoc(doc(db,'providerCases/case1'),{providerUids:['prov'],attorneyUids:['atty'],createdByUid:'prov'});
  await setDoc(doc(db,'attorneyCases/case2'),{providerUids:['prov2'],attorneyUids:['atty2'],createdByUid:'atty2'});
});
const st=uid=>uid?env.authenticatedContext(uid).storage():env.unauthenticatedContext().storage();
const fs_=uid=>uid?env.authenticatedContext(uid).firestore():env.unauthenticatedContext().firestore();
const bytes=new Uint8Array(64).fill(9); // stands in for ciphertext (> 28 bytes)
const meta=(by,extra={},type='application/octet-stream')=>({contentType:type,customMetadata:{encrypted:'true',originalType:'application/pdf',redacted:'true',attested:'true',sha256:'a'.repeat(64),uploadedBy:by,...extra}});

// ---- Evidence ----
const ev='evidence/case1/file1';
await assertSucceeds(uploadBytes(ref(st('prov'),ev),bytes,meta('prov')));
await assertSucceeds(getBytes(ref(st('prov'),ev)));
await assertSucceeds(getBytes(ref(st('atty'),ev)));            // attorney can read
await assertFails(getBytes(ref(st('outsider'),ev)));
await assertFails(getBytes(ref(st(null),ev)));
await assertFails(getBytes(ref(st('atty2'),ev)));              // attorney on another case
await assertFails(uploadBytes(ref(st('prov'),ev),bytes,meta('prov')));   // no overwrite
await assertFails(uploadBytes(ref(st('outsider'),'evidence/case1/x1'),bytes,meta('outsider')));
await assertFails(uploadBytes(ref(st(null),'evidence/case1/x2'),bytes,meta('prov')));
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x3'),bytes,meta('atty')));              // spoofed uploadedBy
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x4'),bytes,meta('prov',{encrypted:'false'})));
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x5'),bytes,meta('prov',{},'application/pdf'))); // plaintext type refused
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x6'),bytes,meta('prov',{redacted:'false'})));
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x7'),bytes,meta('prov',{sha256:'zz'})));
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x8'),bytes,meta('prov',{originalType:'image/png'})));
await assertFails(uploadBytes(ref(st('prov'),'evidence/case1/x9'),new Uint8Array(10),meta('prov')));     // too small to be ciphertext
await assertFails(uploadBytes(ref(st('prov'),'other/x'),bytes,meta('prov')));
// attorneyCases-based case works too
await assertSucceeds(uploadBytes(ref(st('atty2'),'evidence/case2/f1'),bytes,meta('atty2')));
await assertSucceeds(getBytes(ref(st('prov2'),'evidence/case2/f1')));
// Delete: only the uploader, even if the file is not marked redacted (wrong doc uploaded by mistake).
await assertFails(deleteObject(ref(st('atty'),ev)));
await assertFails(deleteObject(ref(st('outsider'),ev)));
await assertSucceeds(deleteObject(ref(st('prov'),ev)));
await assertSucceeds(uploadBytes(ref(st('prov'),'evidence/case1/mistake'),bytes,meta('prov')));
await assertSucceeds(deleteObject(ref(st('prov'),'evidence/case1/mistake')));

// ---- Written documents: editable by any participant ----
const dc='documents/case1/memo';
await assertSucceeds(uploadBytes(ref(st('prov'),dc),bytes,meta('prov')));
await assertSucceeds(uploadBytes(ref(st('atty'),dc),bytes,meta('atty')));   // attorney edits/redacts and replaces
await assertSucceeds(getBytes(ref(st('prov'),dc)));
await assertFails(uploadBytes(ref(st('outsider'),dc),bytes,meta('outsider')));
await assertFails(getBytes(ref(st('outsider'),dc)));
await assertFails(uploadBytes(ref(st('atty'),dc),bytes,meta('atty',{encrypted:'false'})));
await assertSucceeds(deleteObject(ref(st('atty'),dc)));
await assertFails(deleteObject(ref(st('outsider'),'documents/case1/none')));

// ---- Case key wraps (Firestore): password + recovery, rescue, rotation, abuse ----
const fsV=uid=>env.authenticatedContext(uid,{email_verified:true}).firestore();
const fsU=uid=>env.authenticatedContext(uid,{email_verified:false}).firestore();
const wrap=(by,kind='password',extra={})=>({version:1,kind,salt:'c2FsdA==',iterations:600000,iv:'aXY=',wrappedKey:'a2V5',createdByUid:by,createdAt:serverTimestamp(),...extra});
const w=(db,caseId,id)=>doc(db,`caseKeys/${caseId}/wraps/${id}`);
await assertSucceeds(setDoc(w(fsV('prov'),'case1','pw'),wrap('prov')));
await assertSucceeds(setDoc(w(fsV('prov'),'case1','rec'),wrap('prov','recovery')));
await assertSucceeds(getDoc(w(fsV('atty'),'case1','pw')));                   // attorney reads wraps, unlocks with shared password
await assertFails(getDoc(w(fsV('outsider'),'case1','pw')));
await assertFails(getDoc(w(fs_(null),'case1','pw')));
await assertSucceeds(setDoc(w(fsV('atty'),'case1','atty-pw'),wrap('atty')));  // other party adds their own / a rescue wrap
// Abuse: unverified email, outsiders, spoofed creator, forged timestamp, weak KDF, extra fields, bad kind, immutability.
await assertFails(setDoc(w(fsU('atty'),'case1','unverified'),wrap('atty')));
await assertFails(setDoc(w(fsV('outsider'),'case1','o1'),wrap('outsider')));
await assertFails(setDoc(w(fsV('prov'),'case1b','p1'),wrap('prov')));         // not a participant of that case
await assertFails(setDoc(w(fsV('prov'),'case1','spoof'),wrap('atty')));
await assertFails(setDoc(w(fsV('prov'),'case1','oldts'),wrap('prov','password',{createdAt:new Date('2020-01-01')})));
await assertFails(setDoc(w(fsV('prov'),'case1','weak'),wrap('prov','password',{iterations:1000})));
await assertFails(setDoc(w(fsV('prov'),'case1','extra'),wrap('prov','password',{password:'hunter2'})));
await assertFails(setDoc(w(fsV('prov'),'case1','badkind'),wrap('prov','escrow')));
await assertFails(setDoc(w(fsV('prov'),'case1','pw'),wrap('prov','password',{wrappedKey:'bmV3'})));   // wraps are immutable
// Deletes: creator of the wrap or the case creator only. The other participant cannot lock someone out.
await assertFails(deleteDoc(w(fsV('atty'),'case1','pw')));
await assertFails(deleteDoc(w(fsV('atty'),'case1','rec')));
await assertFails(deleteDoc(w(fsV('outsider'),'case1','pw')));
await assertFails(deleteDoc(w(fsU('prov'),'case1','atty-pw')));               // unverified email cannot delete
await assertSucceeds(deleteDoc(w(fsV('prov'),'case1','atty-pw')));            // case creator can cut off a leaked wrap
await assertSucceeds(deleteDoc(w(fsV('prov'),'case1','pw')));                 // creator removes own wrap
await assertSucceeds(deleteDoc(w(fsV('prov'),'case1','rec')));
await env.cleanup();
console.log('Storage rules tests passed.');
