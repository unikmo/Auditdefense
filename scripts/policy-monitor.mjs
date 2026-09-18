import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const registryPath = new URL('../data/policy-sources.json', import.meta.url);
const statusPath = new URL('../public/policy-status.json', import.meta.url);
const runPath = new URL('../policy-monitor-run.json', import.meta.url);

const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
let previous = {version:1, monitoringState:'SCHEDULED', schedule:'Every 6 hours via GitHub Actions', lastMonitorRun:null, sources:[]};
try { previous = JSON.parse(await fs.readFile(statusPath, 'utf8')); } catch {}

const previousById = new Map((previous.sources || []).map(x => [x.id, x]));
const observedAt = new Date().toISOString();

function normalizeHtml(input) {
  return input
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/\s(?:nonce|integrity|crossorigin|data-react[^=]*)=(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashBytes(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function titleFromHtml(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? normalizeHtml(m[1]).slice(0, 240) : null;
}

async function observe(source) {
  const old = previousById.get(source.id) || null;
  try {
    const response = await fetch(source.url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'AuditDefend-PolicyMonitor/0.1 (+https://auditdefense.netlify.app)',
        'accept': 'text/html,application/pdf,application/json,text/plain;q=0.8,*/*;q=0.5'
      },
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const contentType = response.headers.get('content-type') || '';
    const bytes = Buffer.from(await response.arrayBuffer());
    const isText = /html|json|text|xml/.test(contentType);
    const rawText = isText ? bytes.toString('utf8') : null;
    const normalized = isText ? normalizeHtml(rawText).slice(0, 5_000_000) : bytes;
    const hash = hashBytes(normalized);
    const changed = Boolean(old?.hash && old.hash !== hash);
    const firstFingerprint = !old?.hash;

    return {
      id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.url,
      state: changed ? 'CHANGED_REVIEW_REQUIRED' : 'OBSERVED',
      httpStatus: response.status,
      contentType,
      etag: response.headers.get('etag'),
      lastModified: response.headers.get('last-modified'),
      contentLength: bytes.length,
      pageTitle: isText ? titleFromHtml(rawText) : null,
      hash,
      previousHash: changed ? old.hash : (old?.previousHash || null),
      changed,
      reviewRequired: changed,
      firstFingerprint,
      lastChangedAt: changed ? observedAt : (old?.lastChangedAt || null),
      lastObservedAt: observedAt,
      error: null
    };
  } catch (error) {
    return {
      id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.url,
      state: 'FETCH_ERROR',
      httpStatus: null,
      contentType: null,
      etag: null,
      lastModified: null,
      contentLength: null,
      pageTitle: null,
      hash: old?.hash || null,
      previousHash: old?.previousHash || null,
      changed: false,
      reviewRequired: true,
      firstFingerprint: false,
      lastChangedAt: old?.lastChangedAt || null,
      lastObservedAt: observedAt,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

const observed = [];
for (const source of registry.sources.sort((a,b) => a.priority - b.priority)) {
  observed.push(await observe(source));
}

const materialChange = observed.some(now => {
  const old = previousById.get(now.id);
  if (!old?.hash && now.hash) return true;
  if (now.changed) return true;
  if (old?.state !== now.state && (now.state === 'FETCH_ERROR' || old?.state === 'FETCH_ERROR')) return true;
  return false;
});

const status = {
  version: 1,
  monitoringState: observed.some(x => x.state === 'FETCH_ERROR') ? 'ACTIVE_WITH_SOURCE_ERRORS' : 'ACTIVE',
  schedule: 'Every 6 hours via GitHub Actions',
  lastMonitorRun: observedAt,
  sourceCount: observed.length,
  reviewRequiredCount: observed.filter(x => x.reviewRequired).length,
  sources: observed
};

const run = {
  observedAt,
  materialChange,
  changedSourceIds: observed.filter(x => x.changed).map(x => x.id),
  errorSourceIds: observed.filter(x => x.state === 'FETCH_ERROR').map(x => x.id),
  sourceCount: observed.length
};

await fs.writeFile(runPath, JSON.stringify(run, null, 2) + '\n');

if (materialChange) {
  await fs.writeFile(statusPath, JSON.stringify(status, null, 2) + '\n');
  console.log(JSON.stringify({updatedStatus:true, ...run}));
} else {
  console.log(JSON.stringify({updatedStatus:false, ...run}));
}
