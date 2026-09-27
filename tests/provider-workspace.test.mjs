import fs from 'node:fs';

const read=file=>fs.readFileSync(new URL(`../public/${file}`,import.meta.url),'utf8');
const html=read('provider-workspace.html');
const js=read('provider-workspace.js');
const app=read('app.html');
const onboarding=read('provider-onboarding.html');
const redirects=read('_redirects');
const vercel=fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8');

for(const label of ['Case home','Add documents','Evidence results','Proof unavailable','Attorney access']){
  if(!html.includes(label))throw new Error(`provider menu missing ${label}`);
}
for(const label of ['Supported by records','Possible match—check needed','Not checked yet','Provider cannot supply proof']){
  if(!html.includes(label))throw new Error(`provider result key missing ${label}`);
}
if((html.match(/data-provider-view=/g)||[]).length!==5)throw new Error('provider menu should stay focused at five items');
if(!html.includes('providerDocumentForm')||!js.includes('submission-proof'))throw new Error('provider evidence intake is incomplete');
if(!js.includes("status:'reconciled'")||!js.includes("status:'review'")||!js.includes("status:'unreviewed'")||!js.includes("status:'missing'"))throw new Error('provider reconciliation states are incomplete');
if(js.includes("claim.rebuttal==='A')return{status:'reconciled'"))throw new Error('payer support is incorrectly treated as reconciliation');
if(/equitable estoppel|unjust enrichment|procedural posture|likely outcome/i.test(html))throw new Error('provider workspace contains attorney-level language');
if(app.includes('data-view="policy"')||app.includes('data-view-target="policy"'))throw new Error('policy access remains in the app navigation');
if(!app.includes('href="/policies"'))throw new Error('app footer is missing public policy access');
if(!onboarding.includes('href="/provider/workspace"'))throw new Error('onboarding does not enter the provider workspace');
if(!redirects.includes('/provider/workspace /provider-workspace.html 200'))throw new Error('provider workspace redirect is missing');
if(!redirects.includes('/provider/demo /provider-workspace.html 200'))throw new Error('provider demo redirect is missing');
const config=JSON.parse(vercel);
for(const route of ['/provider/workspace','/provider/demo']){
  if(!config.rewrites?.some(item=>item.source===route&&item.destination==='/provider-workspace'))throw new Error(`Vercel rewrite is missing ${route}`);
}
console.log('Provider workspace checks passed.');
