import fs from 'node:fs';

const read=file=>fs.readFileSync(new URL(`../public/${file}`,import.meta.url),'utf8');
const html=read('provider-workspace.html');
const js=read('provider-workspace.js');
const app=read('app.html');
const onboarding=read('provider-onboarding.html');

for(const label of ['Case home','Add documents','Claim results','Missing proof','Attorney access']){
  if(!html.includes(label))throw new Error(`provider menu missing ${label}`);
}
for(const label of ['Reconciled','Possible match—check needed','Proof still missing']){
  if(!html.includes(label))throw new Error(`provider result key missing ${label}`);
}
if((html.match(/data-provider-view=/g)||[]).length!==5)throw new Error('provider menu should stay focused at five items');
if(!html.includes('providerDocumentForm')||!js.includes('submission-proof'))throw new Error('provider evidence intake is incomplete');
if(!js.includes("status:'reconciled'")||!js.includes("status:'review'")||!js.includes("status:'missing'"))throw new Error('provider reconciliation states are incomplete');
if(/equitable estoppel|unjust enrichment|procedural posture|likely outcome/i.test(html))throw new Error('provider workspace contains attorney-level language');
if(app.includes('data-view="policy"')||app.includes('data-view-target="policy"'))throw new Error('policy access remains in the app navigation');
if(!app.includes('href="/policies"'))throw new Error('app footer is missing public policy access');
if(!onboarding.includes('href="/provider/workspace"'))throw new Error('onboarding does not enter the provider workspace');
console.log('Provider workspace checks passed.');
