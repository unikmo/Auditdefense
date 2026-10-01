import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const brief=readFileSync(new URL('../public/attorney-case-brief.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../public/app.html',import.meta.url),'utf8');
const data=readFileSync(new URL('../public/case-data.js',import.meta.url),'utf8');
const attorney=readFileSync(new URL('../public/attorney-workspace.html',import.meta.url),'utf8');
const attorneyJs=readFileSync(new URL('../public/attorney.js',import.meta.url),'utf8');
const attorneyTheme=readFileSync(new URL('../public/attorney-elite-blue.css',import.meta.url),'utf8');
const sharedEvidence=readFileSync(new URL('../public/case-evidence-data.js',import.meta.url),'utf8');
const evidenceWorkspace=readFileSync(new URL('../public/evidence-workspace.js',import.meta.url),'utf8');

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
assert.match(data,/located97153Matches:47[\s\S]*located97155Matches:32/,'Private source-repository inventory counts missing.');
assert.match(brief,/repository presence does not prove that the same version was produced to or reviewed by Anthem/i,'Source-version limitation missing.');
assert.match(brief,/Any conclusion remains subject to attorney review and decision/i,'Attorney-review limitation missing from repository comparison.');
for(const value of ['Accepted by payer','Evidence available for rebuttal review','Still missing a source match','Enrollment or other issue']){
  assert.ok(brief.includes(value),`Attorney evidence summary missing ${value}`);
}
assert.match(brief,/All 30 later CPT 97155 payer-review rows were matched/i,'Attorney brief does not reflect the completed claim/evidence crosswalk.');
assert.match(brief,/rendering provider separately from the group billing NPI/i,'Attorney brief conflates rendering and billing NPI roles.');
assert.match(attorney,/Provider records were located for all 22 documentation findings/i,'Attorney next step does not reflect the shared provider evidence status.');
assert.match(attorney,/attorney-elite-blue\.css/,'Attorney workspace is not using the elite-blue theme.');
assert.match(attorneyTheme,/--att-brown:#0b2341/,'Attorney elite-blue theme tokens are missing.');
for(const value of ['ATTORNEY CASE DASHBOARD','Follow the evidence from request to result','RECOMMENDED NEXT STEP','OTHER INSURER FINDINGS']){
  assert.ok(attorney.includes(value),`Attorney dashboard missing ${value}`);
}
for(const value of ['Case home','Claims &amp; evidence','Documents','Facts &amp; issues','Counsel review','Counsel notes','Provider access']){
  assert.ok(attorney.includes(value),`Attorney navigation missing ${value}`);
}
for(const value of ['Requested by insurer','Evidence submitted to insurer','Evidence accepted by insurer','Insurer says evidence is missing','Provider evidence located','Provider evidence still missing']){
  assert.ok(attorneyJs.includes(value),`Attorney dashboard summary missing ${value}`);
}
assert.doesNotMatch(attorney,/Counsel review queue|Exposure by issue family|Upcoming deadlines<\/h2>/,'Dense secondary panels remain on the attorney dashboard.');
assert.match(attorneyTheme,/\.attorney-case-kpis\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'Attorney evidence path cards do not mirror the provider dashboard.');
assert.match(attorneyJs,/value==='payer-missing'[\s\S]*value==='provider-missing'/,'Attorney claim filters do not preserve the insurer/provider distinction.');
assert.match(attorney,/case-evidence-data\.js/,'Attorney workspace does not load the shared provider evidence source.');
assert.match(app,/case-evidence-data\.js[\s\S]*evidence-workspace\.js/,'Provider/counsel evidence workspace does not load shared evidence before its UI.');
assert.match(evidenceWorkspace,/window\.AuditDefendEvidenceCaseSeed/,'Evidence workspace does not use the shared case-evidence source.');
for(const value of ['Shared provider and attorney claim record','Everything supplied by the provider','Provider-supplied records and source locations','Payer submission','Question for counsel']){
  assert.ok(attorneyJs.includes(value),`Attorney shared case record missing ${value}`);
}
for(const value of ['provider signature reported missing','technician session / SOAP note reported missing','Billing NPI reported not enrolled']){
  assert.ok(sharedEvidence.includes(value),`Shared provider evidence seed missing ${value}`);
}
assert.match(attorneyJs,/auditdefend-provider-evidence-demo-v3[\s\S]*auditdefend-evidence-verification-v1/,'Attorney case file does not read both provider evidence stores.');

console.log('Case chronology, provenance and legal-boundary tests passed.');
