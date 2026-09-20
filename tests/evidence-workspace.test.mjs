import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../public/app.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/evidence-workspace.js',import.meta.url),'utf8');

for(const id of ['view-evidence','providerEvidenceForm','attorneyEvidenceForm','evidenceNotifications','evidenceActivity']){
  assert.match(html,new RegExp(`id=["']${id}["']`),`Missing evidence workspace element: ${id}`);
}

for(const label of [
  'Potential contradiction — attorney review required',
  'Unresolved — additional evidence required',
  'Evidence appears to address payer finding',
  'Payer finding supported by current record'
]) assert.ok(js.includes(label),`Missing non-conclusive evidence status: ${label}`);

assert.ok(js.includes("visibility:'counsel-only'"),'Attorney seed material must default to counsel-only.');
assert.ok(js.includes("state.role==='attorney'||item.visibility==='shared'"),'Provider view must exclude counsel-only material.');
assert.ok(html.includes('Files selected here remain on this device'),'Local-only evidence boundary must be visible.');
assert.ok(js.includes('New counsel item in your AuditDefend workspace.'),'Provider notification copy must omit claim and patient details.');
assert.ok(!js.toLowerCase().includes('rebuttal not justified'),'Workspace must not make the requested legal conclusion.');

console.log('Evidence-verification workflow contract tests passed.');
