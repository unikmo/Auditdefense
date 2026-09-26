import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const publicDir=path.join(root,'public');
const canonicalBase='https://auditdefense.vercel.app';
const indexable=[
  ['index.html','/'],['provider.html','/provider'],['attorney.html','/attorney'],['attorneys.html','/attorneys'],
  ['resources.html','/resources'],['healthcare-payer-audit-response.html','/healthcare-payer-audit-response'],
  ['healthcare-overpayment-demand.html','/healthcare-overpayment-demand'],['medicaid-provider-audit.html','/medicaid-provider-audit'],
  ['behavioral-health-audit-response.html','/behavioral-health-audit-response'],['aba-provider-audit.html','/aba-provider-audit'],
  ['npi-provider-enrollment-audit.html','/npi-provider-enrollment-audit']
];
const noindex=['app.html','attorney-workspace.html','provider-onboarding.html','auth.html'];
const titles=new Set(),descriptions=new Set();
const match=(html,re,label,file)=>{const value=html.match(re)?.[1]?.trim();if(!value)throw new Error(`${file}: missing ${label}`);return value};

for(const [file,route] of indexable){
  const html=fs.readFileSync(path.join(publicDir,file),'utf8');
  const title=match(html,/<title>([^<]+)<\/title>/i,'title',file);
  const description=match(html,/<meta\s+name="description"\s+content="([^"]+)"/i,'meta description',file);
  const canonical=match(html,/<link\s+rel="canonical"\s+href="([^"]+)"/i,'canonical',file);
  const h1=(html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length;
  if(h1!==1)throw new Error(`${file}: expected exactly one H1, found ${h1}`);
  if(canonical!==route)throw new Error(`${file}: canonical mismatch (${canonical})`);
  if(/noindex/i.test(html))throw new Error(`${file}: indexable page contains noindex`);
  if(!/property="og:title"/i.test(html)||!/property="og:description"/i.test(html)||!/property="og:url"/i.test(html))throw new Error(`${file}: incomplete Open Graph metadata`);
  if(!/name="twitter:card"/i.test(html))throw new Error(`${file}: missing Twitter card metadata`);
  if(titles.has(title))throw new Error(`${file}: duplicate title`);titles.add(title);
  if(descriptions.has(description))throw new Error(`${file}: duplicate description`);descriptions.add(description);
  for(const block of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi))JSON.parse(block[1]);
}

for(const file of noindex){
  const html=fs.readFileSync(path.join(publicDir,file),'utf8');
  if(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html))throw new Error(`${file}: missing noindex directive`);
}

const sitemap=fs.readFileSync(path.join(publicDir,'sitemap.xml'),'utf8');
for(const [,route] of indexable)if(!sitemap.includes(`<loc>${canonicalBase}${route}</loc>`))throw new Error(`sitemap missing ${route}`);
const robots=fs.readFileSync(path.join(publicDir,'robots.txt'),'utf8');
if(!robots.includes(`Sitemap: ${canonicalBase}/sitemap.xml`))throw new Error('robots.txt sitemap mismatch');
if(!fs.readFileSync(path.join(publicDir,'llms.txt'),'utf8').includes('## Important boundaries'))throw new Error('llms.txt missing product boundaries');

const files=fs.readdirSync(publicDir).filter(file=>file.endsWith('.html'));
const allowedRoutes=new Set(indexable.map(([,route])=>route).concat(['/app','/dashboard','/provider/onboarding','/provider-onboarding','/attorney/demo','/attorney/workspace','/attorney-directory','/law-firm']));
for(const file of files){
  const html=fs.readFileSync(path.join(publicDir,file),'utf8');
  for(const found of html.matchAll(/href="([^"]+)"/gi)){
    const href=found[1];
    if(!href.startsWith('/')||href.startsWith('//'))continue;
    const clean=href.split(/[?#]/)[0]||'/';
    if(allowedRoutes.has(clean))continue;
    if(fs.existsSync(path.join(publicDir,clean.slice(1))))continue;
    if(clean.endsWith('.html')&&fs.existsSync(path.join(publicDir,clean.slice(1))))continue;
    const candidate=clean==='/'?'index.html':clean.slice(1)+'.html';
    if(!fs.existsSync(path.join(publicDir,candidate)))throw new Error(`${file}: unresolved internal link ${href}`);
  }
}

console.log(`SEO checks passed for ${indexable.length} indexable pages and ${noindex.length} private/demo pages.`);
