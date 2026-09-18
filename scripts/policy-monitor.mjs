import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const FINGERPRINT_VERSION = 2;
const registryPath = new URL('../data/policy-sources.json', import.meta.url);
const statusPath = new URL('../public/policy-status.json', import.meta.url);
const runPath = new URL('../policy-monitor-run.json', import.meta.url);

const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
let previous = {version:1, monitoringState:'SCHEDULED', schedule:'Every 6 hours via GitHub Actions', lastMonitorRun:null, sources:[]};
try { previous = JSON.parse(await fs.readFile(statusPath, 'utf8')); } catch {}

const previousById = new Map((previous.sources || []).map(x => [x.id, x]));
const observedAt = new Date().toISOString();

function cleanText(input) {
  return String(input || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function semanticHtml(input) {
  const html = String(input || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');

  const parts = [];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) parts.push('TITLE|' + cleanText(title[1]));

  for (const match of html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const text = cleanText(match[2]);
    if (text) parts.push(match[1].toUpperCase() + '|' + text);
  }

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1] || '';
    const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefMatch && (hrefMatch[1] || hrefMatch[2] || hrefMatch[3])) || '';
    const label = cleanText(match[2]);
    if (href || label) parts.push('A|' + href.replace(/#.*$/, '') + '|' + label);
  }

  return parts.join('\n').slice(0, 5_000_000);
}

function hashBytes(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function titleFromHtml(html) {
  const m = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? cleanText(m[1]).slice(0, 240) : null;
}

async function fetchCandidate(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'AuditDefend-PolicyMonitor/0.2 (+https://auditdefense.netlify.app)',
      'accept': 'text/html,application/pdf,application/json,text/plain;q=0.8,*/*;q=0.5'
    },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response;
}

async function observe(source) {
  const old = previousById.get(source.id) || null;
  const candidates = [source.url, ...(source.fallbackUrls || [])];
  let response = null;
  let observedUrl = null;
  let lastError = null;

  for (const candidate of candidates) {
    try {
      response = await fetchCandidate(candidate);
      observedUrl = candidate;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  try {
    if (!response) throw lastError || new Error('No source URL could be retrieved');

    const contentType = response.headers.get('content-type') || '';
    const bytes = Buffer.from(await response.arrayBuffer());
    const isHtml = /html/.test(contentType);
    const isText = /html|json|text|xml/.test(contentType);
    const rawText = isText ? bytes.toString('utf8') : null;
    const fingerprintPayload = isHtml ? semanticHtml(rawText) : (isText ? cleanText(rawText).slice(0, 5_000_000) : bytes);
    const hash = hashBytes(fingerprintPayload);

    const comparable = old?.fingerprintVersion === FINGERPRINT_VERSION && Boolean(old?.hash);
    const changedNow = comparable && old.hash !== hash;
    const carryReview = comparable && old.reviewRequired === true && old.hash === hash;
    const firstFingerprint = !comparable;

    return {
      id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.url,
      observedUrl,
      usedFallback: observedUrl !== source.url,
      fingerprintVersion: FINGERPRINT_VERSION,
      fingerprintMode: isHtml ? 'semantic-html-title-headings-links' : (isText ? 'normalized-text' : 'binary-bytes'),
      state: changedNow ? 'CHANGED_REVIEW_REQUIRED' : (carryReview ? 'CHANGED_REVIEW_REQUIRED' : 'OBSERVED'),
      httpStatus: response.status,
      contentType,
      etag: response.headers.get('etag'),
      lastModified: response.headers.get('last-modified'),
      contentLength: bytes.length,
      pageTitle: isHtml ? titleFromHtml(rawText) : null,
      hash,
      previousHash: changedNow ? old.hash : (old?.previousHash || null),
      changed: changedNow,
      reviewRequired: changedNow || carryReview,
      firstFingerprint,
      lastChangedAt: changedNow ? observedAt : (old?.lastChangedAt || null),
      lastObservedAt: observedAt,
      error: null
    };
  } catch (error) {
    return {
      id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.url,
      observedUrl: null,
      usedFallback: false,
      fingerprintVersion: FINGERPRINT_VERSION,
      fingerprintMode: null,
      state: 'FETCH_ERROR',
      httpStatus: null,
      contentType: null,
      etag: null,
      lastModified: null,
      contentLength: null,
      pageTitle: null,
      hash: old?.fingerprintVersion === FINGERPRINT_VERSION ? (old?.hash || null) : null,
      previousHash: old?.fingerprintVersion === FINGERPRINT_VERSION ? (old?.previousHash || null) : null,
      changed: false,
      reviewRequired: true,
      firstFingerprint: false,
      lastChangedAt: old?.lastChangedAt || null,
      lastObservedAt: observedAt,
      error: error instanceof Error ? error.message : String(error),
      attemptedUrls: candidates
    };
  }
}

const observed = [];
for (const source of registry.sources.sort((a,b) => a.priority - b.priority)) {
  observed.push(await observe(source));
}

const fingerprintUpgrade = observed.some(now => now.firstFingerprint && previousById.get(now.id)?.fingerprintVersion !== FINGERPRINT_VERSION);
const materialChange = fingerprintUpgrade || observed.some(now => {
  const old = previousById.get(now.id);
  if (!old && now.hash) return true;
  if (now.changed) return true;
  if (old?.state !== now.state && (now.state === 'FETCH_ERROR' || old?.state === 'FETCH_ERROR')) return true;
  if (old?.usedFallback !== now.usedFallback) return true;
  return false;
});

const status = {
  version: 1,
  fingerprintVersion: FINGERPRINT_VERSION,
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
  fingerprintUpgrade,
  changedSourceIds: observed.filter(x => x.changed).map(x => x.id),
  reviewRequiredSourceIds: observed.filter(x => x.reviewRequired).map(x => x.id),
  errorSourceIds: observed.filter(x => x.state === 'FETCH_ERROR').map(x => x.id),
  fallbackSourceIds: observed.filter(x => x.usedFallback).map(x => x.id),
  sourceCount: observed.length
};

await fs.writeFile(runPath, JSON.stringify(run, null, 2) + '\n');

if (materialChange) {
  await fs.writeFile(statusPath, JSON.stringify(status, null, 2) + '\n');
  console.log(JSON.stringify({updatedStatus:true, ...run}));
} else {
  console.log(JSON.stringify({updatedStatus:false, ...run}));
}
