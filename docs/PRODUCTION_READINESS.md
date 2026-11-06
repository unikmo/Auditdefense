# Production readiness gates

Source of truth: `data/production-gates.json`. `public/production-gates.js` evaluates it and **fails closed**: PHI is allowed only when every gate is `complete` with non-empty `evidence`. The shipped file has every gate `open`.

## What code cannot do
BAAs, the risk assessment, policies and legal review are real-world steps. Change a gate to `complete` only after the step is done, and record the document reference, signer and date in `evidence`.

## What is built (PHI still blocked)

### Per-case password with recovery (end-to-end encryption)
- `public/case-crypto.js`: files are encrypted in the browser with a random per-case key (AES-256-GCM). That key is stored only as **wraps**: independent copies, each locked by a different secret (PBKDF2-SHA256, 600,000 iterations). Any one secret opens the key. The server never sees a secret or the key.
- Creating a case makes two wraps: the **shared case password** (min 12 characters, used by provider and attorney) and a **one-time recovery code** (160 bits, shown once; show it, make the user save it, never store it).
- Firestore `caseKeys/{caseId}/wraps/{wrapId}`: participants read and add wraps; wraps cannot be edited; weak settings and extra fields are refused.

#### Who can reset what (no "I forgot" button)
- There is no self-service reset. A new lock can only be made by someone who can already open the key (the password, the recovery code, or another participant who is signed in and unlocked). Visiting a case and claiming to have forgotten gives no access.
- Email proves identity, not the key. Email-only recovery would require the platform to hold a copy of the key; that is deliberately not built.
- Adding a lock needs a signed-in case participant with a **verified email**; each lock records who added it and when (server time). A lock added by someone without the key cannot open any file.
- Only the lock's creator or the case creator can delete a lock, so one participant cannot lock the other out. The case creator can cut off a leaked lock.
- Not built: notifying every participant when a lock is added or removed, and a "request rescue" flow where the other participant approves. Both need Cloud Functions (open gate: `audit-logging`).

#### Recovery paths
1. **Forgot the password, has the recovery code:** unlock with the code, add a new password wrap (`addPasswordWrap`). Old files open as before.
2. **Forgot the password, the other party still has it:** they unlock and add a password wrap for you.
3. **Password leaked or a person left:** delete the old password wrap (any participant can) and add a new one. Anyone who already unlocked the key may have copied it, so for a real exposure re-key and re-upload.
4. **Lost the recovery code:** unlock with the password and issue a new one (`addRecoveryWrap`), then delete the old recovery wrap.
5. **Lost the password, the recovery code AND nobody else can unlock:** the files cannot be recovered. This is the price of keeping the platform unable to read them. We deliberately do **not** build a platform master key; it would let us (and anyone who breaches us) read every case.

Recovery code handling: show it once, let the user download/print it, and ask them to keep it somewhere other than where the password lives. Do not email it.

### Files (Storage rules, `storage.rules`)
- Access follows case membership in Firestore (`providerCases` or `attorneyCases`), so the provider and the attorney on a case can both read.
- `evidence/{caseId}/{fileId}`: immutable (no overwrite). The uploader can delete it, for example when a wrong file was uploaded by mistake.
- `documents/{caseId}/{fileId}`: written documents can be redacted, edited and replaced by any participant, and deleted.
- Every upload needs `encrypted`, `redacted`, `attested`, `originalType`, `uploadedBy == caller` and a 64-hex `sha256` (of the plaintext). File names are not stored in plaintext metadata.
- Storage and Firestore rules must be deployed together because the Storage rules read Firestore.

### Client logic
- `public/evidence-vault.js`: validation, SHA-256, paths, metadata, custody entries.
- Tests: `npm run test:gates` (units) and `npm run test:rules` (Firestore and Storage emulators, needs Java 21 on PATH, uses `firebase.emulator.json`). Both pass as of this commit.

## Trade-offs of the password model
- **If the password, the recovery code and every other participant are all lost, files are unrecoverable.** Recovery paths above cover every other case.
- **The password must be shared outside the app** (phone call, password manager share). Do not send it in the same email as the case link.
- **The server cannot scan encrypted files.** Malware scanning has to happen in the browser before encryption, or after decryption. The `malware-scan` gate stays open.
- **No server-side search, OCR or preview** of encrypted contents.
- **Encryption does not replace HIPAA.** BAAs, risk assessment and policies are still required before PHI.

## Not done (and why)
- **Not deployed.** `firebase.json` has no storage target, and Cloud Storage needs the Blaze plan. Add `"storage": {"rules": "storage.rules"}` only after the owner approves billing.
- **No UI yet.** Nothing in the workspace pages calls `case-crypto.js` or the vault. Upload, unlock and change-password screens are still to build.
- **Deletion is not self-auditing.** Storage rules cannot force a custody-log write; use a Cloud Function or bucket soft-delete/versioning (`audit-logging` gate).
- **Firestore rules** other than `caseKeys` have no emulator tests, so the `rules-tested` gate stays open.
- **Malware scan, MFA, immutable audit logging, backup/restore** are open gates.
- **PowerGM** is blocked on a redacted export/API schema.

## Enabling PHI
Do not. Not until `npm run test:gates` shows all gates complete and outside counsel has signed off.
