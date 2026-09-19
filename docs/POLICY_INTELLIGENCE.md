# AuditDefend Policy Intelligence Engine

## Purpose
Policy Intelligence ties every payer finding to the authority that actually applied on the date of service (DOS). It is designed to detect a potential policy-level challenge before a payer finding is treated as final.

## Challenge citation contract
Every policy-level challenge must be source-linked.

A challenge packet must include:
- authoritative source title
- direct source URL
- effective-version status
- exact section/page locator
- a short orientation excerpt
- a deep link to the highlighted HTML passage where supported
- a PDF page link where the policy is published as a PDF

`POLICY_CONFLICT_CANDIDATE` is blocked unless:
1. the policy mismatch has been verified,
2. the applicable policy version has been established, and
3. at least one authoritative citation is attached.

Counsel must still read the authoritative source before using challenge language.

## Monitoring
The policy monitor runs daily through GitHub Actions. It fingerprints authoritative source pages/PDFs, detects material source changes, preserves prior/current hashes and creates run evidence.

Source changes do **not** automatically change claim conclusions. They enter human policy review first.

## Policy-change intelligence
Verified future-dated announcements are stored separately from raw source-change alerts.

The client-facing change record includes:
- payer
- publication/announcement context
- effective date
- change summary
- likely operational impact
- authoritative announcement link
- short source excerpt

The initial verified upcoming-change examples include:
- Fidelis Care 30-Day Readmission Payment Policy — effective October 1, 2026
- Aetna Claim and Code Review Program edits — beginning December 1, 2026
- Aetna maternity coding/reimbursement restructuring — effective January 1, 2027

## Recovery-rights engine
Recovery timing is evaluated separately from the underlying reimbursement policy.

The first NY rules include:
- ordinary NY health-plan recovery: 24 months from original payment received, subject to statutory exceptions
- NY Medicaid Managed Care recovery: six years from payment received, with 30-day written notice requirements

Required dates:
- payment received date
- recovery initiated date
- notice date where available

Required statuses:
- WITHIN_CONFIGURED_WINDOW
- POTENTIALLY_OUTSIDE_WINDOW
- EXCEPTION_MAY_APPLY
- NOTICE_PERIOD_SHORT
- INSUFFICIENT_DATES
- HUMAN_REVIEW_REQUIRED

## Source universe
The monitored universe now includes government and major payer policy libraries, including:
- CMS Medicaid NCCI
- NY Medicaid / NYSDOH / eMedNY
- Anthem New York
- UnitedHealthcare Community Plan and Commercial
- Aetna provider policy-change announcements
- Fidelis Care / Centene
- Humana
- Molina New York Medicaid
- EmblemHealth
- New York Insurance Law § 3224-b
- NYSDOH managed-care standard clauses

## Safety / provenance
- The system stores source metadata, fingerprints, locators and short excerpts, not wholesale copies of payer policy libraries.
- Public pilot claim identifiers remain redacted.
- Historical applicability must be based on the version effective on the DOS.
- Policy interpretation and challenge language require human review.
- Counsel controls legal conclusions.
- No PHI is required for public-source policy monitoring.
