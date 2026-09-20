(() => {
  const form = document.getElementById('authForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const status = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const signInMode = document.getElementById('signInMode');
  const signUpMode = document.getElementById('signUpMode');
  const resetBtn = document.getElementById('resetBtn');
  const heading = document.getElementById('heading');
  const subheading = document.getElementById('subheading');

  let mode = 'signin';
  const nextPath = (() => { const value = new URLSearchParams(location.search).get('next'); return value && value.startsWith('/') && !value.startsWith('//') ? value : null; })();

  function setStatus(message, kind = '') {
    status.className = `status ${kind}`.trim();
    status.textContent = message;
  }

  function setMode(next) {
    mode = next;
    const creating = next === 'signup';
    signInMode.classList.toggle('active', !creating);
    signUpMode.classList.toggle('active', creating);
    heading.textContent = creating ? 'Create account' : 'Sign in';
    subheading.textContent = creating
      ? 'Create your AuditDefend account. A verification email will be sent automatically.'
      : 'Sign in to continue to your AuditDefend workspace.';
    submitBtn.textContent = creating ? 'Create account' : 'Sign in';
    password.autocomplete = creating ? 'new-password' : 'current-password';
  }

  function friendly(error) {
    const raw = error?.message || String(error);
    if (raw.includes('auth/operation-not-allowed')) return 'Account creation is temporarily unavailable.';
    if (raw.includes('auth/invalid-credential')) return 'The email or password is incorrect.';
    if (raw.includes('auth/email-already-in-use')) return 'That test email already has an account.';
    if (raw.includes('auth/weak-password')) return 'Use a stronger password of at least 6 characters.';
    if (raw.includes('auth/invalid-email')) return 'Enter a valid email address.';
    if (raw.includes('auth/network-request-failed')) return 'The account service could not be reached from this browser.';
    return raw;
  }

  function apiReady() {
    return window.AuditDefendFirebaseAPI && window.AuditDefendFirebase?.status === 'sdk-initialized';
  }

  function renderFirebaseState(detail = window.AuditDefendFirebase) {
    if (!detail) return;
    if (detail.status === 'sdk-initialized') {
      if (detail.user) {
        setStatus(`Signed in as ${detail.user.email || detail.user.uid}. Email verified: ${detail.user.emailVerified ? 'yes' : 'no'}.`, detail.user.emailVerified ? 'ok' : 'warn');
      } else {
        setStatus('Account service ready.', 'ok');
      }
    } else if (detail.status === 'initialization-error') {
      setStatus('The account service is temporarily unavailable. Please try again later.', 'error');
    } else {
      setStatus('Connecting to the account service…');
    }
  }

  document.addEventListener('auditdefend:firebase-status', event => renderFirebaseState(event.detail));
  renderFirebaseState();

  signInMode.addEventListener('click', () => setMode('signin'));
  signUpMode.addEventListener('click', () => setMode('signup'));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!apiReady()) {
      setStatus('The account service is not ready yet.', 'error');
      return;
    }
    submitBtn.disabled = true;
    try {
      if (mode === 'signup') {
        const user = await window.AuditDefendFirebaseAPI.signUp(email.value.trim(), password.value);
        setStatus(`Account created for ${user.email}. Verification email sent.`, 'warn');
        if (nextPath) setTimeout(() => { location.href = nextPath; }, 350);
      } else {
        const user = await window.AuditDefendFirebaseAPI.signIn(email.value.trim(), password.value);
        setStatus(`Signed in as ${user.email}. Email verified: ${user.emailVerified ? 'yes' : 'no'}.`, user.emailVerified ? 'ok' : 'warn');
        if (nextPath) setTimeout(() => { location.href = nextPath; }, 350);
      }
    } catch (error) {
      setStatus(friendly(error), 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  resetBtn.addEventListener('click', async () => {
    const address = email.value.trim();
    if (!address) {
      setStatus('Enter your account email first.', 'warn');
      return;
    }
    if (!apiReady()) {
      setStatus('The account service is not ready yet.', 'error');
      return;
    }
    try {
      await window.AuditDefendFirebaseAPI.sendPasswordReset(address);
      setStatus(`Password-reset email requested for ${address}.`, 'ok');
    } catch (error) {
      setStatus(friendly(error), 'error');
    }
  });
})();
