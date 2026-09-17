# AuditDefend build status

Last updated: 2026-09-17

## Verified

- GitHub repository is populated on `main`.
- Netlify site `auditdefense` is connected to `main` and automatically deploys repository updates.
- Latest verified Netlify deploy `6aabf7a838718f0007a3dcfc` is `ready` and contains commit `2171703718c7031ff569016b9c78397304917fd2`.
- Live demo URL: `https://auditdefense.netlify.app`.
- The dashboard is now based on the supplied 30-line Anthem payer-review worksheet rather than the older synthetic Aetna case.
- Real worksheet outcomes are modeled: 8/30 initially supported, 22/30 initially unsupported (73% error rate by count), 3/30 supported after rebuttal, 27/30 unsupported after rebuttal, and 5 A→B reversals.
- Sample financial calculation is separated from the case-wide demand: $3,469.64 sampled paid amount, $520.00 finally supported, $2,949.64 associated with finally unsupported lines, and $567,656.77 case-wide asserted overpayment.
- Patient/member names, DOBs, member IDs, source claim numbers and full NPIs from the supplied worksheet are NOT published. The public fixture uses redacted IDs and masked provider references.
- Provider-facing UX now presents status → reason → money at risk → next action.
- Counsel workspace now highlights initial-to-rebuttal changes, NPI/DOS enrollment evidence, payer authority, claim-universe overlap and recovery-math review.
- Firebase project identity is verified: `auditdefense-2cb01`.
- Firebase Web App is registered and wired: `AuditDefend Web` (`1:146444139355:web:5d3f7c9b4fad32cad5f87e`).
- Auth test surface exists at `/auth.html`.
- Free-tier backend verification surface exists at `/verify.html`.
- Firebase browser code now initializes Auth + Firestore only. Cloud Storage is disabled in the pilot.
- Active `firebase.json` is constrained to Hosting/Auth/Firestore; Storage and Functions are not in the active deploy configuration.
- Firestore rules are deny-by-default and include owner-scoped `redactedCases` that require `redacted=true`, `containsPhi=false`, a max 100 claim lines, and the authenticated owner UID.
- No Firebase Admin private key is stored in GitHub or browser code.
- PowerGM remains scoped to session notes only.

## Attorney workspace implemented

- Separate attorney portal implemented at `/attorney.html` (also `/attorney`).
- Firm/attorney onboarding, provider-client portfolio, multi-case dashboard, deadlines, counsel-only notes, team roles, invitations, cross-client reporting and case-plan pricing are implemented for the redacted pilot.
- Attorney/provider case root access and counsel-only note separation are modeled separately in Firestore rules.
- Provider Counsel Workspace links directly to the Attorney Workspace.
- Netlify deployment of the attorney portal is verified READY; Firebase rule deployment remains a separate gate.

## External activation still required / not yet verified

- Email/Password Authentication provider has been deployed/enabled and passes live sign-up/sign-in smoke testing.
- Firestore database has been created in the selected free-tier location.
- Firestore rules have been deployed to the live Firebase project.
- Authenticated redacted-case write/read/delete passes `/verify.html`.
- Unauthenticated and cross-user Firestore access is verified denied in the live project.
- PowerGM export/API schema is supplied and validated.
- PHI production architecture, BAA/compliance controls, qualified legal review and production authorization are complete.

## Explicitly deferred to stay on free tier

- Firebase Cloud Storage / evidence-file upload.
- Firebase Cloud Functions deployment.
- Real PHI ingestion.

## Deployment boundary

The Netlify deployment is a public, non-production product demonstration using a redacted representation of a real audit worksheet. Source images containing member/patient identifiers are intentionally not published. Live Firestore persistence is not considered complete until the database, deployed rules and access-control smoke tests are verified.

Production/PHI deployment remains prohibited until the separate production authorization, security and legal gates are satisfied.
