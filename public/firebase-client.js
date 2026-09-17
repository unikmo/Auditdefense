(() => {
  const SDK_VERSION = '12.19.0';
  const PROJECT_ID = 'auditdefense-2cb01';

  // Firebase Web App config is public client configuration. Admin credentials
  // and service-account private keys must never be placed in browser code.
  const WEB_CONFIG = Object.freeze({
    projectId: 'auditdefense-2cb01',
    appId: '1:146444139355:web:5d3f7c9b4fad32cad5f87e',
    storageBucket: 'auditdefense-2cb01.firebasestorage.app',
    apiKey: 'AIzaSyAmwvYon32T72zBVJiz_CmJin5W9DXZFoU',
    authDomain: 'auditdefense-2cb01.firebaseapp.com',
    messagingSenderId: '146444139355'
  });

  const state = {
    status: 'booting',
    projectId: PROJECT_ID,
    auth: 'initializing',
    firestore: 'initializing',
    storage: 'disabled-free-plan',
    user: null,
    error: null
  };

  const emit = () => {
    window.AuditDefendFirebase = state;
    document.dispatchEvent(new CustomEvent('auditdefend:firebase-status', { detail: { ...state } }));
  };

  function assertConfig(config) {
    const required = ['projectId', 'appId', 'apiKey', 'authDomain', 'messagingSenderId'];
    for (const key of required) {
      if (!config[key]) throw new Error(`Firebase Web App config missing ${key}.`);
    }
    if (config.projectId !== PROJECT_ID) throw new Error('Firebase Web App config points to the wrong project.');
    return config;
  }

  async function boot() {
    emit();
    try {
      const config = assertConfig(WEB_CONFIG);
      const base = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;
      const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import(`${base}/firebase-app.js`),
        import(`${base}/firebase-auth.js`),
        import(`${base}/firebase-firestore.js`)
      ]);

      const app = appSdk.initializeApp(config);
      const auth = authSdk.getAuth(app);
      const db = firestoreSdk.getFirestore(app);

      state.status = 'sdk-initialized';
      state.auth = 'available';
      state.firestore = 'available';
      state.storage = 'disabled-free-plan';
      state.error = null;
      emit();

      authSdk.onAuthStateChanged(auth, user => {
        state.user = user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        } : null;
        emit();
      });

      const requireUser = () => {
        if (!auth.currentUser) throw new Error('Authentication required.');
        return auth.currentUser;
      };

      window.AuditDefendFirebaseAPI = Object.freeze({
        async signUp(email, password) {
          const result = await authSdk.createUserWithEmailAndPassword(auth, email, password);
          await authSdk.sendEmailVerification(result.user);
          return { uid: result.user.uid, email: result.user.email, emailVerified: result.user.emailVerified };
        },
        async signIn(email, password) {
          const result = await authSdk.signInWithEmailAndPassword(auth, email, password);
          return { uid: result.user.uid, email: result.user.email, emailVerified: result.user.emailVerified };
        },
        async sendPasswordReset(email) {
          await authSdk.sendPasswordResetEmail(auth, email);
          return { email };
        },
        async refreshUser() {
          if (!auth.currentUser) return null;
          await auth.currentUser.reload();
          return { uid: auth.currentUser.uid, email: auth.currentUser.email, emailVerified: auth.currentUser.emailVerified };
        },
        async signOut() {
          await authSdk.signOut(auth);
        },
        async saveSyntheticDemoCase(caseId, payload = {}) {
          const user = requireUser();
          if (!caseId || typeof caseId !== 'string') throw new Error('caseId is required.');
          const safe = { ...payload, ownerUid: user.uid, synthetic: true, updatedAt: firestoreSdk.serverTimestamp() };
          await firestoreSdk.setDoc(firestoreSdk.doc(db, 'demoCases', caseId), safe, { merge: true });
          return { caseId };
        },
        async loadSyntheticDemoCase(caseId) {
          requireUser();
          const snapshot = await firestoreSdk.getDoc(firestoreSdk.doc(db, 'demoCases', caseId));
          return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        },
        async saveRedactedCase(caseId, payload = {}) {
          const user = requireUser();
          if (!caseId || typeof caseId !== 'string') throw new Error('caseId is required.');
          if (!Array.isArray(payload.claims)) throw new Error('Redacted case requires a claims array.');
          if (payload.claims.length > 100) throw new Error('Free-pilot redacted case is limited to 100 claim lines.');
          const safe = {
            ...payload,
            ownerUid: user.uid,
            caseType: 'redacted-real-case-demo',
            redacted: true,
            containsPhi: false,
            updatedAt: firestoreSdk.serverTimestamp()
          };
          await firestoreSdk.setDoc(firestoreSdk.doc(db, 'redactedCases', caseId), safe, { merge: true });
          return { caseId };
        },
        async loadRedactedCase(caseId) {
          requireUser();
          const snapshot = await firestoreSdk.getDoc(firestoreSdk.doc(db, 'redactedCases', caseId));
          return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        },
        async deleteRedactedCase(caseId) {
          requireUser();
          await firestoreSdk.deleteDoc(firestoreSdk.doc(db, 'redactedCases', caseId));
          return { caseId };
        },
        getState() {
          return { ...state };
        }
      });
    } catch (error) {
      state.status = 'initialization-error';
      state.auth = 'unavailable';
      state.firestore = 'unavailable';
      state.storage = 'disabled-free-plan';
      state.error = error instanceof Error ? error.message : String(error);
      emit();
    }
  }

  boot();
})();
