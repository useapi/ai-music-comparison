#!/usr/bin/env node
// Same brief, four AI music flagships — TemPolor v4.8 / i4, MiniMax Music-3.0
// (native), Google Lyria 3.5, and Mureka V9.5 — through one useapi.net API token.
//
//   node compare.mjs <API_TOKEN> [round]
//
// `round` is a key from prompts.json (default: the first one). Results land in
// ./output/<round>/. Optional env when you have more than one account configured:
//   MUREKA_ACCOUNT=12345678901234  MINIMAX_ACCOUNT=123456789012345678
//   FLOWMUSIC_EMAIL=me@example.com  TEMPOLOR_ACCOUNT=100000000
//
// 📖 Full walkthrough with all 24 generated tracks, prices and timings:
//    https://useapi.net/docs/articles/ai-music-flagships-compared

import { readFileSync, writeFileSync, mkdirSync, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';

const TOKEN = process.argv[2];
if (!TOKEN) { console.error('Usage: node compare.mjs <API_TOKEN> [round]'); process.exit(1); }
const prompts = JSON.parse(readFileSync(new URL('./prompts.json', import.meta.url), 'utf8'));
const round = process.argv[3] || Object.keys(prompts)[0];
const brief = prompts[round];
if (!brief) { console.error(`Unknown round "${round}". Available: ${Object.keys(prompts).join(', ')}`); process.exit(1); }

const outDir = path.resolve('output', round);
mkdirSync(outDir, { recursive: true });
console.log(`Round: ${brief.label}\nOutput: ${outDir}\n`);

const H = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(method, url, body) {
  const res = await fetch(url, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
}

// ---- per-service request bodies for the three brief types ------------------
function murekaRequest() {
  if (brief.type === 'instrumental') return ['music/create-instrumental', { model: 'V9.5', prompt: brief.prompt }];
  if (brief.type === 'lyrics') {
    const body = { model: 'V9.5', lyrics: brief.lyrics, desc: brief.murekaDesc };
    if (brief.vocalGender) body.vocal_gender = brief.vocalGender;
    return ['music/create-advanced', body];
  }
  return ['music/create', { model: 'V9.5', prompt: brief.prompt }];
}
function minimaxBody() {
  // One prompt field carries both style and subject. `instrumental: true` is
  // REQUIRED for a wordless track — leaving `lyrics` empty is not enough, the
  // model will write its own words and sing them.
  const body = { model: 'music-3.0', prompt: brief.type === 'lyrics' ? brief.style : brief.prompt };
  if (brief.type === 'instrumental') body.instrumental = true;
  if (brief.type === 'lyrics') body.lyrics = brief.lyrics;
  if (process.env.MINIMAX_ACCOUNT) body.account = process.env.MINIMAX_ACCOUNT;
  return body;
}
function tempolorRequest() {
  // Vocals and instrumentals are different MODELS on different ENDPOINTS here,
  // so you choose by endpoint rather than by an `instrumental` flag. Both model
  // names are already the defaults; passing them keeps the script explicit about
  // what produced a track, since older names are silently routed to these.
  if (brief.type === 'instrumental')
    return ['music/instrumental', { model_instrumental: 'i4', prompt: brief.prompt }];
  const body = { model_song: 'v4.8', prompt: brief.type === 'lyrics' ? brief.style : brief.prompt };
  if (brief.type === 'lyrics') body.lyrics = brief.lyrics;
  return ['music/song', body];
}
function flowmusicBody() {
  // `lyria-3-pro` is still the API default — omit `model` and you silently get
  // the previous generation. Always pass it explicitly.
  const body = { mode: 'async', model: 'lyria-3.5', prompt: brief.type === 'lyrics' ? brief.style : brief.prompt };
  if (brief.type === 'instrumental') body.instrumental = true;
  if (brief.type === 'lyrics') body.lyrics = brief.lyrics;
  if (process.env.FLOWMUSIC_EMAIL) body.email = process.env.FLOWMUSIC_EMAIL;
  return body;
}

const POLL_MS = 15_000, TIMEOUT_MS = 20 * 60 * 1000;

const TEMPOLOR_MODEL = brief.type === 'instrumental' ? 'i4' : 'v4.8';

const models = [
  { name: `tempolor-${TEMPOLOR_MODEL}`, submit: async () => {
      const [endpoint, body] = tempolorRequest();
      if (process.env.TEMPOLOR_ACCOUNT) body.user_id = process.env.TEMPOLOR_ACCOUNT;
      const r = await api('POST', `https://api.useapi.net/v1/tempolor/${endpoint}`, body);
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      if (!r.json.jobs?.length) throw new Error('no jobs in response');
      // Submit is the only place the plan is reported — worth seeing once.
      if (r.json.unlimited) console.log('[tempolor] account is on an unlimited plan');
      return r.json.jobs;
    }, poll: pollTempolor },
  { name: 'mureka-v9.5', submit: async () => {
      const [endpoint, body] = murekaRequest();
      if (process.env.MUREKA_ACCOUNT) body.account = process.env.MUREKA_ACCOUNT;
      const r = await api('POST', `https://api.useapi.net/v1/mureka/${endpoint}`, { ...body, async: true });
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.jobid;
    }, poll: pollMureka },
  { name: 'minimax-music-3.0', submit: async () => {
      // MiniMax allows ONE music generation per account at a time and 429s
      // otherwise — and it counts songs started on minimax.io too, so wait it out.
      for (let waited = 0; ; waited += 30_000) {
        const r = await api('POST', 'https://api.useapi.net/v1/minimax/music/create', minimaxBody());
        if (r.status === 429) {
          if (waited > 30 * 60 * 1000) throw new Error('still 429 after 30 min — account busy');
          console.log('[minimax-music-3.0] 429 account busy, retrying in 30s');
          await sleep(30_000); continue;
        }
        if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
        const first = Array.isArray(r.json) ? r.json[0] : r.json;
        if (!first?.musicId) throw new Error('no musicId in response');
        return first.musicId;
      }
    }, poll: pollMinimax },
  { name: 'lyria-3.5', submit: async () => {
      const r = await api('POST', 'https://api.useapi.net/v1/flowmusic/music', flowmusicBody());
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.jobid;
    }, poll: pollFlowmusic },
];

// NOTE: keep job ids RAW in the path — do not URL-encode ':' or '@'
async function pollTempolor(jobs) {
  const finished = [];
  for (const job of jobs) {
    const r = await api('GET', `https://api.useapi.net/v1/tempolor/music/${job}`);
    if (r.status >= 400) throw new Error(`poll HTTP ${r.status}`);
    if (r.json.status_final && r.json.status_name !== 'COMPLETED') throw new Error(`status ${r.json.status_name}`);
    if (!r.json.status_final) return null;
    finished.push([job, r.json]);
  }
  const tracks = [];
  for (const [job, j] of finished) {
    const d = await api('GET', `https://api.useapi.net/v1/tempolor/music/download/${job}?file_format=mp3`);
    // A song job reports COMPLETED a few seconds BEFORE its file can be served,
    // so a 404 here means "not yet", not "failed". Go round the loop again.
    if (d.status === 404) return null;
    if (d.status >= 400 || !d.json.url) throw new Error(`download HTTP ${d.status}`);
    tracks.push({ url: d.json.url, ext: 'mp3', suffix: finished.length > 1 ? `-${tracks.length + 1}` : '', title: j.titleEn });
  }
  return tracks;
}
async function pollMureka(jobid) {
  const r = await api('GET', `https://api.useapi.net/v1/mureka/jobs/${jobid}`);
  if (r.status >= 400) throw new Error(`poll HTTP ${r.status}`);
  if (r.json.status === 'failed' || r.json.error) throw new Error(JSON.stringify(r.json).slice(0, 200));
  const songs = r.json.songs || r.json.response?.songs;
  if (!songs?.length || !songs.every(s => s.mp3_url)) return null;
  return songs.map((s, i) => ({ url: s.mp3_url, ext: 'mp3', suffix: `-${i + 1}`, title: s.title }));
}
async function pollMinimax(musicId) {
  const r = await api('GET', `https://api.useapi.net/v1/minimax/music/${musicId}`);
  if (r.status >= 400) throw new Error(`poll HTTP ${r.status}`);
  if (!r.json.statusFinal) return null;
  if (r.json.statusLabel !== 'completed') throw new Error(`status ${r.json.statusLabel}`);
  // The native endpoint returns a model-written title and the lyrics it wrote —
  // the PixVerse-routed music-2.6 used to return neither.
  return [{ url: r.json.audio_url, ext: 'mp3', suffix: '', title: r.json.title }];
}
async function pollFlowmusic(jobid) {
  const r = await api('GET', `https://api.useapi.net/v1/flowmusic/jobs/${jobid}`);
  if (r.status >= 400) throw new Error(`poll HTTP ${r.status}`);
  if (r.json.status === 'failed') throw new Error(JSON.stringify(r.json).slice(0, 200));
  if (r.json.status !== 'completed') return null;
  // wav_url is the lossless master — prefer it over the m4a
  return (r.json.clips || []).map((c, i) => ({ url: c.wav_url || c.audio_url, ext: c.wav_url ? 'wav' : 'm4a', suffix: r.json.clips.length > 1 ? `-${i + 1}` : '', title: c.title }));
}

const summary = {};
const results = await Promise.allSettled(models.map(async (m, i) => {
  await sleep(i * 3500); // Mureka asks for >=3 s between calls
  const t0 = Date.now();
  const id = await m.submit();
  console.log(`[${m.name}] submitted`);
  let tracks = null;
  while (!tracks) {
    if (Date.now() - t0 > TIMEOUT_MS) throw new Error('timeout');
    await sleep(POLL_MS);
    tracks = await m.poll(id);
  }
  const files = [];
  for (const t of tracks) {
    const file = path.join(outDir, `${m.name}${t.suffix}.${t.ext}`);
    await download(t.url, file);
    files.push(path.basename(file));
  }
  summary[m.name] = { seconds: Math.round((Date.now() - t0) / 1000), files, titles: tracks.map(t => t.title).filter(Boolean) };
  console.log(`[${m.name}] done in ${summary[m.name].seconds}s -> ${files.join(', ')}`);
}));

results.forEach((r, i) => { if (r.status === 'rejected') { summary[models[i].name] = { error: String(r.reason) }; console.error(`[${models[i].name}] FAILED: ${r.reason}`); } });
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(`\nSummary: ${path.join(outDir, 'summary.json')}`);
