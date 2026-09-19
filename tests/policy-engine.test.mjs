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

console.log('Policy/recovery engine tests passed.');
