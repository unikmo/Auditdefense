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

The configured rules include:
- ordinary NY health-plan recovery: 24 months from original payment received, subject to statutory exceptions
- NY Medicaid Managed Care recovery: six years from payment received, with 30-day written notice requirements
- Medicare contractor reopening: one year from the initial determination or redetermination for any reason (42 CFR 405.980(b)(1)); good cause (four years) and fraud or similar fault (any time) are listed as exceptions for attorney review

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
- Court decisions are historical research references, not outcome predictions.
- No PHI is required for public-source policy monitoring.

## Federal rule coverage (added 2026-11-05)
`data/policy-rules.json` now carries source-verified rules beyond NY Medicaid and Anthem NY. Each excerpt was matched verbatim against the source text retrieved on 2026-11-03 (eCFR, U.S. Code, CMS manuals), and each source is in `data/policy-sources.json` so the daily monitor watches it.

| Area | Authority |
|---|---|
| Medicare payment conditions, sufficient information | 42 CFR 424.5 |
| Reasonable and necessary | SSA § 1862(a)(1)(A) |
| Therapy plan of care (PT/OT/SLP): required, established first, content, changes, signature, certification | 42 CFR 410.61; Benefit Policy Manual ch. 15 § 220.1.2–220.1.3 |
| Timed-code units | Claims Processing Manual ch. 5 |
| Retrospective billing for PT/OT/SLP | 42 CFR 424.521 |
| Home health face-to-face | 42 CFR 424.22 |
| Hospice certification, prognosis, clinical information | 42 CFR 418.22; Benefit Policy Manual ch. 9 |
| Signature requirements | Program Integrity Manual ch. 3 § 3.3.2.4 |
| DME proof of delivery retention | Program Integrity Manual ch. 4 |
| Extrapolation conditions and sampling | SSA § 1893(f)(3); Program Integrity Manual ch. 8 |
| Recoupment limit during reconsideration | SSA § 1893(f)(2) |
| Appeal and reopening deadlines | 42 CFR 405.942, 405.962, 405.980 |
| Report-and-return overpayments (60 days, 6-year lookback) | 42 CFR 401.305 |
| Medicaid ordering/referring enrollment | 42 CFR 455.410 |
| ERISA group health appeal rights | 29 CFR 2560.503-1 |

Rules with no issue family are marked `crossCutting` (deadlines and obligations). They are reference rules and do not attach to a claim finding.

### Added 2026-11-05: states, commercial payers, Medicare Advantage, coverage determinations
Also source-verified (excerpts matched verbatim against the retrieved text):

| Area | Authority |
|---|---|
| Hospice aggregate cap (reference rule) | 42 CFR 418.309 |
| Medicare Advantage coverage criteria, 60-day reconsideration | 42 CFR 422.101(b), 422.582(b) |
| NCDs binding; LCDs given substantial deference | 42 CFR 405.1060, 405.1062 |
| California insurers: overpayment request within 365 days | Cal. Ins. Code § 10133.66 |
| California plans: provider repays or contests within 30 working days | Cal. Health & Safety Code § 1371.1 |
| Florida insurers: 30 months; 12 months for chapter 458/459/460/461/466/490 licensees; 40-day response | Fla. Stat. § 627.6131 |
| UnitedHealthcare Commercial: 8-minute unit minimum, four timed codes per day, assistants and evaluation codes, CQ/CO modifiers | policies 2026R0101A, 2026R0098A |
| Fidelis Care / Centene ABA documentation (units, authorization, signatures, session times, late notes, 97155 protocol modification, active treatment) | CP.BH.105 |
| EmblemHealth habilitative/rehabilitative modifiers 96/97 | RPC20240052 |
| Medicaid, every state: 1 year from discovery to recover before the federal share is refunded; how discovery is dated; MCO network providers return overpayments in 60 days; 60-day report-and-return; claims within 12 months of service | 42 CFR 433.312, 433.316, 438.608(d)(2), 447.45(d)(1); 42 U.S.C. 1320a-7k(d) |
| Medi-Cal (California): cost reports final unless audited within 3 years; first demand within 60 days of audit; no recoupment for 60 days after demand | Welf. & Inst. Code 14170, 14172.5 |
| Humana Indiana PathWays for Aging (Indiana Medicaid): 48-hour written notice; 60 calendar days to dispute, refund or allow offset | Humana presentation, 2026 IHCP Works seminar |
| Molina Healthcare of Iowa: dispute within 45 days of notification; return identified overpayments within 60 days | Molina provider presentation hosted by Iowa HHS |
| Cigna Behavioral Health (HMO/insured, tagged TN; page text names no state): retroactive denial within 18 months; eligibility-based denial within 6 months | Cigna provider page TN_HmoInsuredOnly |
| State Medicaid: Indiana audit look-back 3 years 180 days (7 for fraud or a 30% error rate); Virginia initial determination within 4 years; Alaska 60 days notice before recouping beyond 120 days | 405 IAC 1-1.4-9; Va. Code 32.1-325.1:1; 7 AAC 105.260 |
| State Medicaid response deadlines: Kentucky 60 days, Mississippi 30 days, Missouri 45 days, Nebraska 30 days, Idaho 30 days (hospitals, FQHCs, RHCs, home health), Texas 60 days after a final OIG notice, Pennsylvania 15 days (cost settlements), Illinois recovery by setoff | 907 KAR 1:671; 23 Miss. Admin. Code 305 R.1.3; 13 CSR 70-3.030; 471 NAC 3-003.06; IDAPA 16.03.09.231; 1 TAC 371.1723; 55 Pa. Code 1101.69a; 89 Ill. Adm. Code 140.25 |
| TRICARE: offset limited to 10 years; 90 days to request administrative review; interest waived if paid in 30 days | 32 CFR 199.11 |
| Anthem Blue Cross (California): overpayment deducted from claims if no response, calendar-day schedule; Blue Shield of California: refund requested within 365 days, 30 working days to refund or dispute; Blue Cross and Blue Shield of Oklahoma: 30 days to refund before automatic retraction | Anthem SEM 8 (Oct 2023); Blue Shield of CA Provider Connection; BCBSOK Right to Offset |

Recovery windows now exist for California (365 days), Florida (30 months; 12 months for listed professions, selected by `providerType`) and New York, plus Medicare reopening. A state with no configured rule returns `NO_RULE_CONFIGURED`. It never borrows another state's window, and commercial windows are never applied to Medicaid or Medicare.

Payer matching is loose on purpose (`Fidelis Care`, `United Healthcare` and `UnitedHealthcare` all match; names under four characters match only exactly).

### Limits
- **State coverage (47 jurisdictions).** Commercial overpayment-recovery windows exist for AK AL AR AZ CA CO CT DC DE FL GA HI IA IL IN KS KY LA MD ME MN MO MS MA MT NC ND NE NH NJ NM NV NY OH OK OR PA SC SD TN TX UT VA VT WA WV WY. Every state has some rule on this, so the missing ones are a gap in what could be retrieved, not an absence of law.
  - **Primary-verified (28):** AK, AZ, CA, CT, DE, FL, KS, LA, MA, MD, ME, MN, MO, ND, NH, NM, NV, OK, OR, PA, SC, SD, TN, TX, VA, VT, WA, WV (plus NY from the original rules). The excerpt was matched word for word against statute or enrolled-act text fetched from a state site or a code copy (CA, OR and TX come from public.law copies). New Mexico's limit is an administrative rule, 13.10.22.12(R) NMAC (18 months), found by searching the regulations, not only the statutes. North Dakota's is dental-only (N.D.C.C. 26.1-47-02.3), so the rule is scoped with `providerTypes: [dentist]` and is never applied to medical providers. South Dakota is the enrolled 2026 session law (HB 1292, a new section in chapter 58-17H); its effective date and codified number were not verified.
  - **Secondary-source only (18):** AL, AR, CO, DC, GA, HI, IA, IL, IN, KY, MS, MT, NE, NJ, NC, OH, UT, WY. (AK, LA, NH, OK, TN and VT were moved to primary-verified on 2026-11-06 after the statute text was read on Justia. The survey was wrong for two of them: **Oklahoma is 12 months for a provider, not 18** (6 months for a claimant), and **Tennessee is 15 months, not 18** (18 months only for state employee plan payments, 6 months where eligibility was verified; amended by 2024 ch. 861). Louisiana (18 months, R.S. 22:1838(F)), New Hampshire (12 months, RSA 420-J:8-b), Alaska (365 days, 3 AAC 26.110(d), current through May 30, 2025) and Vermont (12 months, 18 V.S.A. § 9418(h)-(i)) were confirmed.) The excerpt matches a third-party source that quotes or describes the statute (the 50-State Look Back survey; for Illinois an Illinois Chiropractic Society article; for Mississippi the existing-law text printed in a House bill), but the statute site could not be reached from the environment that built this data. These rules carry `sourceSupportStatus: SECONDARY_SOURCE_ONLY`, the citation title says so, and the recovery card shows a warning. Run `node scripts/verify-state-statutes.mjs` from a normal network to check them against the official pages; it changes nothing and prints MATCH / NO-MATCH per state.
  - **Ohio has changed.** The survey quotes the old two-year limit in R.C. 3901.388. Ohio SB 162 (136th General Assembly) cut it to one year, per a law-firm client alert; the signing and effective dates were not verified. The rule is set to 12 months and says payments made before the change may remain under the old limit. This shows the main risk of secondary sources: **recoupment statutes change often, so any survey-only window may be out of date.**
    - **Massachusetts and Nevada added, with scope.** Massachusetts: M.G.L. c. 176G § 6B limits retroactive denials of behavioral-health claims to 12 months **from claim submission** (not payment), with a 30-day correction window and listed exceptions; the rule is scoped to behavioral-health provider types and uses `claimSubmissionDate`. Nevada: NRS 687B.725(3) limits dental recoveries to 12 months; scoped to `dentist`. Both texts were read from Internet Archive copies of the official legislature pages, because those sites block this environment directly.
  - **Searched in the statutes and found no recoupment limit (3): ID, MI, WI.** I read the primary text and cannot prove a negative, but the text itself is silent:
    - **MI:** the 2025 text of MCL 500.2006 (read on Justia, 2025 Michigan Compiled Laws) was read in full. Subsections (7) to (14) cover health-plan payments to providers: clean claims paid within 45 days, 12% interest, and providers must bill within 1 year of service. There is **no recoupment or overpayment limit**. Chapters 34 to 38 were checked (chapter 38, Medicare supplement policies, by section title only: all about benefits, issuance and marketing) by section title, and the provider-payment sections were opened (500.3405, 500.3418, 500.3528, 500.3529, 500.3531, 500.3610, 500.3610a, 500.3630, 500.3631): none mentions overpayment, recoupment or retroactive denial, and several were repealed in 2016 (PA 276) when the rules moved into 500.2006. Other chapters and 500.3533 were not opened, and a bill to add a timeframe (HB 5478, 2025-2026) was still in committee in January 2026. Michigan's limits are in workers' compensation and no-fault auto only.
    - **WI:** Wis. Stat. chapters 628 and 631 contain no overpayment-recovery limit (631.83 is limitation of actions on policies). Bills for a one-year limit (2001, 2003) did not turn up as enacted. Chapter 632 and the insurance regulations could not be retrieved, so Wisconsin stays open.
    - **ID:** the chapter 39 index and Idaho Code 41-3927 contain no recoupment limit; the full Title 41 text could not be retrieved. Blue Cross of Idaho's own policy uses 12 months by contract.
    - **NV (medical claims):** NRS chapters 689A, 689B, 695C and 695G contain no overpayment-recovery limit for providers.
  - **Rhode Island.** The statute (R.I. Gen. Laws § 27-18-65 and § 27-20-51: 18 months, 12 for mental-health and substance-use providers) could not be read here and is not encoded as a window. What is encoded and verified is regulation 230-RICR-20-30-4.11: insurers must stop seeking recoupment after a retroactive termination, unless the enrollee is covered elsewhere.
- **California plans.** Knox-Keene plans are also reachable through the DMHC regulation 28 CCR § 1300.71 (365 days, fraud excepted), named in one search result; not yet read in the text.
  - **Mixed meanings.** Some statutes limit recovery requests, others retroactive denials or audits. Iowa's is an audit limit; Texas sets a 180-day deadline for written notice; Maine, Minnesota and Pennsylvania add exception tiers. The title and statement on each rule say which.
- **California scope.** § 10133.66 governs health insurers. Knox-Keene health plans fall under the Health and Safety Code, whose own refund-request limit was not verified. The CA statute text was verified from the California.Public.Law copy, not leginfo.legislature.ca.gov.
- **State Medicaid programs: 13 of 50 states have state rules (CA, ID, IL, IN, KY, MO, MS, NE, NY, PA, TX, VA, AK).** Every excerpt was matched word for word against the fetched text (Cornell LII copies of the state codes, the Virginia and Pennsylvania code sites, california.public.law). Federal Medicaid rules (above) apply in all 50 states. **The other 37 states have no state Medicaid rule yet.** Their sites block automated access or I did not reach them. Leads that need the primary text: Ohio R.C. 5164.57 (five years from the end of the state fiscal year, per search results only; codes.ohio.gov refused automated access), Utah (three years, per a Medicaid manual I could not open), Texas Gov. Code 544.0503 (24-month managed-care audit limit, seen in a search snippet only), North Carolina (three-year review limit, secondary), Colorado C.R.S. 25.5-4-301, Oregon OAR 410-120-1397 (read, no clear deadline found), Florida 409.913 (the five-year figure is a records-retention rule, not a recovery limit). Many of the rules above are response windows after a notice, not look-back limits; only Indiana and Virginia give a look-back, and Virginia's section does not say what follows a missed deadline. Medicare needs no state rules: it is federal and the Medicare rules already apply in every state.
- **Payer rules are plan communications, not contracts.** The Humana, Molina and Cigna rules come from the plans' own presentations or provider pages. They give notice and dispute windows, not lookback limits, and the provider contract and the date on the overpayment notice control. The Cigna page address begins TN_ but its text names no state, so its rules are tagged Tennessee with that caveat.
- **Payers still without rules.** Aetna (commercial and Better Health: its pages and manuals refuse automated access, so nothing is encoded), Kaiser (no refund or notice rule found on a page I could read), Anthem outside California and New York, Blue Cross plans other than Oklahoma and the Blue Shield of California page, BCBS Texas and Illinois (their policy PDFs refused automated access; search results show 180 and 45 days for Texas and 30 days for Illinois, not encoded), Centene/Ambetter outside Fidelis, and the Humana and Molina commercial manuals. Anthem California, Blue Shield of California and BCBSOK rules are tagged to their own state; a case for the same payer in another state does not match.
- **Commercial policies change often.** Each carries a policy number or revision; `effectiveFrom` is set only where the policy states an effective date. For any date of service the version in force then must be established.
- **Individual LCDs and NCDs** (specific services) are not extracted; the two rules state how they bind.
- A rule is a sourced pointer, never a conclusion.
