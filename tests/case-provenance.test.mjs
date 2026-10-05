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
assert.match(attorneyJs,/Provider states all requested records were shipped by hard copy and USB/i,'Attorney case details do not reflect the provider-reported submission.');
assert.match(attorney,/attorney-elite-blue\.css/,'Attorney workspace is not using the elite-blue theme.');
assert.match(attorneyTheme,/--att-brown:#0b2341/,'Attorney elite-blue theme tokens are missing.');
for(const value of ['FIRM PORTFOLIO','Cases, priorities and upcoming dates','Cases needing attention','Upcoming timeline']){
  assert.ok(attorney.includes(value),`Attorney dashboard missing ${value}`);
}
assert.doesNotMatch(attorney,/case-drawer|drawer-overlay/,'Attorney case details must not appear in an overlay or drawer.');
assert.match(attorney,/attorney-view-case-detail[\s\S]*casePageContent/,'Attorney case detail needs a dedicated full-page view.');
assert.match(attorneyJs,/function openCase\(c\)[\s\S]*view\('case-detail'\)/,'Opening a case must navigate to the dedicated case page.');
assert.match(attorneyJs,/function selectCaseTab\(name,button\)[\s\S]*data-case-panel[\s\S]*scrollIntoView/,'Choosing a case section must bring the selected section into view.');
assert.match(attorneyJs,/portfolioTimeline[\s\S]*upcoming\.slice/,'Portfolio timeline should list only upcoming verified dates.');
assert.match(attorneyTheme,/\.case-tab-panel \.fact-table td::before\{content:attr\(data-label\)/,'Case evidence tables must become labeled cards on small screens.');
for(const value of ['Case home','Clients','Cases','Timelines','Counsel notes','Provider access']){
  assert.ok(attorney.includes(value),`Attorney navigation missing ${value}`);
}
for(const value of ['Claims & evidence','Documents','Facts','Legal review']){
  assert.ok(attorneyJs.includes(value),`Attorney case detail section missing ${value}`);
}
for(const value of ['Requested by insurer','Provider reports evidence submitted','Accepted by insurer','Documentation findings','Enrollment or other findings','Provider evidence located','Provider evidence still missing']){
  assert.ok(attorneyJs.includes(value),`Attorney dashboard summary missing ${value}`);
}
assert.equal((attorneyJs.match(/title:'Comments'/g)||[]).length,3,'Every attorney stage that previously had two cards must include a third comments card.');
assert.doesNotMatch(attorneyJs,/\],2\)[+;]/,'Attorney dashboard still contains a two-card stage.');
for(const value of ['60 requested · 60 provider-reported as submitted','30 = 3 accepted + 22 documentation findings + 5 enrollment/other','22 = 22 records located + 0 records still missing']){
  assert.ok(attorneyJs.includes(value),`Attorney stage arithmetic missing ${value}`);
}
for(const value of ['OPEN ISSUE · ENROLLMENT / REGISTRATION','enrollment + documentation','enrollment only','Provider says evidence exists; upload pending']){
  assert.ok(attorneyJs.includes(value),`Attorney enrollment-response workflow missing ${value}`);
}
assert.match(attorneyJs,/enrollment:enrollmentClaims\.length,'enrollment-doc':enrollmentWithDocumentation\.length,'enrollment-only':enrollmentOnly\.length/,'Attorney enrollment filter badges must show the 27, 22 and 5 claim counts.');
assert.match(attorneyJs,/issueResponses:\{\}[\s\S]*appliesTo\?\.includes/,'Attorney workspace does not read provider yes/no responses and multi-claim evidence scope.');
assert.doesNotMatch(attorney,/Counsel review queue|Exposure by issue family|Upcoming deadlines<\/h2>/,'Dense secondary panels remain on the attorney dashboard.');
assert.match(attorneyTheme,/\.attorney-case-kpis\{display:grid;gap:18px/,'Attorney staged evidence layout is missing.');
assert.match(attorneyTheme,/\.attorney-stage-grid\.cols-3\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'Attorney later-worksheet arithmetic is not shown as three equal categories.');
assert.match(attorneyJs,/value==='payer-missing'[\s\S]*value==='provider-missing'/,'Attorney claim filters do not preserve the insurer/provider distinction.');
assert.match(attorneyJs,/if\(o\.dataset\.caseOpenFilter\)\{const button=[\s\S]*filterAttorneyEvidence\(o\.dataset\.caseOpenFilter,button\)\}/,'Attorney dashboard group filters depend on obsolete filter buttons.');
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
