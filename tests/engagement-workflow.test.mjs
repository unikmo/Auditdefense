import assert from 'node:assert/strict';
import engagement from '../public/engagement-workflow.js';

const {STATUS}=engagement;
assert.deepEqual(engagement.PRIMARY,[
  'Invitation sent','Conflict check pending','Engagement confirmed','Provider grants access'
]);
assert.equal(engagement.documentsVisible(STATUS.INVITATION_SENT),false);
assert.equal(engagement.documentsVisible(STATUS.CONFLICT_PENDING),false);
assert.equal(engagement.documentsVisible(STATUS.ENGAGEMENT_CONFIRMED),false);
assert.equal(engagement.documentsVisible(STATUS.ACCESS_GRANTED),true);
assert.equal(engagement.assertTransition(STATUS.INVITATION_SENT,STATUS.CONFLICT_PENDING,'attorney'),true);
assert.equal(engagement.assertTransition(STATUS.CONFLICT_PENDING,STATUS.ENGAGEMENT_CONFIRMED,'attorney'),true);
assert.equal(engagement.assertTransition(STATUS.ENGAGEMENT_CONFIRMED,STATUS.ACCESS_GRANTED,'provider'),true);
assert.throws(()=>engagement.assertTransition(STATUS.INVITATION_SENT,STATUS.ACCESS_GRANTED,'provider'));
assert.throws(()=>engagement.assertTransition(STATUS.ENGAGEMENT_CONFIRMED,STATUS.ACCESS_GRANTED,'attorney'));
assert.deepEqual(engagement.includedIntroductions(2),{used:2,limit:3,remaining:1,included:true});
assert.deepEqual(engagement.includedIntroductions(3),{used:3,limit:3,remaining:0,included:false});
console.log('Engagement workflow tests passed.');
