window.AuditDefendCaseData = Object.freeze({
  caseLabel: 'Anthem SIU Case C2024-8723 — Redacted Real-Case Structure',
  source: 'Redacted structure derived from the supplied records request, March 2026 demand, provider rebuttal, provider-prepared support map, the September 8, 2026 30-line review worksheet and a private provider source-repository inventory',
  caseContext: Object.freeze({
    payer:'Anthem',program:'NY Medicaid Managed Care',state:'NY',dosPrecision:'YEAR_ONLY_REDACTED',
    recordsRequestDate:'2024-12-12',recordsRequestEntries:60,
    providerReportedSubmissionCount:60,providerSubmissionReportedOn:'2026-03-20',
    providerSubmissionBasis:'The provider rebuttal states that all requested documentation was compiled and shipped in January 2025 as hard copy and USB, approximately 2,000 pages.',
    providerSubmissionStatus:'Provider-reported from attached rebuttal; not independently verified',
    initialDemandDate:'2026-03-13',initialDemand:64733,direct97153:160,extrapolated97155:64573,
    providerRebuttalDate:'2026-03-20',initialResponseDeadline:'2026-04-14',
    laterReviewLines:30,laterReportedComponents:567096.77,
    providerRepository:'Private provider repository',repositoryReviewedOn:'2026-09-28',located97153Matches:47,located97155Matches:32,
    reconciled97155ClaimLines:30,verified97155SourceMatches:30,documentationFindingSourceMatches:22
  }),
  assertedOverpayment: 567096.77,
  privacyNote: 'Member names, DOBs, member IDs, claim numbers and full NPIs are intentionally not published.',
  evidenceReconciliation: Object.freeze({
    reviewedOn:'2026-09-28',
    scope:'All 30 CPT 97155 payer-review rows were matched to the private provider repository.',
    limitation:'A source match confirms that a corresponding provider record was located. It does not establish that the payer received the record, that the record satisfies every payer finding or that repayment is unwarranted.',
    records:Object.freeze(Object.fromEntries(Array.from({length:30},(_,index)=>{
      const id=`CL-${String(index+1).padStart(3,'0')}`;
      return [id,Object.freeze({
        status:'verified',
        type:'CPT 97155 clinical record',
        source:'Private provider repository',
        locator:`Verified private source match ${String(index+1).padStart(2,'0')}`,
        matchBasis:id==='CL-005'?'Member, claim reference, CPT and internal service date':'Member, date of service and CPT',
        reviewedOn:'2026-09-28',
        reviewStage:'available-for-rebuttal-review',
        submissionStatus:'not verified'
      })];
    })))
  }),
  claims: [
    {id:'CL-001',year:2020,cpt:'97155',units:6,charged:412.50,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-002',year:2020,cpt:'97155',units:4,charged:275.00,paid:80.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-003',year:2020,cpt:'97155',units:5,charged:343.75,paid:100.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-004',year:2021,cpt:'97155',units:3,charged:206.25,paid:60.00,initial:'A',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['NPI enrollment on DOS']},
    {id:'CL-005',year:2021,cpt:'97155',units:6,charged:672.00,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-006',year:2021,cpt:'97155',units:7,charged:784.00,paid:140.00,initial:'A',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['NPI enrollment on DOS']},
    {id:'CL-007',year:2023,cpt:'97155',units:6,charged:672.00,paid:120.00,initial:'A',rebuttal:'A',provider:'Provider A · NPI ••••0215',issues:[]},
    {id:'CL-008',year:2023,cpt:'97155',units:12,charged:1344.00,paid:240.00,initial:'A',rebuttal:'A',provider:'Provider A · NPI ••••0215',issues:[]},
    {id:'CL-009',year:2024,cpt:'97155',units:6,charged:672.00,paid:115.56,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',billingNpi:'••••1029',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-010',year:2020,cpt:'97155',units:4,charged:275.00,paid:80.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-011',year:2021,cpt:'97155',units:8,charged:550.00,paid:160.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-012',year:2021,cpt:'97155',units:3,charged:206.25,paid:60.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-013',year:2020,cpt:'97155',units:8,charged:550.00,paid:160.00,initial:'A',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['NPI enrollment on DOS']},
    {id:'CL-014',year:2023,cpt:'97155',units:8,charged:896.00,paid:160.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-015',year:2023,cpt:'97155',units:8,charged:896.00,paid:160.00,initial:'A',rebuttal:'A',provider:'Provider A · NPI ••••0215',issues:[]},
    {id:'CL-016',year:2024,cpt:'97155',units:8,charged:896.00,paid:154.08,initial:'B',rebuttal:'B',provider:'Provider C · NPI ••••2911',billingNpi:'••••1029',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-017',year:2021,cpt:'97155',units:5,charged:560.00,paid:100.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-018',year:2021,cpt:'97155',units:6,charged:672.00,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-019',year:2020,cpt:'97155',units:6,charged:412.50,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-020',year:2020,cpt:'97155',units:6,charged:412.50,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-021',year:2020,cpt:'97155',units:6,charged:412.50,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-022',year:2020,cpt:'97155',units:4,charged:275.00,paid:80.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-023',year:2020,cpt:'97155',units:6,charged:412.50,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-024',year:2021,cpt:'97155',units:4,charged:275.00,paid:80.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-025',year:2021,cpt:'97155',units:6,charged:412.50,paid:120.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-026',year:2021,cpt:'97155',units:5,charged:560.00,paid:100.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-027',year:2021,cpt:'97155',units:4,charged:448.00,paid:80.00,initial:'A',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['NPI enrollment on DOS']},
    {id:'CL-028',year:2022,cpt:'97155',units:4,charged:448.00,paid:80.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']},
    {id:'CL-029',year:2022,cpt:'97155',units:6,charged:672.00,paid:120.00,initial:'A',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['NPI enrollment on DOS']},
    {id:'CL-030',year:2023,cpt:'97155',units:4,charged:448.00,paid:80.00,initial:'B',rebuttal:'B',provider:'Provider A · NPI ••••0215',issues:['Documentation support','NPI enrollment on DOS']}
  ]
});
