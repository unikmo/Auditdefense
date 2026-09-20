import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const provider=readFileSync(new URL('../public/provider-onboarding.html',import.meta.url),'utf8');
const attorney=readFileSync(new URL('../public/attorney-workspace.html',import.meta.url),'utf8');
const directory=readFileSync(new URL('../public/attorneys.html',import.meta.url),'utf8');
const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');

for(const value of ['existing','outside','directory','match','later'])assert.match(provider,new RegExp(`name="counselPath" value="${value}"`));
for(const status of ['Invitation sent','Conflict check pending','Engagement confirmed','Provider grants access']){
  assert.ok(provider.includes(status)||attorney.includes(status)||rules.includes(status),status);
  assert.ok(rules.includes(status),`rules missing ${status}`);
}
assert.match(provider,/invitation does not create an attorney-client relationship/i);
assert.match(provider,/Legal fees are contracted and paid directly/i);
assert.match(attorney,/>\$999</);
assert.match(attorney,/>\$1,499</);
assert.match(attorney,/>\$1,999</);
assert.doesNotMatch(attorney,/Standard case<\/span><strong>\$299/);
assert.match(directory,/not a participating-attorney profile/i);
assert.match(directory,/does not rank attorneys/i);
console.log('Engagement UI contract tests passed.');
