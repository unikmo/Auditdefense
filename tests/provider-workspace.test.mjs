import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL(`../public/${file}`,import.meta.url),'utf8');
const html=read('provider-workspace.html');
const js=read('provider-workspace.js');
const app=read('app.html');
const onboarding=read('provider-onboarding.html');
const redirects=read('_redirects');
const vercel=fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8');
const caseDataSource=read('case-data.js');
const sandbox={window:{}};
vm.runInNewContext(caseDataSource,sandbox);
const caseData=sandbox.window.AuditDefendCaseData;

for(const label of ['Case home','Add documents','Evidence results','Evidence still needed','Attorney access']){
  if(!html.includes(label))throw new Error(`provider menu missing ${label}`);
}
for(const label of ['Accepted by insurer','Insurer says evidence is missing','Provider evidence located','Provider evidence unavailable','Enrollment or other issue']){
  if(!html.includes(label))throw new Error(`provider result key missing ${label}`);
}
for(const label of ['Requested by insurer','Provider reports evidence submitted','Accepted by insurer','Documentation findings','Enrollment or other findings','Provider evidence located','Provider evidence still missing']){
  if(!js.includes(label))throw new Error(`provider evidence path missing ${label}`);
}
if(!js.includes("recordsRequestEntries||rows.length"))throw new Error('provider evidence path does not begin with the insurer request');
if(caseData.caseContext.providerReportedSubmissionCount!==60)throw new Error('provider-reported submission count is missing');
if(!/not independently verified/i.test(caseData.caseContext.providerSubmissionStatus))throw new Error('provider-reported submission count lacks its verification limitation');
for(const equation of ['requested · ${submitted} provider-reported as submitted','accepted + ${payerMissing} documentation findings + ${counts.other} enrollment/other','records located + ${providerMissing} records still missing']){
  if(!js.includes(equation))throw new Error(`provider stage arithmetic missing ${equation}`);
}
if(!js.includes("nextStepHelp")||!js.includes("nextStepAction")||!js.includes("Add submission proof"))throw new Error('provider next step does not adapt to the actual missing-evidence count');
if((html.match(/data-provider-view=/g)||[]).length!==5)throw new Error('provider menu should stay focused at five items');
if(!html.includes('providerDocumentForm')||!js.includes('submission-proof'))throw new Error('provider evidence intake is incomplete');
for(const status of ["status:'accepted'","status:'needs-evidence'","status:'source-found'","status:'not-found'","status:'other'"]){
  if(!js.includes(status))throw new Error(`provider evidence category is missing ${status}`);
}
if(!js.includes("if(isPayerAccepted(claim))return{status:'accepted'"))throw new Error('payer-accepted claims are not separated');
if(!js.includes("if(!requiresDocumentationEvidence(claim)){"))throw new Error('other claim issues are not separated');
if(!js.includes("hasVerifiedSource)return{status:'source-found'"))throw new Error('verified repository evidence is not used in provider results');
if(!js.includes("label:'Evidence available for rebuttal review'"))throw new Error('matched evidence is not presented as available for rebuttal review');
if(!js.includes("Anthem’s enrollment finding appears on"))throw new Error('enrollment findings are not explained in the open-issue workflow');
if(!js.includes("counts.accepted")||!js.includes("payerMissing=rows.filter")||!js.includes("providerFound=rows.filter"))throw new Error('provider evidence-path counts are incomplete');
if(!js.includes("providerMissing=rows.filter")||!js.includes("['needs-evidence','not-found']"))throw new Error('provider missing-evidence queue does not include unresolved and unavailable records');
const enrollmentAffected=caseData.claims.filter(claim=>claim.rebuttal!=='A'&&claim.issues.includes('NPI enrollment on DOS'));
if(enrollmentAffected.length!==27)throw new Error(`expected 27 rows with an enrollment finding, found ${enrollmentAffected.length}`);
for(const value of ['Do you have evidence that addresses Anthem’s enrollment or registration finding?','Yes — upload evidence','No — explain why']){
  if(!js.includes(value))throw new Error(`provider enrollment workflow missing ${value}`);
}
if(!js.includes("issueResponses:{}")||!js.includes("appliesTo")||!js.includes("enrollmentExplanation"))throw new Error('provider yes/no enrollment response is not persisted with evidence scope and explanation');
if(!html.includes('providerApplicationScope')||!html.includes('enrollmentNoDialog'))throw new Error('provider enrollment upload/explanation UI is incomplete');
const evidenceRecords=caseData.evidenceReconciliation.records;
if(Object.keys(evidenceRecords).length!==30)throw new Error('all 30 payer-review rows must have a source reconciliation record');
if(Object.values(evidenceRecords).some(record=>record.status!=='verified'))throw new Error('the reconciled source records are not verified');
const expectedCounts=caseData.claims.reduce((counts,claim)=>{
  if(claim.rebuttal==='A')counts.accepted++;
  else if(!claim.issues.includes('Documentation support'))counts.other++;
  else if(evidenceRecords[claim.id]?.status==='verified')counts.sourceFound++;
  else counts.needsEvidence++;
  return counts;
},{accepted:0,other:0,sourceFound:0,needsEvidence:0});
if(JSON.stringify(expectedCounts)!==JSON.stringify({accepted:3,other:5,sourceFound:22,needsEvidence:0}))throw new Error(`unexpected reconciled dashboard counts ${JSON.stringify(expectedCounts)}`);
for(const id of ['CL-009','CL-016']){
  const claim=caseData.claims.find(item=>item.id===id);
  if(claim.billingNpi!=='••••1029')throw new Error(`${id} must distinguish the billing NPI from the rendering provider`);
}
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
