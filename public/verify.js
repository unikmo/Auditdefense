(() => {
  const firebaseState = document.getElementById('firebaseState');
  const caseState = document.getElementById('caseState');
  const refreshBtn = document.getElementById('refreshBtn');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const CASE_ID = 'anthem-redacted-smoke';

  const renderFirebase = () => {
    const s = window.AuditDefendFirebase;
    if (!s) {
      firebaseState.textContent = 'Firebase state unavailable.';
      return;
    }
    firebaseState.textContent = [
      `status: ${s.status}`,
      `auth: ${s.auth}`,
      `firestore: ${s.firestore}`,
      `storage: ${s.storage}`,
      `user: ${s.user?.email || 'not signed in'}`,
      s.error ? `error: ${s.error}` : ''
    ].filter(Boolean).join('\n');
  };

  const payload = () => ({
    title: window.AuditDefendCaseData.caseLabel,
    source: window.AuditDefendCaseData.source,
    assertedOverpayment: window.AuditDefendCaseData.assertedOverpayment,
    privacyNote: window.AuditDefendCaseData.privacyNote,
    claims: window.AuditDefendCaseData.claims
  });

  const api = () => {
    if (!window.AuditDefendFirebaseAPI) throw new Error('Firebase API is not ready yet.');
    return window.AuditDefendFirebaseAPI;
  };

  const showCase = (text, ok = false) => {
    caseState.textContent = text;
    caseState.classList.toggle('ok-line', ok);
    caseState.classList.toggle('bad-line', !ok);
  };

  document.addEventListener('auditdefend:firebase-status', renderFirebase);
  refreshBtn.addEventListener('click', renderFirebase);

  saveBtn.addEventListener('click', async () => {
    try {
      const result = await api().saveRedactedCase(CASE_ID, payload());
      showCase(`WRITE PASSED\ncollection: redactedCases\ncaseId: ${result.caseId}\nclaims: ${window.AuditDefendCaseData.claims.length}`, true);
    } catch (error) {
      showCase(`WRITE FAILED\n${error?.message || error}`);
    }
  });

  loadBtn.addEventListener('click', async () => {
    try {
      const result = await api().loadRedactedCase(CASE_ID);
      if (!result) throw new Error('No record found. Save it first.');
      const safe = result.redacted === true && result.containsPhi === false && Array.isArray(result.claims);
      showCase(`READ ${safe ? 'PASSED' : 'FAILED SAFETY CHECK'}\ncaseId: ${result.id}\nclaims: ${result.claims?.length ?? 0}\nredacted: ${result.redacted}\ncontainsPhi: ${result.containsPhi}`, safe);
    } catch (error) {
      showCase(`READ FAILED\n${error?.message || error}`);
    }
  });

  deleteBtn.addEventListener('click', async () => {
    try {
      await api().deleteRedactedCase(CASE_ID);
      showCase('DELETE PASSED\nSmoke-test record removed.', true);
    } catch (error) {
      showCase(`DELETE FAILED\n${error?.message || error}`);
    }
  });

  renderFirebase();
})();
