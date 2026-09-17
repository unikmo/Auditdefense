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
- Synthetic-data-only safety boundary

## Firebase target

- Project name: `AuditDefense`
- Project ID: `auditdefense-2cb01`
- Project number: `146444139355`
- Known Admin SDK identity: `firebase-adminsdk-fbsvc@auditdefense-2cb01.iam.gserviceaccount.com`

### Security scaffolding included

- `firestore.rules` — deny-by-default; org data requires a server-provisioned `orgId` claim; demo records must be synthetic and owner-scoped.
- `storage.rules` — deny-by-default; only owner-scoped synthetic demo PDF/CSV/JSON uploads are allowed, max 10 MB.
- `functions/` — server-side Firebase Admin scaffold using application-default/runtime credentials. **No private key is stored in this repo.**
- `public/firebase-client.js` — probes Firebase Hosting's reserved init config only; it does not fabricate or embed credentials.

## Still requires external Firebase-console activation / verification

These cannot be truthfully claimed from repository code alone:

- Firebase Web App registration/config
- Email/Password Authentication provider enabled
- Firestore database created in the intended region
- Storage bucket created in the intended region
- deployed Firestore/Storage rules
- deployed Cloud Function
- HIPAA/BAA eligibility and configured controls
- PHI ingestion approval

## PowerGM

PowerGM is currently scoped only as the **session-note source**. Exact integration remains blocked until a redacted export/API schema is supplied. See `integrations/powergm/README.md`.

## Local preview

```bash
python3 -m http.server 4173 --directory public
```

Then open `http://localhost:4173`.

## Safety boundary

This demo is workflow/evidence-management software, not legal advice. Audit findings are review signals. Payer interpretations, legal conclusions, submissions, and representation require qualified human review.
