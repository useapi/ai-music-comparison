# AI music comparison examples (useapi.net)

Runnable Node.js examples that put AI music models head to head by sending the same brief to all of them through one [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) API token. Instrumentals, prompt-only vocals, and your own custom lyrics. Both examples share the same six briefs, so their output is directly comparable — including across model generations.

| Example | Models | Article |
|---|---|---|
| [`same-brief-four-flagships/`](./same-brief-four-flagships) | TemPolor `v4.8`/`i4` · MiniMax `music-3.0` (native) · Google `lyria-3.5` · Mureka `V9.5` | [Four AI Music APIs on the Same Six Briefs](https://useapi.net/docs/articles/ai-music-flagships-compared?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) · [12-min video](https://youtu.be/Yqllep1eMBw) |
| [`same-brief-five-models/`](./same-brief-five-models) | Mureka `O2`/`V9` · MiniMax `music-2.6` · ElevenLabs `music-v1` · Lyria 3 Pro | [AI Music APIs Compared](https://useapi.net/docs/articles/ai-music-api-comparison?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) · [15-min video](https://youtu.be/9-tVK4SYuR4) |

The two examples are one generation apart on identical briefs — run both and you can hear what a version bump actually changed.

Related: [Suno API Alternative: Mureka, Lyria 3.5, TemPolor and MiniMax](https://useapi.net/docs/articles/suno-api-alternative?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), and the API overviews for [TemPolor](https://useapi.net/docs/api-tempolor-v1?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), [Mureka](https://useapi.net/docs/api-mureka-v1?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), [MiniMax](https://useapi.net/docs/api-minimax-v1?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), [PixVerse](https://useapi.net/docs/api-pixverse-v2?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) and [Flow Music](https://useapi.net/docs/api-flowmusic-v1?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison).

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), and connected [TemPolor](https://useapi.net/docs/start-here/setup-tempolor?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), [Mureka](https://useapi.net/docs/start-here/setup-mureka?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), [MiniMax](https://useapi.net/docs/start-here/setup-minimax?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), [PixVerse](https://useapi.net/docs/start-here/setup-pixverse?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison), and [Flow Music](https://useapi.net/docs/start-here/setup-flowmusic?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) accounts (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) covers every useapi.net API):

```bash
git clone https://github.com/useapi/ai-music-comparison.git
cd ai-music-comparison/same-brief-four-flagships
node ./compare.mjs <API_TOKEN> bigband-noir
```

The second argument picks a brief from `prompts.json` — the six briefs from the article are included (`bigband-noir`, `liquid-dnb`, `pop-duet`, `spanish-flamenco`, `deep-house`, `jazzy-house-duet`), and adding your own is one JSON entry. Tracks land in `./output/<round>/` with a `summary.json` of timings.

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison) is a third-party REST API for AI websites. These APIs run on your [TemPolor](https://www.tempolor.com/pricing), [Mureka](https://www.mureka.ai/subscribe), [MiniMax Audio](https://www.minimax.io/audio/subscribe), [PixVerse](https://pixverse.ai) and [Flow Music](https://www.flowmusic.app/pricing) website subscriptions, so you spend their credits at website-plan rates instead of metered developer-API pricing. The [article's cost table](https://useapi.net/docs/articles/ai-music-flagships-compared?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison#the-lineup-and-what-it-costs) has the numbers (as of October 2026): about 1 cent a song for MiniMax Music-3.0 on MiniMax Audio Pro, 1.1 cents for Lyria 3.5 on Flow Music Member and 1.8 cents for Mureka V9.5 on Mureka Premier, against 15, 8 and 15 cents on those makers' official APIs, and no per-song charge for TemPolor v4.8 on TemPolor Ultra ($29.99/month, unlimited tracks), against 4 cents a call. See also the [model matrix](https://useapi.net/model-matrix?utm_source=github.com&utm_medium=referral&utm_campaign=ai-music-comparison).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.
