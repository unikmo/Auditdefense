(() => {
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const issueMap = [
    { id: 'provider-npi-enrollment', test: /enroll|npi|credential|network|provider role/i, label: 'Provider enrollment and NPI roles' },
    { id: 'documentation-support', test: /document|record|received|claim.*support|evidence|audit/i, label: 'Documentation and evidence' },
    { id: 'assessment-treatment-plan', test: /assessment|treatment plan|medical necessity/i, label: 'Assessment and treatment plan' },
    { id: 'signatures-authentication', test: /signature|authentication|signed/i, label: 'Signatures and authentication' },
    { id: 'authorization-units', test: /authorization|units|medical necessity/i, label: 'Authorization and units' },
    { id: 'coding-ncci', test: /code|coding|97153|97155|cpt/i, label: 'Coding and billing' },
    { id: 'credentialing-network', test: /contract|network|payer|program|standing|recovery|overpayment/i, label: 'Contract, network, and recovery process' }
  ];

  function issueFor(question) {
    const text = String(question || '');
    return issueMap.filter(item => item.test.test(text)).map(item => item.id);
  }

  function checkDraft(text, brief = {}) {
    const draft = String(text || '');
    const flags = [];
    const add = (id, title, detail) => flags.push({ id, title, detail });

    if (/\b27\s*(?:of|\/|out of)\s*30\b/i.test(draft) && /\b73\s*%/i.test(draft)) {
      add('denominator', 'Check the denominator and percentage', '27 of 30 is 90%. Verify whether 73% refers to a different count or denominator before using both figures.');
    }
    const hasLaterUnsupported = (brief.facts || []).some(item => /27 of 30.*unsupported after rebuttal/i.test(item.fact || ''));
    if (hasLaterUnsupported && /essentially eliminated|eliminated the findings|all findings were reversed|reversed all findings/i.test(draft)) {
      add('rebuttal-result', 'Reconcile this statement with the later worksheet', 'The case record includes a later report of 27 of 30 lines unsupported after rebuttal. Confirm the draft describes each review stage accurately.');
    }
    if (/\$64,733(?:\.00)?/i.test(draft) && /\$567,096\.77/i.test(draft)) {
      add('demand-stages', 'Keep the demand stages separate', 'The brief treats $64,733 and $567,096.77 as separate reported stages whose relationship is unresolved. Do not combine or characterize them as one demand without a source-backed reconciliation.');
    }
    if (/the court will (?:rule|decide|find)|no court (?:would|will)|will (?:win|lose) in court|guaranteed (?:defense|recovery)/i.test(draft)) {
      add('outcome-prediction', 'Remove or qualify an outcome prediction', 'The workspace provides historical information only. Counsel decides whether and how to make a case-specific argument.');
    }
    if (/legally acknowledged|textbook.{0,20}bad faith|invalidates? (?:the )?audit|cannot (?:conduct|perform|review) (?:a )?clinical audit|un-enrolled.{0,50}(?:cannot|may not).{0,30}(?:audit|review)/i.test(draft)) {
      add('legal-effect-inference', 'Separate the audit record from its legal effect', 'The reported worksheet may show clinical review and enrollment findings in the same audit. Do not treat that fact alone as an admission, waiver, estoppel, bad faith, or a bar to recovery; counsel must assess the governing authority and record.');
    }
    if (/the payer (?:admitted|conceded|accepted) (?:the )?(?:care|services|clinical|medical necessity)|documentation (?:was|is) proven (?:valid|sufficient) by (?:anthem|the payer)/i.test(draft)) {
      add('clinical-admission', 'Verify any claimed payer admission', 'A documentation grade and an enrollment finding are separate reported grounds. The record must show exactly what the payer found and whether it made an express admission.');
    }
    if (/97153.{0,60}(?:documentation failure|documentation unsupported|missing documentation)|(?:documentation failure|documentation unsupported).{0,60}97153/i.test(draft)) {
      add('97153-stage', 'Check the reported 97153 review result', 'The provider email reports that all 19 later 97153 changes were enrollment-only and that documentation passed. Verify against the payer-authored worksheet before describing this as a payer finding.');
    }
    if (/provider alone was responsible|solely the provider.{0,30}(?:enroll|registration)|insurer.{0,30}had the duty to (?:check|verify|confirm) enrollment/i.test(draft)) {
      add('enrollment-duty', 'Source the asserted enrollment duty', 'The record should identify the DOS-effective rule, contract term, payer instruction, claim role and relevant enrollment data before assigning responsibility. Counsel decides the legal effect.');
    }
    if (/child(?:ren)?'?s health plus|\bCHP\b/i.test(draft) && /medicaid managed care|\bMMC\b/i.test(draft) && /same rule|same deadline|same lookback|six.year|24.month/i.test(draft)) {
      add('product-line', 'Verify product-line treatment separately', 'The draft refers to CHP and Medicaid managed care together. Confirm the product and applicable policy for each claim and service date.');
    }
    if (!flags.length) flags.push({ id: 'manual-review', title: 'No configured conflict was triggered', detail: 'This rule-based screen is limited. It does not verify facts, citations, completeness, legal sufficiency, or the absence of contradictions.' });
    return flags;
  }

  function relatedCases(question, cases) {
    const issueIds = issueFor(question);
    return (cases || []).filter(item => (item.relatedIssueIds || []).some(id => issueIds.includes(id)));
  }

  function renderReference(item) {
    const args = item.argumentsInRecord || item.litigationPositions || ''; const argumentSummary = args || 'No separate party-argument or attorney-strategy summary is recorded for this decision.';
    return '<article class="response-reference"><div class="response-reference-head"><div><span class="response-reference-label">Historical decision</span><h5>' + esc(item.caseName) + '</h5><p>' + esc(item.citation) + ' · ' + esc(item.court) + ' · ' + esc(item.decisionDate) + '</p></div><span class="response-reference-status">' + esc(item.precedentialStatus) + '</span></div><div class="response-reference-grid"><div><b>Procedural posture</b><p>' + esc(item.proceduralPosture) + '</p></div><div><b>Disposition</b><p>' + esc(item.disposition) + '</p></div><div><b>What the court decided</b><p>' + esc(item.holdingSummary) + '</p></div><div><b>Party arguments or strategy described in the opinion</b><p>' + esc(argumentSummary) + '</p></div><div><b>Material facts</b><p>' + esc(item.materialFacts || 'Not summarized in this reference record.') + '</p></div><div><b>Why it is linked</b><p>' + esc(item.relevance) + '</p></div><div><b>Limits on comparison</b><p>' + esc(item.limitations) + '</p></div></div><a href="' + esc(item.source?.url || '#') + '" target="_blank" rel="noopener noreferrer">Open cited decision ↗</a><small>Source: ' + esc(item.source?.publisher || 'source not recorded') + ' · ' + esc(item.source?.locator || '') + ' · verified ' + esc(item.source?.verifiedOn || 'date not recorded') + '</small></article>';
  }

  function render(brief, caseId) {
    if (!brief) return '';
    const questions = brief.questions || [];
    const facts = brief.facts || [];
    const flaggedFacts = facts.filter(item => /conflict|unverified|partial|reported|verification limitation|requires/i.test(item.status || ''));
    const map = questions.map((item, index) => {
      const matches = relatedCases(item.question, window.AuditDefendAttorneyResponseGuidance.cases);
      const labels = issueFor(item.question).map(id => issueMap.find(x => x.id === id)?.label).filter(Boolean);
      return '<details class="response-map-row" ' + (index === 0 ? 'open' : '') + '><summary><span class="response-map-number">' + (index + 1) + '</span><div><b>' + esc(item.question) + '</b><small>' + esc(labels.join(' · ') || 'Issue classification requires attorney review') + '</small></div></summary><div class="response-map-body"><div><b>Current factual record</b><p>' + esc(item.currentAnswer) + '</p></div><div><b>Evidence or policy information still needed</b><p>' + esc(item.needed) + '</p></div><div><b>Why this question is surfaced</b><p>' + esc(item.significance) + '</p></div><div class="response-related"><b>Related historical decisions</b>' + (matches.length ? matches.map(renderReference).join('') : '<p>No issue-tagged verified decision is currently linked. That is a research gap, not an inference about the law.</p>') + '</div><small class="response-reservation">Issue tags and summaries are research aids. Counsel determines relevance, governing law, and strategy.</small></div></details>';
    }).join('');
    const review = flaggedFacts.length ? flaggedFacts.map(item => '<li><b>' + esc(item.status) + ':</b> ' + esc(item.fact) + ' <span>Source: ' + esc(item.source) + '</span></li>').join('') : '<li>No flagged fact statuses are configured in this case brief. Verify the source ledger.</li>';
    const updates = (brief.providerReportedSchedule || []).map(item => '<article class="response-reported-card"><div><span class="response-reference-label">Provider-reported · source: ' + esc(item.source) + '</span><h5>' + esc(item.title) + '</h5><b>' + esc(item.amount) + '</b><small>' + esc(item.period) + '</small></div><p>' + esc(item.detail) + '</p><p><b>Still needed:</b> ' + esc(item.needed) + '</p></article>').join('');
    const updateSection = updates ? '<section class="response-reported"><h4>Claim and demand breakdown reported to counsel</h4><p>These are statements in the October 6 email, not verified payer findings. The payer lists reportedly omit product line and paid dates. The claim-level records and source links are still needed before drawing claim-specific conclusions.</p><div class="response-reported-grid">' + updates + '</div></section>' : '';
    return '<section class="response-guidance"><div class="response-guidance-head"><div><span class="eyebrow">RESPONSE PREPARATION</span><h3>Organize the facts before drafting</h3><p>Each question links the current record, missing evidence or policy, and any issue-tagged historical decisions.</p></div><span class="response-guidance-badge">Attorney decides strategy</span></div><div class="response-guidance-warning"><b>Facts and gaps to reconcile</b><ul>' + review + '</ul></div>' + updateSection + '<h4>Claim and policy issue map</h4><p class="response-guidance-intro">This brief contains aggregate facts and open questions. It does not contain a complete row-by-row claim schedule. Add or verify the claim identifier, service date, product, payment date, billing and rendering roles, payer finding, evidence reference, and applicable policy version before relying on a claim-specific statement.</p><div class="response-map-list">' + map + '</div><div class="response-draft-check"><label for="attorneyDraftText"><b>Check a draft for configured consistency risks</b><span>Text is checked in this browser only and is not saved or sent.</span></label><textarea id="attorneyDraftText" rows="7" placeholder="Paste a draft paragraph to check counts, demand stages, product-line mixing, and outcome predictions."></textarea><button type="button" class="secondary-btn" data-response-check data-response-case-id="' + esc(caseId || '') + '">Run consistency check</button><div id="attorneyDraftCheckResult" aria-live="polite"></div><small>This is a limited rules-based screen. A clear result does not establish accuracy, completeness, legal sufficiency, or lack of contradiction. Counsel must review the source record and final draft.</small></div></section>';
  }

  const api = {
    cases: [],
    ready: null,
    issueFor,
    relatedCases,
    checkDraft,
    render,
    setCases(items) { this.cases = Array.isArray(items) ? items : []; }
  };
  window.AuditDefendAttorneyResponseGuidance = api;
  api.ready = fetch('/reference-cases.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Reference cases unavailable')))
    .then(payload => api.setCases(payload.cases || []))
    .catch(error => { console.warn('Historical references unavailable', error); api.setCases([]); });
})();
