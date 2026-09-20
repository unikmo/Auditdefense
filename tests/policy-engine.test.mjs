import fs from 'node:fs';
import vm from 'node:vm';

function loadBrowserScript(path){
  const context={window:{}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
  return context.window;
}

const policyWindow=loadBrowserScript('public/policy-engine.js');
const recoveryWindow=loadBrowserScript('public/recovery-engine.js');
const referenceWindow=loadBrowserScript('public/reference-engine.js');

const recoveryRules=JSON.parse(fs.readFileSync('data/recovery-rules.json','utf8')).rules;
const commercial=recoveryWindow.AuditDefendRecoveryEngine.evaluate(
  {paymentReceivedDate:'2024-08-01',recoveryInitiatedDate:'2026-09-02',noticeDate:'2026-08-01'},
  recoveryRules,
  {state:'NY',program:'Commercial'}
);
if(commercial.status!=='POTENTIALLY_OUTSIDE_WINDOW') throw new Error('Expected 25-month NY commercial example to flag potential outside-window recovery.');

const medicaid=recoveryWindow.AuditDefendRecoveryEngine.evaluate(
  {paymentReceivedDate:'2024-08-01',recoveryInitiatedDate:'2026-09-02',noticeDate:'2026-08-01'},
  recoveryRules,
  {state:'NY',program:'NY Medicaid Managed Care'}
);
if(medicaid.status!=='WITHIN_CONFIGURED_WINDOW') throw new Error('Expected 25-month NY Medicaid Managed Care example to remain within 72-month window.');

const claim={id:'T-1',dos:'2026-09-01',issues:['Documentation support']};
const context={state:'NY',payer:'Anthem',program:'NY Medicaid Managed Care',dosPrecision:'EXACT_DOS'};
const baseRule={
  id:'T-RULE',
  title:'Test rule',
  appliesTo:{state:'NY',payer:'Anthem'},
  issueFamilies:['Documentation support'],
  effectiveFrom:'2026-01-01'
};
const noCitation=policyWindow.AuditDefendPolicyEngine.evaluateClaim(claim,[baseRule],context,{mismatchVerified:true});
if(noCitation.status!=='HUMAN_REVIEW_REQUIRED') throw new Error('Policy conflict must not be emitted without a citation.');

const withCitation=policyWindow.AuditDefendPolicyEngine.evaluateClaim(claim,[{...baseRule,citation:{sourceTitle:'Test',sourceUrl:'https://example.com',deepLink:'https://example.com#x',locator:'Section 1',excerpt:'Short source excerpt.'}}],context,{mismatchVerified:true});
if(withCitation.status!=='POLICY_CONFLICT_CANDIDATE') throw new Error('Verified mismatch with citation should permit policy conflict candidate.');

const issueFamilies=JSON.parse(fs.readFileSync('data/issue-families.json','utf8')).issueFamilies;
if(fs.readFileSync('data/issue-families.json','utf8')!==fs.readFileSync('public/issue-families.json','utf8'))throw new Error('Public issue taxonomy must match the canonical data file.');
const expectedIssueIds=['documentation-support','signatures-authentication','assessment-treatment-plan','provider-npi-enrollment','authorization-units','credentialing-network','coding-ncci'];
if(issueFamilies.length!==7) throw new Error('The approved taxonomy must contain exactly seven issue families.');
if(new Set(issueFamilies.map(item=>item.id)).size!==7) throw new Error('Issue family identifiers must be unique.');
for(const id of expectedIssueIds){if(!issueFamilies.some(item=>item.id===id))throw new Error('Missing approved issue family: '+id)}

const references=JSON.parse(fs.readFileSync('data/reference-cases.json','utf8')).cases;
if(fs.readFileSync('data/reference-cases.json','utf8')!==fs.readFileSync('public/reference-cases.json','utf8'))throw new Error('Public reference library must match the canonical data file.');
const forbiddenFields=['prediction','likelyOutcome','winProbability','winRate','score','confidence'];
for(const item of references){
  for(const field of ['id','caseName','citation','court','jurisdiction','decisionDate','precedentialStatus','proceduralPosture','disposition','holdingSummary','materialFacts','relevance','limitations','source']){
    if(!item[field])throw new Error('Verified reference '+(item.id||'(missing id)')+' lacks '+field+'.');
  }
  if(!Array.isArray(item.relatedIssueIds)||!item.relatedIssueIds.length)throw new Error('Verified reference '+item.id+' must map to an approved issue.');
  for(const id of item.relatedIssueIds){if(!expectedIssueIds.includes(id))throw new Error('Verified reference '+item.id+' uses an unknown issue family.');}
  if(!item.source.url.startsWith('https://'))throw new Error('Verified reference '+item.id+' must use an HTTPS source.');
  if(!new URL(item.source.url).hostname.endsWith('.gov'))throw new Error('Initial verified reference '+item.id+' must link to an official government source.');
  if(!item.source.publisher||!item.source.locator||!item.source.verifiedOn)throw new Error('Verified reference '+item.id+' lacks source-verification metadata.');
  for(const field of forbiddenFields){if(Object.hasOwn(item,field))throw new Error('Predictive field is prohibited in reference records: '+field);}
}
const credentialingReferences=referenceWindow.AuditDefendReferenceEngine.filterCases(references,{issueId:'credentialing-network'});
if(credentialingReferences.length!==1||credentialingReferences[0].id!=='spinedex-v-united-2014')throw new Error('Issue filtering must return only matching historical references.');
const researchResult=referenceWindow.AuditDefendReferenceEngine.buildReferenceResult(references[0]);
if(researchResult.resultType!=='HISTORICAL_REFERENCE')throw new Error('Reference output must be explicitly historical.');
for(const field of forbiddenFields){if(Object.hasOwn(researchResult,field))throw new Error('Reference engine emitted prohibited predictive field: '+field);}

const coverage=JSON.parse(fs.readFileSync('data/national-coverage.json','utf8'));
if(fs.readFileSync('data/national-coverage.json','utf8')!==fs.readFileSync('public/national-coverage.json','utf8'))throw new Error('Public national coverage ledger must match the canonical data file.');
if(coverage.targetPercent<95)throw new Error('Nationwide coverage target must remain at least 95%.');
if(coverage.measuredClaimReadyPercent!==null&&coverage.measuredClaimReadyPercent<0)throw new Error('Measured claim-ready coverage must be null until baselined or a non-negative percentage.');
if(coverage.payerFamilies.length<30)throw new Error('National payer universe must include national and regional payer families.');
const validCoverageStatuses=new Set(['CLAIM_READY','MONITORED_LIBRARY','SOURCE_IDENTIFIED','GAP']);
for(const item of [...coverage.payerFamilies,...coverage.governmentPrograms]){
  if(!item.id||!item.name||!validCoverageStatuses.has(item.status))throw new Error('Invalid national coverage record: '+(item.id||'missing id'));
}
const stateMedicaid=coverage.governmentPrograms.find(item=>item.id==='state-medicaid');
if(!stateMedicaid||stateMedicaid.jurisdictions.length!==51)throw new Error('National ledger must include all 50 state Medicaid programs and the District of Columbia.');
if(!coverage.requiredDimensions.includes('effectiveFrom')||!coverage.requiredDimensions.includes('payerLegalEntity'))throw new Error('Coverage cannot be counted without entity and effective-date dimensions.');
const sourceRegistry=JSON.parse(fs.readFileSync('data/policy-sources.json','utf8'));
if(fs.readFileSync('data/policy-sources.json','utf8')!==fs.readFileSync('public/policy-sources.json','utf8'))throw new Error('Public policy source registry must match the canonical data file.');
if(sourceRegistry.sources.length<50)throw new Error('Nationwide source registry must include at least 50 official source endpoints.');
if(new Set(sourceRegistry.sources.map(item=>item.id)).size!==sourceRegistry.sources.length)throw new Error('Policy source identifiers must be unique.');

console.log('Policy, recovery, issue taxonomy, and verified-reference tests passed.');
