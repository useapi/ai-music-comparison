#!/usr/bin/env node
// Same brief, five AI music models — Mureka O2, Mureka V9, MiniMax music-2.6,
// ElevenLabs music-v1, and Lyria 3 Pro — through the useapi.net API.
//
//   node compare.mjs <API_TOKEN> [round]
//
// `round` is a key from prompts.json (default: the first one). Results land in
// ./output/<round>/. Optional env when you have more than one account configured:
//   MUREKA_ACCOUNT=12345678901234  PIXVERSE_EMAIL=me@example.com  FLOWMUSIC_EMAIL=me@example.com
//
// 📖 Full walkthrough with all 30 generated tracks:
//    https://useapi.net/docs/articles/ai-music-api-comparison

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

// Per-service request bodies for the three brief types (instrumental / prompt / lyrics)
function murekaRequest(model) {
  if (brief.type === 'instrumental') return ['music/create-instrumental', { model, prompt: brief.prompt }];
  if (brief.type === 'lyrics') {
    const body = { model, lyrics: brief.lyrics, desc: brief.murekaDesc };
    if (brief.vocalGender) body.vocal_gender = brief.vocalGender;
    return ['music/create-advanced', body];
  }
  return ['music/create', { model, prompt: brief.prompt }];
}
function pixverseBody(model) {
  const body = { model, prompt: brief.type === 'lyrics' ? brief.style : brief.prompt };
  if (brief.type === 'instrumental') body.instrumental = true;
  if (brief.type === 'lyrics') body.lyrics = brief.lyrics;
  if (process.env.PIXVERSE_EMAIL) body.email = process.env.PIXVERSE_EMAIL;
  return body;
}
function flowmusicBody() {
  const body = { mode: 'async', prompt: brief.type === 'lyrics' ? brief.style : brief.prompt };
  if (brief.type === 'instrumental') body.instrumental = true;
  if (brief.type === 'lyrics') body.lyrics = brief.lyrics;
  if (process.env.FLOWMUSIC_EMAIL) body.email = process.env.FLOWMUSIC_EMAIL;
  return body;
}

const POLL_MS = 15_000, TIMEOUT_MS = 20 * 60 * 1000;

const models = [
  { name: 'mureka-o2', submit: async () => {
      const [endpoint, body] = murekaRequest('O2');
      if (process.env.MUREKA_ACCOUNT) body.account = process.env.MUREKA_ACCOUNT;
      const r = await api('POST', `https://api.useapi.net/v1/mureka/${endpoint}`, { ...body, async: true });
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.jobid;
    }, poll: pollMureka },
  { name: 'mureka-v9', submit: async () => {
      const [endpoint, body] = murekaRequest('V9');
      if (process.env.MUREKA_ACCOUNT) body.account = process.env.MUREKA_ACCOUNT;
      const r = await api('POST', `https://api.useapi.net/v1/mureka/${endpoint}`, { ...body, async: true });
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.jobid;
    }, poll: pollMureka },
  { name: 'minimax-music-2.6', submit: async () => {
      const r = await api('POST', 'https://api.useapi.net/v2/pixverse/music/create', pixverseBody('music-2.6'));
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.audio_id;
    }, poll: pollPixverse },
  { name: 'elevenlabs-music-v1', submit: async () => {
      const r = await api('POST', 'https://api.useapi.net/v2/pixverse/music/create', pixverseBody('music-v1'));
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.audio_id;
    }, poll: pollPixverse },
  { name: 'lyria-3-pro', submit: async () => {
      const r = await api('POST', 'https://api.useapi.net/v1/flowmusic/music', flowmusicBody());
      if (r.status >= 300) throw new Error(JSON.stringify(r.json).slice(0, 200));
      return r.json.jobid;
    }, poll: pollFlowmusic },
];

// NOTE: keep job ids RAW in the path — do not URL-encode ':' or '@'
async function pollMureka(jobid) {
  const r = await api('GET', `https://api.useapi.net/v1/mureka/jobs/${jobid}`);
  if (r.status >= 400) throw new Error(`poll HTTP ${r.status}`);
  if (r.json.status === 'failed' || r.json.error) throw new Error(JSON.stringify(r.json).slice(0, 200));
  const songs = r.json.songs || r.json.response?.songs;
  if (!songs?.length || !songs.every(s => s.mp3_url)) return null;
  return songs.map((s, i) => ({ url: s.mp3_url, ext: 'mp3', suffix: `-${i + 1}`, title: s.title }));
}
async function pollPixverse(audio_id) {
  const r = await api('GET', `https://api.useapi.net/v2/pixverse/music/${audio_id}`);
  if (r.status >= 400) throw new Error(`poll HTTP ${r.status}`);
  if (r.json.audio_status_final && r.json.audio_status_name !== 'COMPLETED') throw new Error(r.json.audio_status_name);
  if (!r.json.audio_status_final) return null;
  return [{ url: r.json.url, ext: 'mp3', suffix: '' }];
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
