import assert from 'node:assert/strict';
import pricing from '../public/pricing.js';

assert.equal(pricing.tierFor(''),null,'Empty exposure should not select a tier.');
assert.equal(pricing.tierFor(0).id,'essential');
assert.equal(pricing.tierFor(100000).id,'essential');
assert.equal(pricing.tierFor(100000.01).id,'priority');
assert.equal(pricing.tierFor(250000).id,'priority');
assert.equal(pricing.tierFor(250000.01).id,'major');

assert.equal(pricing.quote({exposure:100000}).amount,999);
assert.equal(pricing.quote({exposure:100000,memberStatus:'member90'}).amount,299);
assert.equal(pricing.quote({exposure:200000,memberStatus:'annualEligible'}).amount,449);
assert.equal(pricing.quote({exposure:300000,memberStatus:'memberNew'}).amount,1999);

const complex=pricing.quote({exposure:90000,claimCount:501,multiplePayers:true,unstructuredData:true});
assert.equal(complex.scopeReview,true);
assert.deepEqual(complex.scopeReasons,['More than 500 claim lines','Multiple payers','Unstructured claim data']);
assert.equal(complex.amount,999,'Scope review should preserve the displayed exposure tier pending review.');

console.log('Pricing tests passed.');
