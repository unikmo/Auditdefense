import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const brief=readFileSync(new URL('../public/attorney-case-brief.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../public/app.html',import.meta.url),'utf8');
const data=readFileSync(new URL('../public/case-data.js',import.meta.url),'utf8');

for(const value of ['$64,733.00','$160.00','$64,573.00','$567,096.77']){
  assert.ok(brief.includes(value),`Attorney brief missing amount ${value}`);
}
for(const value of ['December 12, 2024','March 13, 2026','March 20, 2026','April 14, 2026']){
  assert.ok(brief.includes(value),`Attorney brief missing chronology date ${value}`);
}
assert.match(brief,/31 of 32[\s\S]*8 of 30[\s\S]*denominator/i,'Count conflict must remain explicit.');
assert.match(brief,/provider-prepared[\s\S]*not itself a payer determination/i,'Provider support map must not be characterized as a payer finding.');
assert.match(brief,/subject to attorney review and decision/i,'Attorney decision boundary missing.');
assert.doesNotMatch(brief,/destroys Anthem|upper hand|pay \$0|textbook example|legally acknowledged/i,'Brief contains an unsupported legal conclusion.');
assert.match(app,/distinct demand stages that must not be collapsed/i,'Provider workspace must separate demand stages.');
assert.match(data,/initialDemand:64733[\s\S]*direct97153:160[\s\S]*extrapolated97155:64573/,'Structured source amounts missing.');

console.log('Case chronology, provenance and legal-boundary tests passed.');
