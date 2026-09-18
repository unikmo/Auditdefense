# Provider Onboarding

AuditDefend provider onboarding is available at `/provider` and `/provider.html`.

## Flow
1. Account creation or sign-in
2. Practice / organization setup
3. Redacted audit intake
4. Automatic case-plan recommendation
5. Optional counsel invitation record
6. Review + explicit no-PHI acknowledgement
7. Provider workspace created

## Case pricing
- Standard: $995 prepaid, up to 100 claims
- Expanded: $1,995, 101–500 claims
- Complex: custom, 500+ / multi-payer / unusual scope
- Provider and counsel access are part of the case model; the same case is not double-charged based on who originates it.

## Pilot persistence
The browser client contains Firestore methods for:
- `providerProfiles/{uid}`
- `providerOrganizations/{organizationId}`
- `providerCases/{caseId}`
- `providerInvites/{inviteId}`

The UI falls back to local pilot storage if the Firestore database/rules are not active. It must not claim cloud persistence unless the write succeeds.

## Security boundary
- Redacted/non-PHI metadata only.
- Evidence-file upload is disabled.
- Provider organization membership changes are owner-controlled.
- Provider case participant-list changes are restricted to the case creator/provider organization owner.
- Provider invite records do not grant case access on their own.
- Counsel email delivery and invite acceptance/grant automation are not connected yet.
- Production PHI use remains prohibited until the separate security/BAA/legal/release gates pass.
