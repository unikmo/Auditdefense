// Checks the state overpayment-recovery rules that are still SECONDARY_SOURCE_ONLY against the official statute text.
//
//   node scripts/verify-state-statutes.mjs
//
// For each such rule it fetches the state's statute page and looks for the rule's excerpt word for word.
// It prints MATCH / NO-MATCH / ERROR and changes nothing. A MATCH means the statute can be cited directly:
// replace the rule's citation with the statute URL and set sourceSupportStatus to CURRENT_SOURCE_VERIFIED.
// Run it from a normal network. The environment that built these rules could not reach several state sites
// (Ohio, New Jersey, Montana, Vermont, Illinois, Rhode Island and others refused connections).
import fs from 'node:fs';

const URLS = {
  AL: 'https://alison.legislature.state.al.us/code-of-alabama?section=27-1-17',
  AK: 'https://www.akleg.gov/basis/aac.asp#3.26.110',
  AR: 'https://law.justia.com/codes/arkansas/title-23/subtitle-3/chapter-63/subchapter-18/section-23-63-1803/',
  CO: 'https://leg.colorado.gov/sites/default/files/images/olls/crs2023-title-10.pdf',
  DC: 'https://code.dccouncil.gov/us/dc/council/code/sections/31-3133',
  GA: 'https://law.justia.com/codes/georgia/title-33/chapter-20a/section-33-20a-62/',
  HI: 'https://www.capitol.hawaii.gov/hrscurrent/Vol09_Ch0431-0435H/HRS0431/HRS_0431-0013-0108.htm',
  IA: 'https://www.legis.iowa.gov/docs/iac/rule/191.15.33.pdf',
  IL: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=021500050K368d',
  IN: 'https://iga.in.gov/laws/2024/ic/titles/27#27-8-5.7-10',
  KY: 'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=51919',
  LA: 'https://legis.la.gov/Legis/Law.aspx?d=1330696',
  MT: 'https://leg.mt.gov/bills/mca/title_0330/chapter_0220/part_0010/section_0150/0330-0220-0010-0150.html',
  NE: 'https://nebraskalegislature.gov/FloorDocs/Current/PDF/Rules/Title210.pdf',
  NH: 'https://www.gencourt.state.nh.us/rsa/html/XXXVII/420-J/420-J-8-b.htm',
  NJ: 'https://pub.njleg.state.nj.us/statutes/17B/27-44.2',
  NC: 'https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_58/GS_58-3-225.html',
  OH: 'https://codes.ohio.gov/ohio-revised-code/section-3901.388',
  OK: 'https://www.oscn.net/applications/oscn/DeliverDocument.asp?CiteID=455580',
  TN: 'https://law.justia.com/codes/tennessee/title-56/chapter-7/part-1/section-56-7-110/',
  UT: 'https://le.utah.gov/xcode/Title31A/Chapter26/31A-26-S301.6.html',
  VT: 'https://legislature.vermont.gov/statutes/section/18/221/09418',
  WY: 'https://wyoleg.gov/StateStatutes/StatutesConsolidated.pdf'
};

const norm = s => s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ')
  .replace(/&#x2003;|&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&ndash;|&#8211;|–/g, '-')
  .replace(/&#8217;|&rsquo;|[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

const rules = JSON.parse(fs.readFileSync(new URL('../data/recovery-rules.json', import.meta.url), 'utf8')).rules
  .filter(r => r.sourceSupportStatus === 'SECONDARY_SOURCE_ONLY');

let matched = 0;
for (const r of rules) {
  const url = URLS[r.jurisdiction];
  if (!url) { console.log(`${r.jurisdiction}  NO-URL   ${r.citation.locator}`); continue; }
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(45000), headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = norm(await res.text());
    const ok = res.ok && text.includes(norm(r.citation.excerpt));
    if (ok) matched += 1;
    console.log(`${r.jurisdiction}  ${ok ? 'MATCH   ' : 'NO-MATCH'}  HTTP ${res.status}  ${url}`);
  } catch (e) {
    console.log(`${r.jurisdiction}  ERROR     ${String(e.cause?.code || e.message).slice(0, 40)}  ${url}`);
  }
}
console.log(`\n${matched} of ${rules.length} secondary-source rules matched an official page word for word.`);
console.log('NO-MATCH can mean a script-rendered page or a different URL, not a wrong rule. Open the page and check.');
