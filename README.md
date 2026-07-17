# AI music comparison examples (useapi.net)

Runnable Node.js examples that put **five AI music models head to head** — [Mureka](https://useapi.net/docs/api-mureka-v1) `O2` and `V9`, [MiniMax](https://useapi.net/docs/api-pixverse-v2/post-pixverse-music-create) `music-2.6`, [ElevenLabs](https://useapi.net/docs/api-pixverse-v2/post-pixverse-music-create) `music-v1`, and Google [Lyria 3 Pro](https://useapi.net/docs/api-flowmusic-v1) — by sending the **same brief** to all five through one [useapi.net](https://useapi.net) API token. Instrumentals, prompt-only vocals, and your own custom lyrics.

📖 Full walkthrough with all 30 generated tracks, prices, and findings: [AI Music APIs Compared: Mureka vs MiniMax vs ElevenLabs vs Lyria 3 Pro](https://useapi.net/docs/articles/ai-music-api-comparison)
📺 Skimmable 15-minute cut of every track: [YouTube](https://youtu.be/9-tVK4SYuR4)

| Example | What it does | Docs |
|---|---|---|
| [`same-brief-five-models/`](./same-brief-five-models) | Send one brief to all five models, poll every job, download every track | [Mureka](https://useapi.net/docs/api-mureka-v1) · [PixVerse music](https://useapi.net/docs/api-pixverse-v2/post-pixverse-music-create) · [Flow Music](https://useapi.net/docs/api-flowmusic-v1) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi), and connected [Mureka](https://useapi.net/docs/start-here/setup-mureka), [PixVerse](https://useapi.net/docs/start-here/setup-pixverse), and [Flow Music](https://useapi.net/docs/start-here/setup-flowmusic) accounts (one [$15/month subscription](https://useapi.net/docs/subscription) covers every useapi.net API):

```bash
git clone https://github.com/useapi/ai-music-comparison.git
cd ai-music-comparison/same-brief-five-models
node ./compare.mjs <API_TOKEN> bigband-noir
```

The second argument picks a brief from `prompts.json` — the six briefs from the article are included (`bigband-noir`, `liquid-dnb`, `pop-duet`, `spanish-flamenco`, `deep-house`, `jazzy-house-duet`), and adding your own is one JSON entry. Tracks land in `./output/<round>/` with a `summary.json` of timings.

## About useapi.net

[useapi.net](https://useapi.net) is an experimental REST API for AI services. These APIs drive your own [Mureka](https://www.mureka.ai), [PixVerse](https://pixverse.ai), and [Flow Music](https://www.flowmusic.app) accounts, so you spend your plans' credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix) and the [article's cost table](https://useapi.net/docs/articles/ai-music-api-comparison) for the numbers.

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@midjourneyapi).
