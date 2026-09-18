# AuditDefend Policy Intelligence Engine

## Purpose
Policy Intelligence ties each payer finding to the authority that actually applied on the date of service (DOS). It is designed to detect a potential policy-level challenge before a payer finding is treated as final.

## Initial source universe
The first implementation monitors:
- CMS Medicaid NCCI Policy Manual
- CMS Medicaid NCCI Edit Files
- CMS Medicaid NCCI Technical Guidance Manual
- New York State Medicaid provider information
- New York State Medicaid Update
- eMedNY information for all providers
- eMedNY behavioral-health provider manual entry point
- Anthem New York reimbursement policies
- Anthem New York manuals/policies/guidelines
- 2026 Anthem New York Medicaid Provider Manual

## Monitoring
A GitHub Actions workflow runs every six hours. It fetches each authoritative public source, normalizes HTML where applicable, creates a SHA-256 fingerprint and compares it to the prior observed version.

A source change produces:
- CHANGED_REVIEW_REQUIRED
- previous and current source hashes
- last changed timestamp
- source URL and authority
- a 30-day workflow artifact with run evidence

The monitor does **not** automatically make a legal conclusion from a change.

## Claim-to-policy chain
Each policy analysis should resolve:
claim → DOS → payer/program → policy source → effective version → payer finding → evidence → policy-match status

Required statuses:
- POLICY_MATCHED
- POLICY_BASIS_UNVERIFIED
- POLICY_VERSION_UNCERTAIN
- POLICY_CONFLICT_CANDIDATE
- SUPERSEDED_POLICY_CANDIDATE
- HUMAN_REVIEW_REQUIRED

Only a verified mismatch should become POLICY_CONFLICT_CANDIDATE. A payer denial by itself is not evidence that the payer violated its own policy.

## Safety / provenance
- The engine stores source metadata and fingerprints, not copied policy libraries.
- Public pilot claim identifiers remain redacted.
- Policy interpretation requires human review.
- Counsel controls legal conclusions and challenge language.
- No PHI is required for policy-source monitoring.
