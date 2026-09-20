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

## Seven-issue review taxonomy
The approved review taxonomy is versioned in `data/issue-families.json` and keeps these findings separate:

1. Documentation support
2. Signatures / authentication
3. Assessment / treatment plan
4. Provider / NPI enrollment
5. Authorization / units
6. Credentialing / network
7. Coding / NCCI

Each family defines a review question, evidence examples, and a boundary statement. A flag in one family is not treated as proof that the entire claim is unsupported.

## Verified court reference system
Historical decisions are stored in `data/reference-cases.json` as a separate research layer from payer-policy rules. Every record requires:

- case name and citation
- court, jurisdiction, decision date, and precedential status
- procedural posture and disposition
- a concise holding summary and material facts
- issue-family mapping
- relevance and limitations
- an official source URL, locator, publisher, and verification date

Reference results are labeled `HISTORICAL_REFERENCE`. The engine does not calculate win rates, scores, confidence, likely outcomes, or predictions. A case is shown because its recorded issues match the user's research filter—not because the system predicts the same result. Counsel must check later history and current law before relying on any reference.

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

## Nationwide coverage ledger
`data/national-coverage.json` defines the national target universe separately from the rules that are already usable on claims.

The coverage target is at least 95% of the selected service line's U.S. claims, weighted by payer enrollment or actual provider claim volume. It is not calculated by counting payer logos. A coverage unit requires:

- payer legal entity
- state
- line of business and plan/contract
- network arrangement
- service/code and issue family
- effective-from/effective-to dates
- authoritative source and version evidence

The ledger uses four non-interchangeable states:

- `CLAIM_READY`: a date-effective rule and citation can be matched to a claim
- `MONITORED_LIBRARY`: an official library is watched, but policy applicability still requires verification
- `SOURCE_IDENTIFIED`: the payer/program is in scope but its complete version map is not operational
- `GAP`: no sufficient authoritative source is indexed

The initial nationwide universe contains 36 national/regional payer families, all 50 state Medicaid programs plus the District of Columbia, Original Medicare, Medicare Administrative Contractors, TRICARE and VA Community Care. The source registry contains 53 official entry points. These counts do not establish 95% claim-ready coverage; a weighted baseline is required before any percentage is published.

## Safety / provenance
- The system stores source metadata, fingerprints, locators and short excerpts, not wholesale copies of payer policy libraries.
- Public pilot claim identifiers remain redacted.
- Historical applicability must be based on the version effective on the DOS.
- Policy interpretation and challenge language require human review.
- Counsel controls legal conclusions.
- Court decisions are historical research references, not outcome predictions.
- No PHI is required for public-source policy monitoring.
