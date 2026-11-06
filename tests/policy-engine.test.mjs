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
const expectedIssueIds=['documentation-support','signatures-authentication','assessment-treatment-plan','provider-npi-enrollment','authorization-units','credentialing-network','coding-ncci','medical-necessity'];
if(issueFamilies.length!==8) throw new Error('The approved taxonomy must contain exactly eight issue families.');
if(new Set(issueFamilies.map(item=>item.id)).size!==8) throw new Error('Issue family identifiers must be unique.');
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

console.log('Policy, recovery, issue taxonomy, and verified-reference tests passed.');

// Medicare rule data (federal authority, excerpts verified against source text when generated)
const policyRules=JSON.parse(fs.readFileSync('data/policy-rules.json','utf8')).rules;
if(fs.readFileSync('data/policy-rules.json','utf8')!==fs.readFileSync('public/policy-rules.json','utf8'))throw new Error('Public policy rules must match the canonical data file.');
if(fs.readFileSync('data/recovery-rules.json','utf8')!==fs.readFileSync('public/recovery-rules.json','utf8'))throw new Error('Public recovery rules must match the canonical data file.');
if(fs.readFileSync('data/policy-sources.json','utf8')!==fs.readFileSync('public/policy-sources.json','utf8'))throw new Error('Public policy sources must match the canonical data file.');
const knownFamilies=new Set(['Documentation support','Signatures / authentication','Assessment / treatment plan','Provider / NPI enrollment','NPI enrollment on DOS','Authorization / units','Credentialing / network','Coding / NCCI','Medical necessity']);
const ruleIds=new Set(),sourceIdSet=new Set(JSON.parse(fs.readFileSync('data/policy-sources.json','utf8')).sources.map(s=>s.id));
for(const rule of policyRules){
  if(ruleIds.has(rule.id))throw new Error('Duplicate policy rule id: '+rule.id);ruleIds.add(rule.id);
  const c=rule.citation;
  if(!c||!c.sourceUrl||!c.locator||!c.excerpt||!c.deepLink)throw new Error('Rule '+rule.id+' lacks a complete citation.');
  if(!c.sourceUrl.startsWith('https://'))throw new Error('Rule '+rule.id+' must cite an HTTPS source.');
  if(!sourceIdSet.has(rule.sourceId))throw new Error('Rule '+rule.id+' references a source that is not monitored: '+rule.sourceId);
  for(const family of rule.issueFamilies||[]){if(!knownFamilies.has(family))throw new Error('Rule '+rule.id+' uses unknown issue family '+family);}
  if(!(rule.issueFamilies||[]).length&&!rule.crossCutting)throw new Error('Rule '+rule.id+' has no issue family and is not marked cross-cutting.');
}
const medicareRules=policyRules.filter(r=>r.appliesTo?.program==='Medicare');
if(medicareRules.length<20)throw new Error('Expected the Medicare rule set to be loaded.');
for(const id of ['MEDICARE-THERAPY-PLAN-CONTENT-410-61','MEDICARE-HOSPICE-PROGNOSIS-418-22','MEDICARE-HOME-HEALTH-FACE-TO-FACE-424-22','MEDICARE-EXTRAPOLATION-CONDITION-1893F3']){if(!ruleIds.has(id))throw new Error('Missing Medicare rule '+id);}
const medicareClaim={id:'M-1',dos:'2026-03-01',issues:['Assessment / treatment plan']};
const medicareEval=policyWindow.AuditDefendPolicyEngine.evaluateClaim(medicareClaim,policyRules,{program:'Medicare',state:'NY',dosPrecision:'EXACT_DOS'},{mismatchVerified:false});
if(!JSON.stringify(medicareEval).includes('MEDICARE-THERAPY-PLAN'))throw new Error('Medicare plan-of-care rules should match a Medicare treatment-plan finding.');

const medicareReopen=recoveryWindow.AuditDefendRecoveryEngine.evaluate(
  {initialDeterminationDate:'2025-01-15',recoveryInitiatedDate:'2026-03-01'},
  recoveryRules,{program:'Medicare',state:'NY'}
);
if(medicareReopen.status!=='POTENTIALLY_OUTSIDE_WINDOW'||medicareReopen.deadline!=='2026-01-15')throw new Error('Medicare reopening after 12 months should flag potential outside-window (good cause may extend it).');
if(medicareReopen.noticeStatus!=='NOT_APPLICABLE')throw new Error('Medicare reopening rule has no notice period.');
const medicareInside=recoveryWindow.AuditDefendRecoveryEngine.evaluate(
  {initialDeterminationDate:'2025-06-01',recoveryInitiatedDate:'2026-03-01'},
  recoveryRules,{program:'Medicare',state:'NY'}
);
if(medicareInside.status!=='WITHIN_CONFIGURED_WINDOW')throw new Error('Medicare reopening inside 12 months should be within window.');
const advantage=recoveryWindow.AuditDefendRecoveryEngine.evaluate({initialDeterminationDate:'2025-01-15',recoveryInitiatedDate:'2026-03-01'},recoveryRules,{program:'Medicare Advantage',state:'TX'});
if(advantage.status!=='NO_RULE_CONFIGURED')throw new Error('Medicare reopening rule must not be applied to Medicare Advantage plans.');
console.log('Medicare rule data tests passed.');

// States, commercial payers, Medicare Advantage and coverage-determination rules
const byId=id=>policyRules.find(r=>r.id===id);
for(const id of ['CA-INS-10133-66-OVERPAYMENT-365-DAYS','FL-627-6131-18-LICENSED-PROFESSIONALS-12-MONTHS','UHC-COMM-MAX-FOUR-TIMED-CODES-R0101','FIDELIS-ABA-PROTOCOL-MODIFICATION-97155-CPBH105','EMBLEM-HAB-REHAB-MODIFIERS-96-97-RPC20240052','MEDICARE-ADVANTAGE-COVERAGE-CRITERIA-422-101','MEDICARE-NCD-BINDING-405-1060','MEDICARE-LCD-DEFERENCE-405-1062','MEDICARE-HOSPICE-AGGREGATE-CAP-418-309']){if(!byId(id))throw new Error('Missing rule '+id);}
const fidelisClaim={id:'F-1',dos:'2026-03-01',issues:['Documentation support']};
const fidelisEval=policyWindow.AuditDefendPolicyEngine.evaluateClaim(fidelisClaim,policyRules,{payer:'Fidelis Care',state:'NY',program:'NY Medicaid Managed Care',dosPrecision:'EXACT_DOS'},{mismatchVerified:false});
if(!JSON.stringify(fidelisEval).includes('FIDELIS-ABA'))throw new Error('Fidelis ABA documentation rules should match a Fidelis documentation finding (payer name matched loosely).');
const uhcEval=policyWindow.AuditDefendPolicyEngine.evaluateClaim({id:'U-1',dos:'2026-03-01',issues:['Authorization / units']},policyRules,{payer:'United Healthcare',state:'TX',program:'Commercial',dosPrecision:'EXACT_DOS'},{mismatchVerified:false});
if(!JSON.stringify(uhcEval).includes('UHC-COMM-TIMED-CODE'))throw new Error('UnitedHealthcare timed-code rules should match a United unit finding.');
const anthemOnly=policyWindow.AuditDefendPolicyEngine.evaluateClaim({id:'U-2',dos:'2026-03-01',issues:['Authorization / units']},policyRules,{payer:'Aetna',state:'TX',program:'Commercial',dosPrecision:'EXACT_DOS'},{mismatchVerified:false});
if(JSON.stringify(anthemOnly).includes('UHC-COMM'))throw new Error('UnitedHealthcare rules must not attach to an Aetna case.');

const caWithin=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2025-03-01',recoveryInitiatedDate:'2026-02-28'},recoveryRules,{state:'CA',program:'Commercial'});
if(caWithin.status!=='WITHIN_CONFIGURED_WINDOW'||caWithin.deadline!=='2026-03-01')throw new Error('California 365-day window: day 364 should be within; deadline is payment + 365 days.');
const caOutside=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2025-03-01',recoveryInitiatedDate:'2026-03-02'},recoveryRules,{state:'CA',program:'Commercial'});
if(caOutside.status!=='POTENTIALLY_OUTSIDE_WINDOW')throw new Error('California recovery after 365 days should flag.');
const flGeneral=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2024-01-01',recoveryInitiatedDate:'2026-05-01'},recoveryRules,{state:'FL',program:'Commercial'});
if(flGeneral.months!==30||flGeneral.status!=='WITHIN_CONFIGURED_WINDOW')throw new Error('Florida general window is 30 months.');
const flChiro=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2024-01-01',recoveryInitiatedDate:'2026-05-01'},recoveryRules,{state:'FL',program:'Commercial',providerType:'chiropractor'});
if(flChiro.months!==12||flChiro.status!=='POTENTIALLY_OUTSIDE_WINDOW')throw new Error('Florida licensed-professional window is 12 months.');
const noStateRule=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2024-01-01',recoveryInitiatedDate:'2026-05-01'},recoveryRules,{state:'MI',program:'Commercial'});
if(noStateRule.status!=='NO_RULE_CONFIGURED')throw new Error('States without a configured rule must say so, not borrow another state\u2019s window.');
const caMedicaid=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2024-01-01',recoveryInitiatedDate:'2026-05-01'},recoveryRules,{state:'CA',program:'Medi-Cal Medicaid'});
if(caMedicaid.status!=='NO_RULE_CONFIGURED')throw new Error('A commercial state window must not be applied to Medicaid.');
console.log('State, payer and coverage-determination rule tests passed.');

// State overpayment-recovery coverage
const recStates=new Set(recoveryRules.filter(r=>r.programClass==='commercial-health-plan').map(r=>r.jurisdiction));
for(const st of ['NY','CA','FL','TX','AZ','VA','WA','MD','OH','NJ','NC','GA','TN','KY','DC'])if(!recStates.has(st))throw new Error('Missing recovery rule for '+st);
if(recStates.size<47)throw new Error('Expected at least 47 jurisdictions with a commercial recovery rule, found '+recStates.size);
for(const r of recoveryRules){
  if(!r.citation||!r.citation.excerpt||!r.citation.sourceUrl)throw new Error('Recovery rule '+r.id+' lacks a citation.');
  if(r.programClass==='commercial-health-plan'&&!r.windowDays&&!r.windowMonths)throw new Error('Recovery rule '+r.id+' has no window.');
  if(r.sourceSupportStatus==='SECONDARY_SOURCE_ONLY'&&!/SECONDARY SOURCE/.test(r.citation.sourceTitle))throw new Error('Secondary-source rule '+r.id+' must say so in its citation title.');
}
const tx=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2026-01-01',recoveryInitiatedDate:'2026-08-01'},recoveryRules,{state:'TX',program:'Commercial'});
if(tx.status!=='POTENTIALLY_OUTSIDE_WINDOW'||tx.deadline!=='2026-06-30')throw new Error('Texas 180-day notice window should flag notice sent after day 180.');
const oh=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2024-01-15',recoveryInitiatedDate:'2026-03-01'},recoveryRules,{state:'OH',program:'Commercial'});
if(oh.status!=='POTENTIALLY_OUTSIDE_WINDOW'||oh.rule.sourceSupportStatus!=='SECONDARY_SOURCE_ONLY')throw new Error('Ohio two-year window should flag and be marked secondary-source.');
const md=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2026-01-01',recoveryInitiatedDate:'2026-09-01'},recoveryRules,{state:'MD',program:'Commercial'});
if(md.status!=='POTENTIALLY_OUTSIDE_WINDOW'||md.months!==6)throw new Error('Maryland six-month window should flag.');
console.log('State recovery coverage tests passed ('+recStates.size+' jurisdictions).');

// Administrative-rule and dental-scoped state rules
const nm=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2024-01-01',recoveryInitiatedDate:'2026-01-01'},recoveryRules,{state:'NM',program:'Commercial'});
if(nm.status!=='POTENTIALLY_OUTSIDE_WINDOW'||nm.months!==18)throw new Error('New Mexico 18-month rule (13.10.22.12 NMAC) should flag a 24-month-old payment.');
const ndDental=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2025-01-01',recoveryInitiatedDate:'2026-06-01'},recoveryRules,{state:'ND',program:'Commercial',providerType:'dentist'});
if(ndDental.status!=='POTENTIALLY_OUTSIDE_WINDOW')throw new Error('North Dakota dental 12-month rule should apply to dentists.');
const ndMedical=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2025-01-01',recoveryInitiatedDate:'2026-06-01'},recoveryRules,{state:'ND',program:'Commercial',providerType:'physician'});
if(ndMedical.status!=='NO_RULE_CONFIGURED')throw new Error('The North Dakota dental-only rule must not be applied to medical providers.');
if(!ruleIds.has('STATE-RI-RETROACTIVE-TERMINATION-RECOUPMENT-4-11'))throw new Error('Missing Rhode Island retroactive-termination rule.');
console.log('Administrative-rule tests passed.');

// Scoped state rules: Massachusetts behavioral health, Nevada dental
const maBh=recoveryWindow.AuditDefendRecoveryEngine.evaluate({claimSubmissionDate:'2025-01-01',recoveryInitiatedDate:'2026-06-01'},recoveryRules,{state:'MA',program:'Commercial',providerType:'behavioral health'});
if(maBh.status!=='POTENTIALLY_OUTSIDE_WINDOW'||maBh.rule.anchorField!=='claimSubmissionDate')throw new Error('Massachusetts behavioral-health 12-month rule runs from claim submission.');
const maOther=recoveryWindow.AuditDefendRecoveryEngine.evaluate({claimSubmissionDate:'2025-01-01',recoveryInitiatedDate:'2026-06-01'},recoveryRules,{state:'MA',program:'Commercial',providerType:'physician'});
if(maOther.status!=='NO_RULE_CONFIGURED')throw new Error('The Massachusetts behavioral-health rule must not apply to other provider types.');
const nvDental=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2025-01-01',recoveryInitiatedDate:'2026-06-01'},recoveryRules,{state:'NV',program:'Commercial',providerType:'dentist'});
if(nvDental.status!=='POTENTIALLY_OUTSIDE_WINDOW')throw new Error('Nevada dental 12-month rule should apply to dentists.');
const nvMedical=recoveryWindow.AuditDefendRecoveryEngine.evaluate({paymentReceivedDate:'2025-01-01',recoveryInitiatedDate:'2026-06-01'},recoveryRules,{state:'NV',program:'Commercial',providerType:'physician'});
if(nvMedical.status!=='NO_RULE_CONFIGURED')throw new Error('The Nevada dental-only rule must not apply to medical providers.');
console.log('Scoped state rule tests passed.');
