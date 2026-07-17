# Same brief, five models

📖 Full walkthrough: [AI Music APIs Compared: Mureka vs MiniMax vs ElevenLabs vs Lyria 3 Pro](https://useapi.net/docs/articles/ai-music-api-comparison)

`compare.mjs` sends one brief from `prompts.json` to five AI music models in parallel — Mureka `O2`, Mureka `V9`, MiniMax `music-2.6` and ElevenLabs `music-v1` (both via the PixVerse API), and Google Lyria 3 Pro (via the Flow Music API) — polls every job until it is final, and downloads every result (Mureka returns two variants, Flow Music an A/B pair with lossless WAV).

```bash
node ./compare.mjs <API_TOKEN> deep-house
```

Brief types map to the right endpoint per service automatically:

| `type` | Mureka | PixVerse (MiniMax / ElevenLabs) | Flow Music (Lyria) |
|---|---|---|---|
| `instrumental` | [music/create-instrumental](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-instrumental) | `instrumental: true` | `instrumental: true` |
| `prompt` | [music/create](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create) | `prompt` | `prompt` |
| `lyrics` | [music/create-advanced](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-advanced) (`lyrics` + `desc` + `vocal_gender`) | `prompt` + `lyrics` | `prompt` + `lyrics` |

With a single account per service nothing else is needed. If you have several, pin them with `MUREKA_ACCOUNT`, `PIXVERSE_EMAIL`, and `FLOWMUSIC_EMAIL` environment variables.

Two findings from the article worth knowing before you run it: no model has a duration parameter (only ElevenLabs honors "around 60 seconds" in the prompt — lyric length is the real lever), and ElevenLabs refuses briefs that name an artist or a work, so keep your `prompts.json` entries descriptive.
