window.AuditDefendEvidenceCaseSeed = Object.freeze({
  role: 'provider',
  threads: [
    {
      id: 'EV-001', claimId: 'CL-001', allegation: 'Sample payer finding: provider signature reported missing from assessment documentation.',
      payerSource: 'Supplied audit issue · exact claim-to-allegation mapping requires source verification', status: 'potential-conflict',
      evidence: [{id:'DOC-001',type:'Assessment report',location:'Provider document index › Assessment A-17',locator:'Page 4 · signature block',versionContext:'Current provider copy; original payer-submission version not yet established',fileName:'assessment-redacted.pdf',addedBy:'Provider',addedAt:'Sep 20, 2026 · 10:10 UTC',note:'A signature appears in the identified location. Signature timing, signer credentials and submission history remain to be verified.'}],
      counselNote: 'Compare the original payer submission and rebuttal copy before deciding whether the evidence contradicts the finding.', reviewedBy: 'Awaiting attorney disposition'
    },
    {
      id: 'EV-002', claimId: 'CL-005', allegation: 'Sample payer finding: technician session / SOAP note reported missing.',
      payerSource: 'Supplied audit issue · exact claim-to-allegation mapping requires source verification', status: 'unresolved',
      evidence: [
        {id:'DOC-002',type:'Session / SOAP note repository',location:'Private Dropbox › SCANNED › redacted member folders',locator:'Repository search returned 47 CPT 97153 and 32 CPT 97155 filename matches',versionContext:'Current provider copies; original payer-submission versions not yet established',fileName:'',addedBy:'Provider',addedAt:'Sep 26, 2026 · source inventory',note:'Code-and-date filenames show that potentially responsive records are maintained in the provider repository. Exact patient, DOS, claim-line, payer-receipt and version mapping remains outstanding.'},
        {id:'DOC-004',type:'Representative 97155 SOAP note',location:'Private Dropbox › SCANNED › redacted member folder',locator:'Representative 2020 record · visible signature area',versionContext:'Current provider copy; original payer-submission version not yet established',fileName:'97155-[DOS-REDACTED].pdf',addedBy:'Provider',addedAt:'Sep 26, 2026 · visually inspected',note:'The preview displayed a SOAP-note format and a visible handwritten signature area. Signer identity, credentials, timing, completeness and whether Anthem received this copy remain unverified.'},
        {id:'DOC-005',type:'Representative 97153 session record',location:'Private Dropbox › SCANNED › redacted member folder',locator:'Representative 2021 record · technician/signature fields populated',versionContext:'Current provider copy; original payer-submission version not yet established',fileName:'97153-[DOS-REDACTED].pdf',addedBy:'Provider',addedAt:'Sep 26, 2026 · visually inspected',note:'The preview displayed a session-record format with populated technician/signature fields. The exact payer finding, claim-line match, signature validity and submission history remain unverified.'}
      ],
      counselNote: 'Do not treat repository presence as proof of payer receipt or legal sufficiency. Match each record to the payer row and preserve the submitted-version chain before deciding whether a factual contradiction exists.', reviewedBy: 'Awaiting attorney disposition'
    },
    {
      id: 'EV-003', claimId: 'CL-004', allegation: 'Billing NPI reported not enrolled on the date of service.',
      payerSource: 'Redacted rebuttal-review structure · exact source row requires verification', status: 'unresolved',
      evidence: [{id:'DOC-003',type:'Enrollment / credentialing record',location:'Practice credentialing archive › eMedNY correspondence',locator:'Effective-date notice',versionContext:'Current provider copy; authoritative enrollment history not yet verified',fileName:'enrollment-letter-redacted.pdf',addedBy:'Provider',addedAt:'Sep 20, 2026 · 10:24 UTC',note:'Potential enrollment chronology source identified. Applicable program, NPI role and exact effective date require verification.'}],
      counselNote: 'Keep enrollment analysis separate from documentation sufficiency.', reviewedBy: 'Awaiting attorney disposition'
    }
  ],
  attorneyItems: [
    {id:'AT-001',claimId:'CL-001',type:'analysis',visibility:'counsel-only',title:'Signature comparison questions',body:'Verify the original submitted version, signature date, signer credentials and whether the payer reviewed the same copy.',fileName:'',author:'Sample Counsel',addedAt:'Sep 20, 2026 · 10:35 UTC'}
  ],
  notifications: [
    {id:'NT-001',audience:'provider',title:'Counsel requested source-version confirmation',body:'Open EV-001 in the secure workspace and identify which version was originally sent to the payer.',createdAt:'Sep 20, 2026 · 10:36 UTC',read:false,emailCopy:'New counsel item in your AuditDefend workspace.'}
  ],
  activity: [
    {id:'AC-004',actor:'Counsel',action:'Created a provider evidence request',detail:'EV-001 · shared in workspace; notification contains no claim detail',createdAt:'Sep 20, 2026 · 10:36 UTC'},
    {id:'AC-003',actor:'Counsel',action:'Added counsel-only analysis',detail:'AT-001 · access limited to counsel role',createdAt:'Sep 20, 2026 · 10:35 UTC'},
    {id:'AC-002',actor:'Provider',action:'Identified evidence source',detail:'EV-003 · enrollment correspondence location recorded',createdAt:'Sep 20, 2026 · 10:24 UTC'},
    {id:'AC-005',actor:'AuditDefend',action:'Inventoried private source repository',detail:'EV-002 · 47 CPT 97153 and 32 CPT 97155 filename matches; representative previews inspected without publishing member data',createdAt:'Sep 26, 2026 · UTC'},
    {id:'AC-001',actor:'Provider',action:'Identified evidence source',detail:'EV-002 · private source repository identified',createdAt:'Sep 20, 2026 · 10:18 UTC'}
  ]
});
