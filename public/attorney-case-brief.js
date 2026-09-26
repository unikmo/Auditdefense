window.AuditDefendAttorneyBriefs = Object.freeze({
  'case-anthem': Object.freeze({
    title: 'Counsel issue brief — source validation in progress',
    notice: 'This workspace organizes facts, open questions and potentially relevant authorities. It does not determine liability, predict an outcome or recommend a legal position. Every assessment remains subject to attorney review and decision.',
    provenance: 'The source packet now establishes an earlier records-request and demand stage for Case C2024-8723: a December 12, 2024 records request with a 60-entry patient-record schedule; a March 13, 2026 SIU demand; a March 20, 2026 provider rebuttal; and a provider-prepared claim/support map. The later 30-line rebuttal-review and enrollment figures remain a separate stage. The two demand calculations must be reconciled rather than combined.',
    financials: Object.freeze([
      {label:'March 13, 2026 demand',value:'$64,733.00',status:'Source-supported',detail:'The SIU letter states this total and separates direct and extrapolated components.'},
      {label:'Direct 97153 component',value:'$160.00',status:'Source-supported',detail:'Stated in the March 13 demand as direct overpayment for CPT 97153.'},
      {label:'Extrapolated 97155 component',value:'$64,573.00',status:'Source-supported',detail:'Stated in the March 13 demand as extrapolated overpayment for CPT 97155.'},
      {label:'Later reported NPI components',value:'$567,096.77',status:'Separate later stage',detail:'Reported as $411,520.00 plus $155,576.77. The operative later demand and line-to-total reconciliation remain required.'}
    ]),
    facts: Object.freeze([
      {fact:'The December 12, 2024 SIU request asked for records supporting the billed codes, a Medical Record Veracity Attestation and provider signatures within 30 days.',status:'Source-supported',source:'December 12, 2024 records request'},
      {fact:'The request packet contains a patient-record schedule numbered 1 through 60.',status:'Source-supported',source:'Patient Record Listing in request packet'},
      {fact:'The March 13, 2026 letter states that Anthem reviewed CPT 97153 and 97155 records for dates of service from January 1, 2020 through September 1, 2024.',status:'Source-supported',source:'March 13, 2026 SIU demand'},
      {fact:'The March 13 letter states that 59 of 60 claims were unsupported and demands $64,733.00: $160.00 direct for 97153 and $64,573.00 extrapolated for 97155.',status:'Source-supported',source:'March 13, 2026 SIU demand'},
      {fact:'The March 13 letter sets April 14, 2026 as the payment, CAP and rebuttal deadline and states that missing the rebuttal deadline waives further rebuttal rights.',status:'Source-supported',source:'March 13, 2026 SIU demand'},
      {fact:'The provider rebuttal is dated March 20, 2026 and disputes the claim count, document receipt, claim scope, claim-specific rationale and extrapolation.',status:'Provider position',source:'March 20, 2026 provider rebuttal'},
      {fact:'The rebuttal states that the 97153 worksheet showed 31 of 32 lines graded A and that the 97155 worksheet showed 8 of 30 graded A, but it then describes the combined result as 39 of 60. The denominator cannot be reconciled from that statement alone.',status:'Arithmetic conflict',source:'March 20, 2026 provider rebuttal'},
      {fact:'The provider-prepared audit list links reviewed 97155 lines to alleged supporting 97153 records and provider explanations. It is not itself a payer determination.',status:'Source classification',source:'Provider feedback audit list'},
      {fact:'Thirty claim lines are represented in the redacted structured sample.',status:'Sample-supported',source:'Structured claim worksheet data'},
      {fact:'The sample records 22 of 30 lines as initially unsupported (73% by count).',status:'Calculated',source:'Structured claim worksheet data'},
      {fact:'The sample records 27 of 30 lines as unsupported after rebuttal, including five A-to-B changes.',status:'Calculated',source:'Structured claim worksheet data'},
      {fact:'The sampled paid amount is $3,469.64; $2,949.64 is associated with finally unsupported lines.',status:'Calculated',source:'Structured claim worksheet data'},
      {fact:'The reported demand separates an individual NPI ending 0215 from a group NPI ending 1029.',status:'Provider-reported',source:'Underlying demand letter required'},
      {fact:'June 8, 2022 is reported as the individual provider enrollment effective date.',status:'Provider-reported',source:'Official enrollment record required'},
      {fact:'The group NPI is reported as not enrolled during the relevant period.',status:'Provider-reported',source:'Official enrollment history required'},
      {fact:'The April 14, 2026 deadline is verified for the March 13 demand. Any deadline connected with the later NPI/enrollment stage still requires its operative letter and receipt evidence.',status:'Partially verified',source:'March 13 demand; later letter required'}
    ]),
    sourcePacket: Object.freeze([
      {title:'December 12, 2024 records request and attestation packet',status:'Received',scope:'Payer request, submission instructions, 60-entry patient-record schedule, attestation and provider-signature pages.'},
      {title:'March 13, 2026 SIU overpayment demand',status:'Received',scope:'59/60 stated result, $64,733 demand, component breakdown, CAP request and April 14 deadline.'},
      {title:'March 20, 2026 provider rebuttal',status:'Received',scope:'Provider assertions concerning worksheet counts, missing records, claim scope, 97155 criteria, CAP and extrapolation.'},
      {title:'Provider-prepared audit list with feedback',status:'Received',scope:'Claim/support mapping and provider explanations; not a payer-authored final determination.'},
      {title:'Complete 97153 and 97155 payer worksheets',status:'Incomplete',scope:'Needed to reconcile 59/60, 31/32, 8/30 and the provider rebuttal denominator.'},
      {title:'Operative later NPI/enrollment demand and CAP',status:'Needed',scope:'Needed to connect the later $567,096.77 reported components to the earlier $64,733 demand.'}
    ]),
    questions: Object.freeze([
      {
        question:'How do the earlier $64,733 demand and later $567,096.77 reported components relate?',
        currentAnswer:'The March 13 demand supports $64,733.00. Later materials report separate enrollment-related components totaling $567,096.77, but the current packet does not establish whether the later amount supersedes, adds to or independently recalculates the earlier demand.',
        needed:'Operative later demand, CAP, claim schedule and written explanation tying each component to the prior audit stage.',
        significance:'Each demand stage, claim universe and recovery theory must be kept separate before counsel evaluates the matter.'
      },
      {
        question:'Can the payer and provider claim counts be reconciled?',
        currentAnswer:'The payer states 59 of 60 unsupported. The provider rebuttal cites 31 of 32 supported for 97153 and 8 of 30 supported for 97155, then uses a denominator of 60. Those statements do not reconcile on their face.',
        needed:'Both complete payer worksheets, row-level grades, duplicate/related-service rules and a deduplicated claim-line index.',
        significance:'A reliable denominator is required before calculating an error rate or testing extrapolation.'
      },
      {
        question:'Which NPI was billing, rendering, supervising or contracting on each affected claim?',
        currentAnswer:'The current sample distinguishes NPIs ending 0215 and 1029 but does not establish their legal or claim-field roles for the full universe.',
        needed:'837/835 data, CMS-1500 claim images, contracts, rosters and group-member linkage records.',
        significance:'Enrollment and billing requirements may differ by role, provider type and date of service.'
      },
      {
        question:'What enrollment rule and payer instruction applied on each date of service?',
        currentAnswer:'Current NYSDOH guidance states that providers joining an MCO network must also enroll in NY Medicaid. Historical applicability has not been established for every date of service.',
        needed:'Archived DOS-effective statutes, regulations, manuals, model contract clauses and Anthem instructions.',
        significance:'A current rule cannot be assumed to govern an earlier claim without effective-date validation.'
      },
      {
        question:'What contract, provider manual and reimbursement-policy provisions form part of the agreement?',
        currentAnswer:'The current record does not identify the executed provider agreement or the specific manual and policy versions Anthem relies on.',
        needed:'Executed contracts, amendments, incorporated manuals, reimbursement policies and change notices effective during each claim period.',
        significance:'Contractual authority, incorporation and hierarchy are standard issues in payer recoupment review.'
      },
      {
        question:'Was enrollment pending, retroactive, provisional or otherwise effective for any disputed period?',
        currentAnswer:'No reliable enrollment application history or official effective-date determination is presently attached.',
        needed:'eMedNY correspondence, applications, approval notices, enrollment files and communications with Anthem.',
        significance:'The chronology may affect how the enrollment allegation applies, subject to governing law and counsel analysis.'
      },
      {
        question:'Are documentation findings independent, alternative grounds or limited to particular lines?',
        currentAnswer:'The March 13 demand concerns documentation support for CPT 97153 and 97155. Later materials add enrollment findings. The current evidence does not establish whether those are alternative grounds, cumulative grounds or separate recovery calculations.',
        needed:'Complete initial worksheets, provider submission index, rebuttal-review worksheet, later demand and payer methodology.',
        significance:'Clinical review does not, by itself, establish waiver of an enrollment issue; each asserted ground requires separate analysis.'
      },
      {
        question:'Were all reviewed claims requested, submitted and actually considered?',
        currentAnswer:'The provider rebuttal alleges that one submitted record was marked not received, that only part of a worksheet was supplied, and that at least two reviewed claims were outside the original request. These assertions have not yet been matched row by row.',
        needed:'Original request schedule, shipping proof, USB or production manifest, Bates/index record, full review worksheets and payer intake logs.',
        significance:'The evidence chain may determine whether a finding reflects a missing record, a transmission gap, a scope discrepancy or an actual documentation deficiency.'
      },
      {
        question:'What exact 97155 documentation rule did the reviewer apply?',
        currentAnswer:'The provider feedback sheet reproduces repeated language concerning technician documentation, technician identification, dates on assessments/plans and documentation standards. It does not isolate which element applied to each line.',
        needed:'Claim-specific rationale, the cited CPT Assistant pages, the DOS-effective Medicaid reimbursement policy and the exact records reviewed for each line.',
        significance:'Counsel may need to distinguish protocol modification performed directly by the qualified professional from simultaneous direction of a technician, subject to the controlling policy and record.'
      },
      {
        question:'Were notice, recovery-window and dispute-process requirements satisfied?',
        currentAnswer:'The current NY Medicaid managed-care reference identifies a six-year recovery period and advance written notice, but payment dates, initiation date, exceptions and DOS-effective authority are incomplete.',
        needed:'Payment dates, recovery notice, receipt proof, operative contract and allegations invoking any exception.',
        significance:'Procedural compliance can affect available objections and deadlines, subject to attorney interpretation.'
      },
      {
        question:'Did Anthem use sampling, extrapolation or another method to calculate the broader demand?',
        currentAnswer:'The March 13 letter expressly labels $64,573 as extrapolated for CPT 97155 and $160 as direct for CPT 97153. No sampling frame, calculation or statistical methodology is included in the supplied demand.',
        needed:'Claim universe, sampling frame, seed and selection method, error definitions, paid-claim data, calculation workbook, precision/confidence measures if used and authority for extrapolation.',
        significance:'Sampling validity and extrapolation authority are recurring reimbursement-audit questions when a sample is used to support a larger demand.'
      },
      {
        question:'Are the legal authorities cited in the provider rebuttal applicable to this payer, program and audit posture?',
        currentAnswer:'The provider rebuttal cites New York Insurance Law section 3224 and 18 NYCRR 515.2. The current workspace records those citations as provider arguments only and has not validated their applicability or effect.',
        needed:'Complete statutory and regulatory text, DOS-effective versions, Medicaid managed-care contract provisions and counsel analysis of forum and procedure.',
        significance:'A citation should not be treated as controlling until counsel confirms that it governs this entity, program, determination and procedural stage.'
      },
      {
        question:'What recovery mechanism is Anthem invoking?',
        currentAnswer:'The March 13 letter demands payment by check or a payment arrangement and describes recovery of an overpayment. The current packet does not establish whether Anthem later pursued offset, administrative referral, collection or litigation.',
        needed:'Later demand language, contract remedies, offset notices, account statements and any referral correspondence.',
        significance:'The available process, objections and timing may differ with the asserted recovery mechanism.'
      },
      {
        question:'How do authorization, credentialing and repeated payment relate to the allegations?',
        currentAnswer:'The provider reports prior authorization and repeated payment, but supporting records are not attached. Payment history does not itself establish enrollment compliance.',
        needed:'Authorizations, credentialing files, remittances, provider directory records and payer communications.',
        significance:'These facts may inform notice, reliance, contract interpretation or equitable arguments, but no conclusion can be drawn without the complete record.'
      },
      {
        question:'Could waiver, estoppel, unjust enrichment or similar equitable theories be raised?',
        currentAnswer:'The present record does not establish the required elements of any equitable theory.',
        needed:'Proof of payer representations or concealment, reasonable reliance, resulting prejudice and the limits applicable to a government-funded program.',
        significance:'These theories are fact-intensive and remain solely for attorney evaluation.'
      },
      {
        question:'Does the payer allege fraud, intentional misconduct or abusive billing?',
        currentAnswer:'The materials currently represented in the workspace do not establish the precise allegation or whether Anthem invokes a fraud-related exception.',
        needed:'Final demand, SIU referral language, investigative notices and cited exception authority.',
        significance:'The characterization may affect recovery periods, process and the type of counsel expertise required.'
      }
    ]),
    sources: Object.freeze([
      {title:'NYSDOH — Information for Health Care Providers',url:'https://www.health.ny.gov/health_care/managed_care/providers/index.htm',scope:'Current enrollment guidance; historical applicability requires validation.'},
      {title:'42 C.F.R. § 438.602',url:'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-C/part-438/subpart-H/section-438.602',scope:'Current federal Medicaid managed-care screening and enrollment framework.'},
      {title:'42 C.F.R. § 455.410',url:'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-C/part-455/subpart-E/section-455.410',scope:'Current federal enrollment and screening requirement.'},
      {title:'NYSDOH — Standard Clauses for Managed Care Contracts',url:'https://www.health.ny.gov/health_care/managed_care/hmoipa/standard_clauses_revisions.htm',scope:'Current recovery and notice reference; operative version must be confirmed.'},
      {title:'Anthem NY — Claims submissions and disputes',url:'https://providers.anthem.com/new-york-provider/claims/claims-submissions-and-disputes',scope:'Current provider dispute process; historical or case-specific procedure must be confirmed.'},
      {title:'New York Insurance Law § 3224-a',url:'https://www.nysenate.gov/legislation/laws/ISC/3224-A',scope:'Provider rebuttal cites section 3224 generally; counsel must confirm the exact provision and applicability.'},
      {title:'18 NYCRR Part 515',url:'https://regs.health.ny.gov/content/part-515-provider-sanctions',scope:'Provider rebuttal cites 18 NYCRR 515.2; counsel must confirm whether and how Part 515 applies to this managed-care SIU matter.'}
    ])
  })
});
