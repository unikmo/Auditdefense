(() => {
const profiles=[
{id:'patrick-m-callahan',name:'Patrick M. Callahan',firm:'The Callahan Law Firm',location:'Illinois',focus:'Firm practice includes Medicare/Medicaid audit response for healthcare professionals.',source:'https://www.lawcallahan.com/practice-areas/medicare-medicaid-audit-response/',participation:'public-source'},
{id:'amanda-r-gray',name:'Amanda R. Gray',firm:'The Callahan Law Firm',location:'Illinois',focus:'Public firm profile; the firm publishes a Medicare/Medicaid audit-response practice.',source:'https://www.lawcallahan.com/practice-areas/medicare-medicaid-audit-response/'},
{id:'brandon-r-thom',name:'Brandon R. Thom',firm:'The Callahan Law Firm',location:'Illinois',focus:'Public firm profile; the firm publishes a Medicare/Medicaid audit-response practice.',source:'https://www.lawcallahan.com/practice-areas/medicare-medicaid-audit-response/'},
{id:'trey-hendershot',name:'Trey Hendershot',firm:'Hendershot Cowart P.C.',location:'Texas',focus:'Firm practice includes Texas Medicaid investigations, audits and civil/administrative healthcare matters.',source:'https://www.hchlawyers.com/health-care-investigations/texas-medicaid-fraud-defense/'},
{id:'katie-cowart',name:'Katie Cowart',firm:'Hendershot Cowart P.C.',location:'Texas',focus:'Public firm profile; the firm publishes Texas Medicaid investigation and audit-defense services.',source:'https://www.hchlawyers.com/health-care-investigations/texas-medicaid-fraud-defense/'},
{id:'philip-d-racusin',name:'Philip D. Racusin',firm:'Hendershot Cowart P.C.',location:'Texas',focus:'Public firm profile; the firm publishes Texas Medicaid investigation and audit-defense services.',source:'https://www.hchlawyers.com/health-care-investigations/texas-medicaid-fraud-defense/'},
{id:'michael-rosenblat',name:'Michael C. Rosenblat',firm:'Rosenblat Law',location:'Illinois',focus:'Medicare, Medicaid and non-governmental insurance audit defense and healthcare-fraud matters.',source:'https://www.rosenblatlaw.com/'},
{id:'philip-h-hilder',name:'Philip H. Hilder',firm:'Hilder & Associates, P.C.',location:'Texas',focus:'Healthcare audit defense involving government programs and Texas-state matters.',source:'https://www.hilderlaw.com/healthcare-fraud-attorney/healthcare-audit-defense-attorney/'},
{id:'john-hutto',name:'John Hutto',firm:'Law Office of John Hutto',location:'AL / TN / GA',focus:'Health care law and Medicare/Medicaid audit defense and appeals.',source:'https://www.johnhuttoattorney.com/'},
{id:'nick-oberheiden',name:'Dr. Nick Oberheiden',firm:'The Healthcare Fraud Defense Attorneys',location:'Multiple U.S. locations',focus:'Listed by the firm as founder and attorney on its healthcare audit-defense team.',source:'https://www.healthcare-lawyers.com/healthcare-defense/audits/'},
{id:'lynette-s-byrd',name:'Lynette S. Byrd',firm:'The Healthcare Fraud Defense Attorneys',location:'Multiple U.S. locations',focus:'Listed by the firm as partner and former Assistant U.S. Attorney on its healthcare audit-defense team.',source:'https://www.healthcare-lawyers.com/healthcare-defense/audits/'},
{id:'ellen-comley',name:'Ellen Comley',firm:'The Healthcare Fraud Defense Attorneys',location:'Multiple U.S. locations',focus:'Listed by the firm as senior counsel and attorney on its healthcare audit-defense team.',source:'https://www.healthcare-lawyers.com/healthcare-defense/audits/'}
];
const $=id=>document.getElementById(id);
let currentUser=null;
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function render(){
 const q=$('directorySearch').value.trim().toLowerCase(),loc=$('directoryState').value,participation=$('directoryParticipation').value;
 const rows=profiles.filter(p=>(!loc||p.location===loc)&&(!participation||(p.participation||'public-source')===participation)&&(!q||[p.name,p.firm,p.location,p.focus].some(v=>v.toLowerCase().includes(q))));
 $('directoryGrid').innerHTML=rows.length?rows.map(p=>`<article class="directory-card" data-profile="${p.id}">
   <span class="m-kicker">${esc(p.location)}</span><h3>${esc(p.name)}</h3><strong style="font-size:10px">${esc(p.firm)}</strong>
   <p>${esc(p.focus)}</p><div class="meta"><span>Healthcare</span><span>Audit / reimbursement</span></div>
   <span class="unclaimed">Unclaimed public-source profile · no AuditDefend affiliation implied</span>
   <footer><a href="${p.source}" target="_blank" rel="noopener noreferrer">Public source ↗</a><button class="m-btn ghost claim-btn" data-claim="${p.id}">Claim profile</button></footer>
 </article>`).join(''):'<div class="directory-empty">No matching profiles. No attorney is labeled “participating” until participation and profile control are verified.</div>';
 $('directoryCount').textContent=`${rows.length} of ${profiles.length} verified profiles shown. All current seed profiles are public-source and unclaimed; none are represented as participating.`;
}
function populateLocations(){[...new Set(profiles.map(p=>p.location))].sort().forEach(loc=>{const o=document.createElement('option');o.value=loc;o.textContent=loc;$('directoryState').appendChild(o)})}
function openClaim(id){const p=profiles.find(x=>x.id===id);if(!p)return;$('claimProfileId').value=p.id;$('claimProfileName').value=p.name+' — '+p.firm;$('claimTitle').textContent='Claim '+p.name;$('claimWorkEmail').value=currentUser?.email||'';$('claimModal').classList.add('open');$('claimModal').setAttribute('aria-hidden','false');$('claimStatus').className='claim-status';$('claimStatus').textContent=currentUser?'Signed in. Claim requests are reviewed before profile control is granted.':'Sign-in is required to submit a claim request.'}
function closeClaim(){$('claimModal').classList.remove('open');$('claimModal').setAttribute('aria-hidden','true')}
function draftData(){const f=$('claimForm'),d=new FormData(f);return{profileId:d.get('profileId'),workEmail:d.get('workEmail'),firmWebsite:d.get('firmWebsite'),jurisdiction:d.get('jurisdiction'),confirm:d.get('confirm')==='on'}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-claim]');if(b)openClaim(b.dataset.claim)});
$('claimClose').addEventListener('click',closeClaim);
$('claimModal').addEventListener('click',e=>{if(e.target===$('claimModal'))closeClaim()});
$('directorySearch').addEventListener('input',render);$('directoryState').addEventListener('change',render);$('directoryParticipation').addEventListener('change',render);
document.addEventListener('auditdefend:firebase-status',e=>{currentUser=e.detail?.user||null;if($('claimModal').classList.contains('open'))$('claimStatus').textContent=currentUser?'Signed in. Claim requests are reviewed before profile control is granted.':'Sign-in is required to submit a claim request.'});
$('claimForm').addEventListener('submit',async e=>{
 e.preventDefault();const data=draftData();if(!data.confirm)return;
 if(!currentUser||!window.AuditDefendFirebaseAPI){localStorage.setItem('auditdefend-directory-claim-draft',JSON.stringify(data));location.href='/auth.html?next='+encodeURIComponent('/attorneys?claim='+data.profileId);return}
 const btn=$('claimSubmit');btn.disabled=true;
 try{
   await window.AuditDefendFirebaseAPI.submitAttorneyDirectoryClaim(data.profileId,{workEmail:data.workEmail,firmWebsite:data.firmWebsite,jurisdiction:data.jurisdiction,sourceProfile:profiles.find(p=>p.id===data.profileId)?.source||null,redacted:true,containsPhi:false});
   $('claimStatus').className='claim-status ok';$('claimStatus').textContent='Claim request submitted. Profile control is not granted until verification is completed.';localStorage.removeItem('auditdefend-directory-claim-draft');
 }catch(err){console.warn(err);$('claimStatus').className='claim-status error';$('claimStatus').textContent='The claim request could not be synced. Firestore rules may not be deployed yet; no approval is being claimed.'}
 finally{btn.disabled=false}
});
populateLocations();render();
const wanted=new URLSearchParams(location.search).get('claim');if(wanted)openClaim(wanted);
})();
