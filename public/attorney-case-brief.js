window.AuditDefendAttorneyBriefs = Object.freeze({
  'case-anthem': Object.freeze({
    title: 'Counsel issue brief — claim/evidence reconciliation completed',
    notice: 'This workspace organizes facts, open questions and potentially relevant authorities. It does not determine liability, predict an outcome or recommend a legal position. Every assessment remains subject to attorney review and decision.',
    provenance: 'The source packet establishes an earlier records-request and demand stage for Case C2024-8723: a December 12, 2024 records request with a 60-entry patient-record schedule; a March 13, 2026 SIU demand; a March 20, 2026 provider rebuttal; and a provider-prepared claim/support map. The September 8, 2026 payer worksheet supplies 30 later CPT 97155 review rows. Each of those 30 rows has now been matched to a corresponding record in the private provider repository. That source match does not establish payer receipt, substantive sufficiency or a legal defense. The earlier $64,733 demand and later $567,096.77 reported components remain separate stages that must be reconciled rather than combined.',
    evidenceSummary: Object.freeze([
      {label:'Accepted by payer',value:3,status:'Payer result',detail:'The later worksheet marks three rows supported after rebuttal.'},
      {label:'Evidence available for rebuttal review',value:22,status:'Content review required',detail:'These rows retain a documentation finding, but a corresponding provider record has been located for claim-level comparison.'},
      {label:'Still missing a source match',value:0,status:'Repository result',detail:'Every one of the 30 later payer-review rows has a corresponding source match.'},
      {label:'Enrollment or other issue',value:5,status:'Separate issue review',detail:'These rows have no remaining documentation-support finding; the payer identifies an NPI enrollment issue.'}
    ]),
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
      {fact:'A private provider repository search returned 47 filename matches for CPT 97153 and 32 filename matches for CPT 97155.',status:'Repository inventory',source:'Private provider repository reviewed September 28, 2026'},
      {fact:'All 30 later CPT 97155 payer-review rows were matched to corresponding provider-source records using member, service-date, CPT and, where necessary, claim-reference information.',status:'Crosswalk completed',source:'September 8, 2026 payer worksheet and private provider repository'},
      {fact:'The later worksheet contains three payer-supported rows, 22 rows with a documentation finding and a matched provider record, and five rows whose remaining issue is NPI enrollment rather than documentation support.',status:'Calculated from payer worksheet',source:'September 8, 2026 payer worksheet and redacted claim/evidence crosswalk'},
      {fact:'Two later rows identify a rendering provider separately from the group billing NPI ending 1029. Rendering-provider identity and the billing-NPI enrollment allegation must not be conflated.',status:'Source-supported distinction',source:'September 8, 2026 payer worksheet'},
      {fact:'A representative 2020 CPT 97155 PDF preview displayed a SOAP-note format and a visible handwritten signature area. A representative 2021 CPT 97153 PDF preview displayed a session-record format with populated technician/signature fields.',status:'Representative visual inspection',source:'Private provider repository; member details and exact dates redacted'},
      {fact:'The repository inventory includes duplicate or variant filenames. One malformed date-like filename was resolved through the record’s internal service date and matching claim reference. Source matching still does not establish completeness, payer receipt, the version reviewed or legal sufficiency.',status:'Verification limitation',source:'Private provider repository inventory and claim/evidence crosswalk'},
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
      {title:'September 8, 2026 CPT 97155 payer review worksheet',status:'Received and extracted',scope:'Thirty later review rows, including initial and rebuttal results, line-level findings and NPI enrollment language.'},
      {title:'Private provider source repository',status:'Thirty-row crosswalk completed',scope:'All 30 later CPT 97155 review rows have a corresponding provider-source record. Content sufficiency, version history and payer receipt remain for claim-level review.'},
      {title:'Complete CPT 97153 payer worksheet',status:'Incomplete',scope:'Still needed to reconcile the earlier 59/60, 31/32 and provider-rebuttal denominator statements.'},
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
        currentAnswer:'The earlier payer statement of 59 of 60 and the provider rebuttal references to 31 of 32 and 8 of 30 still do not reconcile on their face. The later 30-row worksheet is now available and shows three rows supported after rebuttal and 27 unsupported.',
        needed:'The complete earlier CPT 97153 worksheet, duplicate/related-service rules and a deduplicated index connecting the earlier and later stages.',
        significance:'A reliable denominator is required before calculating an error rate or testing extrapolation.'
      },
      {
        question:'Which NPI was billing, rendering, supervising or contracting on each affected claim?',
        currentAnswer:'The later worksheet identifies the rendering provider and the billing-NPI allegation separately. Two rows use rendering NPIs distinct from the group billing NPI ending 1029. Claim-field roles for the full universe still require primary claim records.',
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
        currentAnswer:'The later 30-row worksheet records 22 rows with both documentation-support and NPI-enrollment issues, five rows with an NPI-enrollment issue but no remaining documentation-support finding, and three rows supported by the payer. The later demand must still establish how these grounds affect the recovery calculation.',
        needed:'Complete earlier worksheets, provider submission index, operative later demand and payer methodology.',
        significance:'Clinical review does not, by itself, establish waiver of an enrollment issue; each asserted ground requires separate analysis.'
      },
      {
        question:'Were all reviewed claims requested, submitted and actually considered?',
        currentAnswer:'The provider rebuttal alleges that one submitted record was marked not received, that only part of a worksheet was supplied, and that at least two reviewed claims were outside the original request. All 30 later CPT 97155 rows now have a provider-source match, but repository presence does not prove that the same version was produced to or reviewed by Anthem.',
        needed:'Original request schedule, exported file manifest and hashes, shipping or portal-upload proof, Bates/index record, the earlier review worksheets and payer intake logs.',
        significance:'The evidence chain may determine whether a finding reflects a missing record, a transmission gap, a scope discrepancy or an actual documentation deficiency.'
      },
      {
        question:'Do the current provider copies factually contradict any missing-note or missing-signature finding?',
        currentAnswer:'A claim-level source crosswalk now links all 30 later payer rows to corresponding provider records. For the 22 rows retaining a documentation finding, this creates evidence available for rebuttal review. It does not yet establish that each record answers the specific finding or that Anthem received the same version.',
        needed:'Full-file inspection against each line-level payer rationale, signature and credential review, file metadata, version history and proof identifying what Anthem actually received and reviewed.',
        significance:'This comparison can determine whether a matched record factually addresses the payer finding and belongs in a rebuttal package. Any conclusion remains subject to attorney review and decision.'
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
