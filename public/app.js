const findings = [
  {patient:'J.D.',dos:'02/14/2024',claim:'AET123456',cpt:'97153',issue:'Unsigned note',amount:'$580',status:'Needs Review',kind:'attention',detail:'Signature evidence exists in source metadata but is not visible in the exported note.'},
  {patient:'M.K.',dos:'03/02/2024',claim:'AET123457',cpt:'97155',issue:'Missing treatment plan',amount:'$720',status:'In Progress',kind:'missing',detail:'No active treatment plan has been linked from the currently imported evidence.'},
  {patient:'T.R.',dos:'03/05/2024',claim:'AET123458',cpt:'97153',issue:'Supervisor not eligible',amount:'$1,160',status:'Needs Review',kind:'network',detail:'Supervisor eligibility requires credential and payer-rule review.'},
  {patient:'S.L.',dos:'03/08/2024',claim:'AET123459',cpt:'97153',issue:'Provider out of network',amount:'$2,340',status:'Needs Review',kind:'network',detail:'Network participation is disputed. Portal and payment history are evidence only, not a legal conclusion.'},
  {patient:'A.P.',dos:'03/12/2024',claim:'AET123460',cpt:'97155',issue:'Session duration mismatch',amount:'$720',status:'In Progress',kind:'quality',detail:'Documented time and billed units require payer-specific human review.'}
];

const claims = [
  {claim:'AET123456',patient:'J.D.',dos:'02/14/2024',note:'Review',plan:'✓',auth:'✓',provider:'✓',amount:'$580'},
  {claim:'AET123457',patient:'M.K.',dos:'03/02/2024',note:'✓',plan:'Missing',auth:'✓',provider:'✓',amount:'$720'},
  {claim:'AET123458',patient:'T.R.',dos:'03/05/2024',note:'✓',plan:'✓',auth:'✓',provider:'Review',amount:'$1,160'},
  {claim:'AET123459',patient:'S.L.',dos:'03/08/2024',note:'✓',plan:'✓',auth:'✓',provider:'Review',amount:'$2,340'},
  {claim:'AET123460',patient:'A.P.',dos:'03/12/2024',note:'Review',plan:'✓',auth:'✓',provider:'✓',amount:'$720'},
  {claim:'AET123461',patient:'R.B.',dos:'03/14/2024',note:'✓',plan:'✓',auth:'✓',provider:'✓',amount:'$940'},
  {claim:'AET123462',patient:'N.C.',dos:'03/16/2024',note:'✓',plan:'✓',auth:'Review',provider:'✓',amount:'$1,025'}
];

function renderFindings(filter='all'){
  const body=document.getElementById('findingsBody');
  const rows=findings.filter(x=>filter==='all'||x.kind===filter||filter==='attention');
  body.innerHTML=rows.map((f,i)=>`<tr><td>${f.patient}</td><td>${f.dos}</td><td>${f.claim}</td><td>${f.cpt}</td><td class="issue-cell">${f.issue}</td><td>${f.amount}</td><td><span class="status-pill ${f.status==='Needs Review'?'status-review':'status-progress'}">${f.status}</span></td><td><button class="action-link" data-claim-index="${i}">View</button></td></tr>`).join('');
}
function renderClaims(){
  document.getElementById('claimsBody').innerHTML=claims.map((c,i)=>`<tr><td><strong>${c.claim}</strong></td><td>${c.patient}</td><td>${c.dos}</td>${['note','plan','auth','provider'].map(k=>`<td class="${c[k]==='✓'?'evidence-ok':'evidence-review'}">${c[k]}</td>`).join('')}<td>${c.amount}</td><td><button class="action-link" data-claim-row="${i}">Open</button></td></tr>`).join('');
}
function renderGaps(){
  const q=document.getElementById('gapQueue');
  q.innerHTML=findings.map((f,i)=>`<div class="gap-item"><span class="gap-severity ${i<3?'high':'medium'}">${i<3?'!':'•'}</span><div><strong>${f.issue}</strong><small>${f.patient} · ${f.dos} · ${f.claim}</small></div><div class="gap-source"><small>Current finding</small><strong>${f.detail}</strong></div><div class="gap-amount">${f.amount}</div><button class="secondary-btn gap-action" data-claim-index="${i}">Review</button></div>`).join('');
}
function showView(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  const target=document.getElementById(`view-${view}`)||document.getElementById('view-dashboard');
  target.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  history.replaceState(null,'',`#${view}`);
  window.scrollTo({top:0,behavior:'smooth'});
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),3200)}
function openClaim(data){
  document.getElementById('drawerTitle').textContent=`${data.claim} · ${data.patient}`;
  const issue=findings.find(f=>f.claim===data.claim);
  document.getElementById('drawerContent').innerHTML=`
    <div class="drawer-section"><h3>Claim context</h3><div class="evidence-line"><span>Date of service</span><span>${data.dos}</span></div><div class="evidence-line"><span>Potential amount</span><span>${data.amount}</span></div><div class="evidence-line"><span>Current issue</span><span class="review">${issue?.issue||'No flagged issue'}</span></div></div>
    <div class="drawer-section"><h3>Evidence chain</h3><div class="evidence-line"><span>Session note</span><span class="${data.note==='✓'?'ok':'review'}">${data.note==='✓'?'Linked':'Needs review'}</span></div><div class="evidence-line"><span>Treatment plan</span><span class="${data.plan==='✓'?'ok':'review'}">${data.plan==='✓'?'Linked':data.plan}</span></div><div class="evidence-line"><span>Authorization</span><span class="${data.auth==='✓'?'ok':'review'}">${data.auth==='✓'?'Linked':data.auth}</span></div><div class="evidence-line"><span>Provider / network</span><span class="${data.provider==='✓'?'ok':'review'}">${data.provider==='✓'?'Linked':data.provider}</span></div><div class="source-box">Demo source provenance: PowerGM session-note export + uploaded treatment-plan file + synthetic billing line. Production evidence links will require verified source metadata.</div></div>
    <div class="drawer-section"><h3>Human review</h3><p style="font-size:11px;color:#64758c;line-height:1.5">${issue?.detail||'No current issue in the synthetic demo.'}</p><button class="primary-btn" data-toast="Review-state changes are disabled until Firebase is connected and access controls are verified.">Mark Reviewed</button></div>`;
  const drawer=document.getElementById('claimDrawer');drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');
}

document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-view]');if(nav){showView(nav.dataset.view);return}
  const target=e.target.closest('[data-view-target]');if(target){showView(target.dataset.viewTarget);return}
  const toastBtn=e.target.closest('[data-toast]');if(toastBtn){toast(toastBtn.dataset.toast);return}
  const close=e.target.closest('[data-close-drawer]');if(close){const d=document.getElementById('claimDrawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');return}
  const idx=e.target.closest('[data-claim-index]');if(idx){const f=findings[Number(idx.dataset.claimIndex)];const c=claims.find(x=>x.claim===f.claim)||{...f,note:'Review',plan:'Review',auth:'Review',provider:'Review'};openClaim(c);return}
  const row=e.target.closest('[data-claim-row]');if(row){openClaim(claims[Number(row.dataset.claimRow)]);return}
  const tab=e.target.closest('.tab');if(tab){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');renderFindings(tab.dataset.filter);return}
});

document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();toast(q?`Demo search: “${q}” — no live PHI index is connected.`:'Enter a search term.')}});
document.getElementById('auditFile').addEventListener('change',e=>{const f=e.target.files[0];document.getElementById('fileStatus').textContent=f?`${f.name} selected locally — not uploaded in demo.`:'No file selected'});

renderFindings();renderClaims();renderGaps();
const initial=location.hash.replace('#','');showView(initial||'dashboard');
