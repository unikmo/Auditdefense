(() => {
  const STORAGE_KEY = 'auditdefend-evidence-verification-v1';
  const caseClaims = window.AuditDefendCaseData?.claims || [];
  const statusLabels = Object.freeze({
    'potential-conflict': 'Potential contradiction — attorney review required',
    unresolved: 'Unresolved — additional evidence required',
    addressed: 'Evidence appears to address payer finding',
    supported: 'Payer finding supported by current record'
  });
  const seed = Object.freeze({
    role: 'provider',
    threads: [
      {
        id: 'EV-001', claimId: 'CL-001', allegation: 'Demonstration finding: provider signature reported missing from assessment documentation.',
        payerSource: 'Supplied audit issue · exact claim-to-allegation mapping requires source verification', status: 'potential-conflict',
        evidence: [{id:'DOC-001',type:'Assessment report',location:'Provider document index › Assessment A-17',locator:'Page 4 · signature block',versionContext:'Current provider copy; original payer-submission version not yet established',fileName:'assessment-redacted.pdf',addedBy:'Provider',addedAt:'Sep 20, 2026 · 10:10 UTC',note:'A signature appears in the identified location. Signature timing, signer credentials and submission history remain to be verified.'}],
        counselNote: 'Compare the original payer submission and rebuttal copy before deciding whether the evidence contradicts the finding.',
        reviewedBy: 'Awaiting attorney disposition'
      },
      {
        id: 'EV-002', claimId: 'CL-005', allegation: 'Demonstration finding: technician session / SOAP note reported missing.',
        payerSource: 'Supplied audit issue · exact claim-to-allegation mapping requires source verification', status: 'unresolved',
        evidence: [{id:'DOC-002',type:'Session / SOAP note',location:'PowerGM export › 2021 › redacted member folder',locator:'Exact service-date record to be retrieved',versionContext:'Record location supplied; file not yet reviewed',fileName:'',addedBy:'Provider',addedAt:'Sep 20, 2026 · 10:18 UTC',note:'Provider identified the likely source location. Exact patient, DOS, CPT and claim match remains outstanding.'}],
        counselNote: '', reviewedBy: 'Not reviewed'
      },
      {
        id: 'EV-003', claimId: 'CL-004', allegation: 'Billing NPI reported not enrolled on the date of service.',
        payerSource: 'Redacted rebuttal-review structure · exact source row requires verification', status: 'unresolved',
        evidence: [{id:'DOC-003',type:'Enrollment / credentialing record',location:'Practice credentialing archive › eMedNY correspondence',locator:'Effective-date notice',versionContext:'Current provider copy; authoritative enrollment history not yet verified',fileName:'enrollment-letter-redacted.pdf',addedBy:'Provider',addedAt:'Sep 20, 2026 · 10:24 UTC',note:'Potential enrollment chronology source identified. Applicable program, NPI role and exact effective date require verification.'}],
        counselNote: 'Keep enrollment analysis separate from documentation sufficiency.', reviewedBy: 'Awaiting attorney disposition'
      }
    ],
    attorneyItems: [
      {id:'AT-001',claimId:'CL-001',type:'analysis',visibility:'counsel-only',title:'Signature comparison questions',body:'Verify the original submitted version, signature date, signer credentials and whether the payer reviewed the same copy.',fileName:'',author:'Demo Counsel',addedAt:'Sep 20, 2026 · 10:35 UTC'}
    ],
    notifications: [
      {id:'NT-001',audience:'provider',title:'Counsel requested source-version confirmation',body:'Open EV-001 in the secure workspace and identify which version was originally sent to the payer.',createdAt:'Sep 20, 2026 · 10:36 UTC',read:false,emailCopy:'New counsel item in your AuditDefend workspace.'}
    ],
    activity: [
      {id:'AC-004',actor:'Counsel',action:'Created a provider evidence request',detail:'EV-001 · shared in workspace; notification contains no claim detail',createdAt:'Sep 20, 2026 · 10:36 UTC'},
      {id:'AC-003',actor:'Counsel',action:'Added counsel-only analysis',detail:'AT-001 · access limited to counsel role',createdAt:'Sep 20, 2026 · 10:35 UTC'},
      {id:'AC-002',actor:'Provider',action:'Identified evidence source',detail:'EV-003 · enrollment correspondence location recorded',createdAt:'Sep 20, 2026 · 10:24 UTC'},
      {id:'AC-001',actor:'Provider',action:'Identified evidence source',detail:'EV-002 · PowerGM location recorded; source file not retrieved',createdAt:'Sep 20, 2026 · 10:18 UTC'}
    ]
  });

  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const el = id => document.getElementById(id);
  const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const now = () => new Date().toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC',timeZoneName:'short'});
  let state = (() => { try { return {...clone(seed),...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')}; } catch { return clone(seed); } })();
  let filter = 'all';

  function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
  function toast(message){ const node=el('toast'); if(!node)return; node.textContent=message; node.classList.add('show'); clearTimeout(window.__evidenceToast); window.__evidenceToast=setTimeout(()=>node.classList.remove('show'),3200); }
  function claim(id){ return caseClaims.find(item=>item.id===id); }
  function versionLabel(value){ return ({current:'Current provider copy','original-submission':'Version originally sent to payer','rebuttal-submission':'Version sent with rebuttal',unknown:'Submission version not yet established'})[value] || value; }

  function renderKpis(){
    const conflict=state.threads.filter(item=>item.status==='potential-conflict').length;
    const unresolved=state.threads.filter(item=>item.status==='unresolved').length;
    const linked=state.threads.reduce((sum,item)=>sum+item.evidence.length,0);
    const shared=state.attorneyItems.filter(item=>item.visibility==='shared').length;
    el('evidenceKpis').innerHTML=[['Open evidence threads',state.threads.length,'Claim-level comparisons'],['Potential conflicts',conflict,'Attorney review required'],['Unresolved',unresolved,'Evidence or provenance missing'],['Evidence references',linked,'No file contents stored'],['Provider-shared counsel items',shared,'Explicitly shared only']].map(item=>`<div class="stat-card"><strong>${item[1]}</strong><span>${item[0]}</span><small>${item[2]}</small></div>`).join('');
    const badge=el('evidenceNavBadge'); if(badge) badge.textContent=String(conflict+unresolved);
  }

  function evidenceHtml(item){
    return item.evidence.map(doc=>`<div class="evidence-record"><div class="evidence-record-head"><div><b>${esc(doc.type)}</b><span>${esc(doc.id)} · supplied by ${esc(doc.addedBy)}</span></div>${doc.fileName?`<span class="file-chip">${esc(doc.fileName)} · metadata only</span>`:'<span class="file-chip muted">Location pointer only</span>'}</div><dl><div><dt>Location</dt><dd>${esc(doc.location)}</dd></div><div><dt>Page / section</dt><dd>${esc(doc.locator||'Not specified')}</dd></div><div><dt>Version context</dt><dd>${esc(doc.versionContext)}</dd></div><div><dt>Added</dt><dd>${esc(doc.addedAt)}</dd></div></dl><p>${esc(doc.note||'No provider note supplied.')}</p></div>`).join('');
  }

  function attorneyItemsHtml(thread){
    const items=state.attorneyItems.filter(item=>(item.claimId===thread.claimId||item.claimId==='case-wide')&&(state.role==='attorney'||item.visibility==='shared'));
    if(!items.length) return '<p class="evidence-empty">No attorney item is linked to this claim.</p>';
    return items.map(item=>`<div class="attorney-item ${item.visibility==='counsel-only'?'private':''}"><b>${esc(item.title)}</b><span>${item.visibility==='counsel-only'?'Counsel only':'Shared with provider'} · ${esc(item.addedAt)}</span><p>${esc(item.body)}</p>${item.fileName?`<small>${esc(item.fileName)} · local filename reference</small>`:''}</div>`).join('');
  }

  function threadHtml(thread){
    const row=claim(thread.claimId);
    const canReview=state.role==='attorney';
    return `<article class="evidence-thread" data-thread-id="${esc(thread.id)}"><header><div><span class="thread-id">${esc(thread.id)}</span><h3>${esc(thread.allegation)}</h3><p>${esc(thread.claimId)} · ${row?`${row.year} · CPT ${row.cpt} · ${row.provider}`:'Claim context unavailable'}</p></div><span class="evidence-status status-${esc(thread.status)}">${esc(statusLabels[thread.status])}</span></header><div class="payer-allegation"><b>Payer allegation source</b><span>${esc(thread.payerSource)}</span></div><details open><summary>Provider evidence (${thread.evidence.length})</summary>${evidenceHtml(thread)}</details><details class="attorney-material" ${state.role==='attorney'?'open':''}><summary>Attorney material</summary>${attorneyItemsHtml(thread)}</details><div class="thread-review"><label>Factual comparison status<select data-thread-status="${esc(thread.id)}" ${canReview?'':'disabled'}>${Object.entries(statusLabels).map(([value,label])=>`<option value="${value}" ${thread.status===value?'selected':''}>${esc(label)}</option>`).join('')}</select></label><div><small>Attorney note</small><p>${esc(thread.counselNote||'No attorney note recorded.')}</p><span>${esc(thread.reviewedBy)}</span></div>${canReview?'<button class="secondary-btn" type="button" data-save-thread="'+esc(thread.id)+'">Save attorney disposition</button>':'<span class="provider-review-note">Only counsel can change the comparison status.</span>'}</div></article>`;
  }

  function renderThreads(){
    const rows=filter==='all'?state.threads:state.threads.filter(item=>item.status===filter);
    el('evidenceThreadList').innerHTML=rows.length?rows.map(threadHtml).join(''):'<div class="empty-state compact">No evidence threads match this filter.</div>';
  }

  function renderRole(){
    document.querySelectorAll('[data-evidence-role]').forEach(button=>button.classList.toggle('active',button.dataset.evidenceRole===state.role));
    el('providerEvidencePanel').classList.toggle('hidden',state.role!=='provider');
    el('attorneyEvidencePanel').classList.toggle('hidden',state.role!=='attorney');
    renderThreads(); renderNotifications();
  }

  function renderNotifications(){
    const rows=state.notifications.filter(item=>item.audience===state.role);
    const unread=rows.filter(item=>!item.read).length;
    el('notificationUnread').textContent=`${unread} unread`;
    el('evidenceNotifications').innerHTML=rows.length?rows.map(item=>`<article class="evidence-notification ${item.read?'':'unread'}"><div><b>${esc(item.title)}</b><span>${esc(item.createdAt)}</span></div><p>${esc(item.body)}</p><small>Email copy: “${esc(item.emailCopy)}”</small>${item.read?'':'<button class="action-link" type="button" data-read-notification="'+esc(item.id)+'">Mark read</button>'}</article>`).join(''):'<p class="evidence-empty">No notifications for this role.</p>';
  }

  function renderActivity(){
    el('evidenceActivity').innerHTML=state.activity.map(item=>`<div class="activity-row"><span>${esc(item.createdAt)}</span><b>${esc(item.actor)}</b><div><strong>${esc(item.action)}</strong><small>${esc(item.detail)}</small></div></div>`).join('');
  }

  function populateClaims(){
    const options=caseClaims.map(item=>`<option value="${esc(item.id)}">${esc(item.id)} · ${item.year} · ${esc(item.cpt)}</option>`).join('');
    el('providerEvidenceClaim').innerHTML=options;
    el('attorneyEvidenceClaim').insertAdjacentHTML('beforeend',options);
  }

  function render(){ renderKpis(); renderRole(); renderActivity(); }

  function addActivity(actor,action,detail){ state.activity.unshift({id:uid('AC'),actor,action,detail,createdAt:now()}); }
  function fileName(formData){ const file=formData.get('file'); return file instanceof File && file.size>0?file.name:''; }

  function handleProviderSubmit(event){
    event.preventDefault(); const data=new FormData(event.currentTarget); const claimId=String(data.get('claimId')); let thread=state.threads.find(item=>item.claimId===claimId);
    if(!thread){ const row=claim(claimId); thread={id:uid('EV'),claimId,allegation:`Documentation or enrollment finding for ${claimId} requires source comparison.`,payerSource:'Redacted payer worksheet · exact allegation to be indexed',status:'unresolved',evidence:[],counselNote:'',reviewedBy:'Not reviewed'}; state.threads.unshift(thread); if(row?.rebuttal==='A') thread.allegation=`Supported claim ${claimId}: preserve source evidence and payer disposition.`; }
    const docId=uid('DOC'),name=fileName(data);
    thread.evidence.push({id:docId,type:String(data.get('documentType')),location:String(data.get('sourceLocation')),locator:String(data.get('locator')||'Not specified'),versionContext:versionLabel(String(data.get('versionContext'))),fileName:name,addedBy:'Provider',addedAt:now(),note:String(data.get('note')||'')});
    thread.status='unresolved'; thread.reviewedBy='New provider evidence awaiting attorney review';
    state.notifications.unshift({id:uid('NT'),audience:'attorney',title:'Provider added evidence for review',body:`Open ${thread.id} in the secure workspace.`,createdAt:now(),read:false,emailCopy:'New provider evidence is available in your AuditDefend workspace.'});
    addActivity('Provider','Added evidence reference',`${thread.id} · ${docId} · ${name?'local filename recorded':'location pointer recorded'}`);
    save(); event.currentTarget.reset(); el('providerEvidenceFileState').textContent='No file selected · local only'; render(); toast('Redacted evidence reference added. Counsel was notified in the workspace.');
  }

  function handleAttorneySubmit(event){
    event.preventDefault(); const data=new FormData(event.currentTarget),visibility=String(data.get('visibility')),type=String(data.get('itemType')),item={id:uid('AT'),claimId:String(data.get('claimId')),type,visibility,title:String(data.get('title')),body:String(data.get('body')),fileName:fileName(data),author:'Demo Counsel',addedAt:now()};
    state.attorneyItems.unshift(item);
    addActivity('Counsel',visibility==='shared'?'Shared attorney item with provider':'Added counsel-only item',`${item.id} · ${item.claimId} · ${item.title}`);
    if(visibility==='shared') state.notifications.unshift({id:uid('NT'),audience:'provider',title:type==='request'?'Counsel requested additional evidence':'Counsel shared a new workspace item',body:`Open ${item.claimId==='case-wide'?'the case workspace':item.claimId} to review the new item.`,createdAt:now(),read:false,emailCopy:'New counsel item in your AuditDefend workspace.'});
    save(); event.currentTarget.reset(); el('attorneyEvidenceFileState').textContent='No file selected · local only'; render(); toast(visibility==='shared'?'Attorney item shared; provider workspace notification created.':'Counsel-only item added.');
  }

  document.addEventListener('click',event=>{
    const role=event.target.closest('[data-evidence-role]'); if(role){ state.role=role.dataset.evidenceRole; save(); renderRole(); return; }
    const saveButton=event.target.closest('[data-save-thread]'); if(saveButton){ const thread=state.threads.find(item=>item.id===saveButton.dataset.saveThread),select=document.querySelector(`[data-thread-status="${CSS.escape(saveButton.dataset.saveThread)}"]`); if(thread&&select){ thread.status=select.value; thread.reviewedBy='Disposition set by Demo Counsel · '+now(); addActivity('Counsel','Updated factual comparison status',`${thread.id} · ${statusLabels[thread.status]}`); save(); render(); toast('Attorney disposition saved without making a legal conclusion.'); } return; }
    const read=event.target.closest('[data-read-notification]'); if(read){ const item=state.notifications.find(note=>note.id===read.dataset.readNotification); if(item){ item.read=true; save(); renderNotifications(); } }
  });

  el('evidenceStatusFilter')?.addEventListener('change',event=>{ filter=event.target.value; renderThreads(); });
  el('providerEvidenceForm')?.addEventListener('submit',handleProviderSubmit);
  el('attorneyEvidenceForm')?.addEventListener('submit',handleAttorneySubmit);
  el('providerEvidenceForm')?.elements.file.addEventListener('change',event=>{ const file=event.target.files[0]; el('providerEvidenceFileState').textContent=file?`${file.name} selected locally · contents not stored`:'No file selected · local only'; });
  el('attorneyEvidenceForm')?.elements.file.addEventListener('change',event=>{ const file=event.target.files[0]; el('attorneyEvidenceFileState').textContent=file?`${file.name} selected locally · contents not stored`:'No file selected · local only'; });
  el('attorneyItemType')?.addEventListener('change',event=>{ if(event.target.value==='message'||event.target.value==='request') el('attorneyVisibility').value='shared'; });
  el('resetEvidenceDemo')?.addEventListener('click',()=>{ state=clone(seed); filter='all'; el('evidenceStatusFilter').value='all'; save(); render(); toast('Redacted evidence demonstration reset.'); });

  populateClaims(); render();
})();
