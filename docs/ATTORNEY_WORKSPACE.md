# Attorney Workspace

AuditDefend includes a separate non-production attorney workspace at `/attorney.html`.

## Implemented pilot capabilities
- 4-step firm/attorney onboarding
- multi-client portfolio and cross-client case table
- case creation and redacted provider-client setup
- case deadlines with explicit attorney verification requirement
- counsel-only notes separated from provider-visible case data
- team/role model: Managing Attorney, Attorney, Paralegal, Read-only
- invitation records for provider, co-counsel and reviewer access
- portfolio search, filters, case drawer and priority queue
- cross-client reporting and redacted CSV export
- provider executive summary vs counsel forensic summary
- case pricing surfaces: $995 up to 100 claims, $1,995 for 101–500, complex custom
- $499/month attorney firm workspace pilot pricing
- seeded redacted Anthem 30-line case

## Security boundary
The attorney pilot is redacted/non-PHI only. Counsel-only notes are stored under `attorneyCases/{caseId}/notes` and Firestore rules permit reads only to UIDs listed in the case's `attorneyUids`. Provider participants can be listed separately in `providerUids` and may read the case root but not counsel-only notes.

Invitation records do not grant access on their own. Access requires a separate authorized case/firm membership update.

## Still external / not claimed
- invitation email delivery
- payment/Stripe checkout
- PHI production authorization
- HIPAA/BAA production controls
- deployed/verified Firestore attorney rules
- PowerGM integration

These remain separate activation and verification gates.
