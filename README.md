# AI music comparison examples (useapi.net)

Runnable Node.js examples that put AI music models head to head by sending the **same brief** to all of them through one [useapi.net](https://useapi.net) API token. Instrumentals, prompt-only vocals, and your own custom lyrics. Both examples share the same six briefs, so their output is directly comparable — including across model generations.

| Example | Models | Article |
|---|---|---|
| [`same-brief-four-flagships/`](./same-brief-four-flagships) | TemPolor `v4.8`/`i4` · MiniMax `music-3.0` (native) · Google `lyria-3.5` · Mureka `V9.5` | [Four AI Music APIs on the Same Six Briefs](https://useapi.net/docs/articles/ai-music-flagships-compared) · [12-min video](https://youtu.be/Yqllep1eMBw) |
| [`same-brief-five-models/`](./same-brief-five-models) | Mureka `O2`/`V9` · MiniMax `music-2.6` · ElevenLabs `music-v1` · Lyria 3 Pro | [AI Music APIs Compared](https://useapi.net/docs/articles/ai-music-api-comparison) · [15-min video](https://youtu.be/9-tVK4SYuR4) |

The two examples are one generation apart on identical briefs — run both and you can hear what a version bump actually changed.

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi), and connected [TemPolor](https://useapi.net/docs/start-here/setup-tempolor), [Mureka](https://useapi.net/docs/start-here/setup-mureka), [MiniMax](https://useapi.net/docs/start-here/setup-minimax), [PixVerse](https://useapi.net/docs/start-here/setup-pixverse), and [Flow Music](https://useapi.net/docs/start-here/setup-flowmusic) accounts (one [$15/month subscription](https://useapi.net/docs/subscription) covers every useapi.net API):

```bash
git clone https://github.com/useapi/ai-music-comparison.git
cd ai-music-comparison/same-brief-four-flagships
node ./compare.mjs <API_TOKEN> bigband-noir
```

The second argument picks a brief from `prompts.json` — the six briefs from the article are included (`bigband-noir`, `liquid-dnb`, `pop-duet`, `spanish-flamenco`, `deep-house`, `jazzy-house-duet`), and adding your own is one JSON entry. Tracks land in `./output/<round>/` with a `summary.json` of timings.

## About useapi.net

[useapi.net](https://useapi.net) is an experimental REST API for AI services. These APIs drive your own [TemPolor](https://www.tempolor.com), [Mureka](https://www.mureka.ai), [MiniMax](https://www.minimax.io), [PixVerse](https://pixverse.ai), and [Flow Music](https://www.flowmusic.app) accounts, so you spend your plans' credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix) and the [article's cost table](https://useapi.net/docs/articles/ai-music-flagships-compared) for the numbers — about a cent a track on three of them, against $0.15, $0.08 and $0.03 a song on those vendors' own APIs, and a flat $30/month for unlimited generations on TemPolor.

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).