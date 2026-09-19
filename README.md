# AuditDefend

**Positioning:** The Audit Defense Forensic Platform.

This repository contains the approved **non-production interactive demo** and secure Firebase scaffolding. The product is designed to turn payer audit requests into organized, evidence-linked case workspaces for healthcare providers and counsel. The current beachhead is behavioral health / ABA.

## Current implemented demo

- Audit defense dashboard
- New-audit intake prototype
- Claims & evidence matrix
- Gap / issue queue
- Provider & network chronology
- Financial exposure view
- Counsel workspace
- Case binder preview
- Quality & prevention view
- Responsive navigation and claim-detail drawer
- Dedicated Firebase email/password authentication test surface at `/auth.html`
- Synthetic-data-only safety boundary

## Firebase target

- Project name: `AuditDefense`
- Project ID: `auditdefense-2cb01`
- Project number: `146444139355`
- Web App: `AuditDefend Web`
- Web App ID: `1:146444139355:web:5d3f7c9b4fad32cad5f87e`
- Storage bucket target: `auditdefense-2cb01.firebasestorage.app`
- Known Admin SDK identity: `firebase-adminsdk-fbsvc@auditdefense-2cb01.iam.gserviceaccount.com`

### Security scaffolding included

- `firestore.rules` — deny-by-default; org data requires a server-provisioned `orgId` claim; demo records must be synthetic and owner-scoped.
- `storage.rules` — deny-by-default; only owner-scoped synthetic demo PDF/CSV/JSON uploads are allowed, max 10 MB.
- `functions/` — server-side Firebase Admin scaffold using application-default/runtime credentials. **No private key is stored in this repo.**
- `public/firebase-client.js` — initialized with the verified Firebase Web App client configuration so the static Vercel preview can use Firebase. The Firebase browser API key is client-visible by design; the Firebase Admin service-account key is not included.
- `public/auth.html` / `public/auth.js` — test-only email/password sign-up, sign-in, email-verification and password-reset verification surface.
- `vercel.json` — static preview routing and baseline response headers.

## Still requires external Firebase activation / verification

These cannot be truthfully claimed from repository code alone:

- Email/Password Authentication provider enabled
- Firestore database created in the approved region
- Storage bucket created in the approved region
- deployed Firestore/Storage rules
- deployed Cloud Function
- live authenticated Firestore/Storage rule tests
- HIPAA/BAA eligibility and configured controls
- PHI ingestion approval

## PowerGM

PowerGM is currently scoped only as the **session-note source**. Exact integration remains blocked until a redacted export/API schema is supplied. See `integrations/powergm/README.md`.

## Local preview

```bash
python3 -m http.server 4173 --directory public
```

Then open `http://localhost:4173` or `http://localhost:4173/auth.html`.

## Safety boundary

This demo is workflow/evidence-management software, not legal advice. Audit findings are review signals. Payer interpretations, legal conclusions, submissions, and representation require qualified human review.
