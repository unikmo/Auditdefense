(() => {
  const state = {
    status: 'not-configured',
    projectId: 'auditdefense-2cb01',
    auth: 'disabled',
    firestore: 'disabled',
    storage: 'disabled'
  };

  // Firebase Hosting exposes /__/firebase/init.json when a Web App is registered.
  // We probe it without inventing client credentials. On Vercel/local preview this
  // will normally 404, leaving the application safely in synthetic demo mode.
  async function probeFirebaseConfig() {
    try {
      const response = await fetch('/__/firebase/init.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      if (config && config.projectId === state.projectId && config.apiKey && config.appId) {
        state.status = 'web-config-available';
        state.webConfig = config;
      }
    } catch (_) {
      // Expected on non-Firebase preview environments.
    }
    window.AuditDefendFirebase = state;
    document.dispatchEvent(new CustomEvent('auditdefend:firebase-status', { detail: state }));
  }

  probeFirebaseConfig();
})();
