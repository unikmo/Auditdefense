import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {}, fetch: () => Promise.reject(new Error('offline')), console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('public/attorney-response-guidance.js', 'utf8'), context);
const tool = context.window.AuditDefendAttorneyResponseGuidance;

assert.deepEqual(Array.from(tool.issueFor('Which NPI was billing, rendering or contracting?')), ['provider-npi-enrollment']);
assert.equal(tool.relatedCases('documentation support', [{relatedIssueIds:['documentation-support'] }]).length, 1);

const brief = { facts: [{fact:'The sample records 27 of 30 lines as unsupported after rebuttal.',status:'Calculated',source:'worksheet'}] };
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

const noTrigger = tool.checkDraft('The provider disputes the stated audit findings.', brief);
assert.equal(noTrigger[0].id, 'manual-review');
assert.match(noTrigger[0].detail, /does not verify/);

console.log('Attorney response guidance and consistency checks passed.');
