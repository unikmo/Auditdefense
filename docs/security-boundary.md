# AuditDefend security boundary — Phase 1

## Current state

The repository and preview are **synthetic-data only**. PHI is not approved for ingestion.

## Required before any PHI

1. Execute an appropriate HIPAA/BAA review for every vendor handling ePHI.
2. Verify Firebase/GCP project configuration, region choices, access controls and audit logging.
3. Enable authentication with MFA/role strategy appropriate to the deployment.
4. Provision organization membership server-side; do not trust client-supplied `orgId`.
5. Deploy and test deny-by-default Firestore and Storage rules with emulator/negative tests.
6. Add malware/quarantine controls for uploaded files before files can enter the evidence workflow.
7. Encrypt data in transit and at rest using approved platform controls; document key-management decisions.
8. Establish retention/deletion policy and immutable evidence/provenance strategy.
9. Add security logging for reads, exports, counsel sharing and case-binder generation.
10. Complete incident-response, access-review and backup/restore procedures.

## Current rule posture

- Unknown Firestore paths: denied.
- Organization writes from client: denied.
- Organization reads require a server-created `orgId` auth claim.
- Storage: denied except owner-scoped **synthetic demo** PDF/CSV/JSON files with `synthetic=true` metadata.
- Service-account private keys: prohibited from source control and browser code.
- Cloud Function scaffold uses runtime/Application Default Credentials.

## Legal boundary

AuditDefend organizes evidence and surfaces review signals. It does not determine legal entitlement to recoupment, represent a provider, or replace qualified counsel.
