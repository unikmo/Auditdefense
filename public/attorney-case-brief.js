window.AuditDefendAttorneyBriefs = Object.freeze({
  'case-anthem': Object.freeze({
    title: 'Counsel issue brief — source validation in progress',
    notice: 'This workspace organizes facts, open questions and potentially relevant authorities. It does not determine liability, predict an outcome or recommend a legal position. Every assessment remains subject to attorney review and decision.',
    provenance: 'The claim-level metrics come from the structured 30-line redacted worksheet data. The demand components, enrollment dates and response date are provider-reported and must be matched to the operative payer documents.',
    financials: Object.freeze([
      {label:'Reported individual-NPI component',value:'$411,520.00',status:'Needs source confirmation',detail:'Reported as dates of service before June 8, 2022.'},
      {label:'Reported group-NPI component',value:'$155,576.77',status:'Needs source confirmation',detail:'Reported as a separate group billing-NPI allegation.'},
      {label:'Arithmetic total of components',value:'$567,096.77',status:'Calculated',detail:'$411,520.00 + $155,576.77.'},
      {label:'Prior workspace amount',value:'$567,656.77',status:'Conflict',detail:'This differs from the component total by $560.00 and must not be treated as established.'}
    ]),
    facts: Object.freeze([
      {fact:'Thirty claim lines are represented in the redacted structured sample.',status:'Sample-supported',source:'Structured claim worksheet data'},
      {fact:'The sample records 22 of 30 lines as initially unsupported (73% by count).',status:'Calculated',source:'Structured claim worksheet data'},
      {fact:'The sample records 27 of 30 lines as unsupported after rebuttal, including five A-to-B changes.',status:'Calculated',source:'Structured claim worksheet data'},
      {fact:'The sampled paid amount is $3,469.64; $2,949.64 is associated with finally unsupported lines.',status:'Calculated',source:'Structured claim worksheet data'},
      {fact:'The reported demand separates an individual NPI ending 0215 from a group NPI ending 1029.',status:'Provider-reported',source:'Underlying demand letter required'},
      {fact:'June 8, 2022 is reported as the individual provider enrollment effective date.',status:'Provider-reported',source:'Official enrollment record required'},
      {fact:'The group NPI is reported as not enrolled during the relevant period.',status:'Provider-reported',source:'Official enrollment history required'},
      {fact:'The response or CAP deadline is not verified in the current evidence set.',status:'Unverified',source:'Final letter/CAP and proof of receipt required'}
    ]),
    questions: Object.freeze([
      {
        question:'What is the exact demand amount and claim universe?',
        currentAnswer:'The reported components total $567,096.77, while the prior workspace showed $567,656.77. The $560 difference is unresolved.',
        needed:'Final demand, claim schedule, payment ledger and any extrapolation methodology.',
        significance:'The amount and affected claims must be reconciled before any theory can be evaluated.'
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
        currentAnswer:'The sample contains both documentation-support and enrollment findings. Their relationship to the full demand is not established.',
        needed:'Initial findings, rebuttal submission, final line-level decisions and payer methodology.',
        significance:'Clinical review does not, by itself, establish waiver of an enrollment issue; each asserted ground requires separate analysis.'
      },
      {
        question:'Were notice, recovery-window and dispute-process requirements satisfied?',
        currentAnswer:'The current NY Medicaid managed-care reference identifies a six-year recovery period and advance written notice, but payment dates, initiation date, exceptions and DOS-effective authority are incomplete.',
        needed:'Payment dates, recovery notice, receipt proof, operative contract and allegations invoking any exception.',
        significance:'Procedural compliance can affect available objections and deadlines, subject to attorney interpretation.'
      },
      {
        question:'Did Anthem use sampling, extrapolation or another method to calculate the broader demand?',
        currentAnswer:'The 30-line sample cannot presently be tied mathematically to the reported component total. No extrapolation methodology is attached.',
        needed:'Complete claim universe, sampling frame, methodology, error definitions, confidence calculations and line-to-demand reconciliation.',
        significance:'Sampling validity and extrapolation authority are recurring reimbursement-audit questions when a sample is used to support a larger demand.'
      },
      {
        question:'What recovery mechanism is Anthem invoking?',
        currentAnswer:'The current record does not establish whether Anthem proposes repayment, offset, recoupment, collection, administrative referral or litigation.',
        needed:'Demand language, contract remedies, offset notices, account statements and any referral correspondence.',
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
      {title:'Anthem NY — Claims submissions and disputes',url:'https://providers.anthem.com/new-york-provider/claims/claims-submissions-and-disputes',scope:'Current provider dispute process; historical or case-specific procedure must be confirmed.'}
    ])
  })
});
