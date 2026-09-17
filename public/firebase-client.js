(() => {
  const SDK_VERSION = '12.19.0';
  const PROJECT_ID = 'auditdefense-2cb01';
  const state = {
    status: 'not-configured',
    projectId: PROJECT_ID,
    auth: 'disabled',
    firestore: 'disabled',
    storage: 'disabled',
    user: null,
    error: null
  };

  const emit = () => {
    window.AuditDefendFirebase = state;
    document.dispatchEvent(new CustomEvent('auditdefend:firebase-status', { detail: { ...state } }));
  };

  async function getHostingConfig() {
    const response = await fetch('/__/firebase/init.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Firebase Hosting config unavailable (HTTP ${response.status})`);
    const config = await response.json();
    if (!config || config.projectId !== PROJECT_ID || !config.apiKey || !config.appId) {
      throw new Error('Firebase Web App config is missing or does not match the AuditDefense project.');
    }
    return config;
  }

  async function boot() {
    emit();
    try {
      const config = await getHostingConfig();
      state.status = 'web-config-available';
      state.webConfig = config;
      emit();

      const base = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;
      const [appSdk, authSdk, firestoreSdk, storageSdk] = await Promise.all([
        import(`${base}/firebase-app.js`),
        import(`${base}/firebase-auth.js`),
        import(`${base}/firebase-firestore.js`),
        import(`${base}/firebase-storage.js`)
      ]);

      const app = appSdk.initializeApp(config);
      const auth = authSdk.getAuth(app);
      const db = firestoreSdk.getFirestore(app);
      const storage = storageSdk.getStorage(app);

      state.status = 'sdk-initialized';
      state.auth = 'available';
      state.firestore = 'available';
      state.storage = 'available';
      emit();

      authSdk.onAuthStateChanged(auth, user => {
        state.user = user ? { uid: user.uid, email: user.email, emailVerified: user.emailVerified } : null;
        emit();
      });

      window.AuditDefendFirebaseAPI = Object.freeze({
        async signIn(email, password) {
          const result = await authSdk.signInWithEmailAndPassword(auth, email, password);
          return { uid: result.user.uid, email: result.user.email, emailVerified: result.user.emailVerified };
        },
        async signOut() {
          await authSdk.signOut(auth);
        },
        async saveSyntheticDemoCase(caseId, payload = {}) {
          if (!auth.currentUser) throw new Error('Authentication required.');
          if (!caseId || typeof caseId !== 'string') throw new Error('caseId is required.');
          const safe = {
            ...payload,
            ownerUid: auth.currentUser.uid,
            synthetic: true,
            updatedAt: firestoreSdk.serverTimestamp()
          };
          await firestoreSdk.setDoc(firestoreSdk.doc(db, 'demoCases', caseId), safe, { merge: true });
          return { caseId };
        },
        async loadSyntheticDemoCase(caseId) {
          if (!auth.currentUser) throw new Error('Authentication required.');
          const snapshot = await firestoreSdk.getDoc(firestoreSdk.doc(db, 'demoCases', caseId));
          return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        },
        async uploadSyntheticEvidence(file, caseId = 'demo') {
          if (!auth.currentUser) throw new Error('Authentication required.');
          if (!file) throw new Error('File is required.');
          const allowed = new Set(['application/pdf', 'text/csv', 'application/json']);
          if (!allowed.has(file.type)) throw new Error('Demo upload allows PDF, CSV or JSON only.');
          if (file.size >= 10 * 1024 * 1024) throw new Error('Demo upload must be smaller than 10 MB.');
          const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const path = `demo/${auth.currentUser.uid}/${caseId}/${Date.now()}-${cleanName}`;
          const ref = storageSdk.ref(storage, path);
          const result = await storageSdk.uploadBytes(ref, file, {
            contentType: file.type,
            customMetadata: { synthetic: 'true', caseId }
          });
          return { path: result.ref.fullPath };
        }
      });
    } catch (error) {
      // Expected on local/Vercel previews or before a Firebase Web App is registered.
      state.status = 'not-configured';
      state.auth = 'disabled';
      state.firestore = 'disabled';
      state.storage = 'disabled';
      state.error = error instanceof Error ? error.message : String(error);
      emit();
    }
  }

  boot();
})();
