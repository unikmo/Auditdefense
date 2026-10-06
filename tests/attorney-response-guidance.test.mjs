import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sampleReferences = [{
  id: 'sample-ref',
  relatedIssueIds: ['erisa-assignment-standing'],
  caseName: 'Example Case',
  citation: '1 F.4th 1',
  court: 'Example Court',
  decisionDate: '2024-01-01',
  precedentialStatus: 'Published',
  proceduralPosture: 'Appeal from judgment.',
  disposition: 'Affirmed.',
  holdingSummary: 'The court decided the issue presented.',
  materialFacts: 'Facts described in the opinion.',
  relevance: 'Related issue tag.',
  limitations: 'Different procedural posture.',
  source: { url: 'https://example.gov/opinion', publisher: 'Example Court', locator: 'Page 2', verifiedOn: '2026-10-06' }
}];
const context = {
  window: {},
  fetch: async () => ({ ok: true, json: async () => ({ cases: sampleReferences }) }),
  console: { warn() {} }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('public/attorney-response-guidance.js', 'utf8'), context);
const tool = context.window.AuditDefendAttorneyResponseGuidance;
await tool.ready;

const enrollmentIssues = Array.from(tool.issueFor('Which NPI was billing, rendering or contracting?'));
assert(enrollmentIssues.includes('provider-npi-enrollment'));
assert(enrollmentIssues.includes('credentialing-network'));
assert.equal(tool.relatedCases('documentation support', sampleReferences).length, 0, 'issue tagging must not imply that an unrelated opinion is similar');
assert.equal(tool.relatedCases('ERISA assignment and standing', sampleReferences).length, 1);
assert.equal(tool.relatedCases('provider NPI enrollment', sampleReferences).length, 0);

const brief = { facts: [{fact:'The sample records 27 of 30 lines as unsupported after rebuttal.',status:'Calculated',source:'worksheet'}], questions: [] };
const denominator = tool.checkDraft('27 of 30 claims were unsupported (73%).', brief);
assert(denominator.some(item => item.id === 'denominator'));

const eliminated = tool.checkDraft('The findings were essentially eliminated.', brief);
assert(eliminated.some(item => item.id === 'rebuttal-result'));

const stages = tool.checkDraft('The $64,733 and $567,096.77 demand are the same demand.', brief);
assert(stages.some(item => item.id === 'demand-stages'));

const product = tool.checkDraft('CHP and Medicaid managed care use the same six-year lookback.', brief);
assert(product.some(item => item.id === 'product-line'));

const prediction = tool.checkDraft('No court will allow this recovery.', brief);
assert(prediction.some(item => item.id === 'outcome-prediction'));

const admission = tool.checkDraft('Anthem legally acknowledged the care and cannot conduct a clinical audit while alleging non-enrollment.', brief);
assert(admission.some(item => item.id === 'legal-effect-inference'));
assert(admission.some(item => item.id === 'clinical-admission'));

const enrollmentDuty = tool.checkDraft('The insurer had the duty to verify enrollment.', brief);
assert(enrollmentDuty.some(item => item.id === 'enrollment-duty'));

const noTrigger = tool.checkDraft('The provider disputes the stated audit findings.', brief);
assert.equal(noTrigger[0].id, 'manual-review');
assert.match(noTrigger[0].detail, /does not verify/);

const markup = tool.render({
  facts: [{fact:'Group NPI history is provider-reported.',status:'Provider-reported',source:'Provider email'}],
  providerReportedSchedule: [{title:'Group NPI',amount:'$155,576.77',period:'2021–2026',detail:'Aggregate email facts only.',source:'October 6 email',needed:'Claim-level list and paid dates.'}],
  questions: [{question:'What documentation applies?',currentAnswer:'Records are identified.',needed:'Check the complete claim match.',significance:'Counsel reviews the issue.'}]
}, 'case-1');
assert.match(markup, /Claim and policy issue map/);
assert.match(markup, /Claim and demand breakdown reported to counsel/);
assert.match(markup, /not verified payer findings/);
assert.match(markup, /Attorney decides strategy/);
assert.match(markup, /Example Case/);
assert.match(markup, /Party arguments or strategy described in the opinion/);
assert.match(markup, /not saved or sent/);
assert.match(markup, /limited rules-based screen/);

console.log('Attorney response guidance and consistency checks passed.');
