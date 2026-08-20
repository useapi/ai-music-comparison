# Same brief, three flagships

📖 Full walkthrough: [AI Music APIs One Generation Later: MiniMax Music-3.0 vs Lyria 3.5 vs Mureka V9.5](https://useapi.net/docs/articles/ai-music-flagships-compared)
📺 Skimmable 9-minute cut of every track: [YouTube](https://youtu.be/9AM5p-A9oFM)

`compare.mjs` sends one brief from `prompts.json` to the three current AI music flagships in parallel — MiniMax `music-3.0` (via the [native MiniMax music endpoint](https://useapi.net/docs/api-minimax-v1/post-minimax-music-create)), Google `lyria-3.5` (via the [Flow Music API](https://useapi.net/docs/api-flowmusic-v1)), and Mureka `V9.5` (via the [Mureka API](https://useapi.net/docs/api-mureka-v1)) — polls every job until it is final, and downloads every result. Mureka returns two variants, Flow Music an A/B pair with a lossless WAV, MiniMax a single track.

```bash
node ./compare.mjs <API_TOKEN> deep-house
```

The briefs are the same six the article uses, so your output is directly comparable to the tracks published there — and to the [previous generation](../same-brief-five-models), which ran these same words through Mureka O2/V9, MiniMax music-2.6, ElevenLabs music-v1 and Lyria 3 Pro.

Brief types map to the right endpoint per service automatically:

| `type` | Mureka | MiniMax (native) | Flow Music (Lyria) |
|---|---|---|---|
| `instrumental` | [music/create-instrumental](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-instrumental) | `instrumental: true` | `instrumental: true` |
| `prompt` | [music/create](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create) | `prompt` | `prompt` |
| `lyrics` | [music/create-advanced](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-advanced) (`lyrics` + `desc` + `vocal_gender`) | `prompt` + `lyrics` | `prompt` + `lyrics` |

With a single account per service nothing else is needed. If you have several, pin them with `MUREKA_ACCOUNT`, `MINIMAX_ACCOUNT` and `FLOWMUSIC_EMAIL` environment variables.

## Three things that will bite you

**`lyria-3-pro` is still the Flow Music default.** Omit `model` and you get the previous generation, silently — the render succeeds and nothing tells you it was the old model. The script always passes `model: 'lyria-3.5'` explicitly.

**MiniMax runs one music generation per account at a time** and returns `429` otherwise — and it counts songs you start on [minimax.io](https://www.minimax.io/audio/music) as well as through the API. The script waits and retries rather than failing. Music also bills against a separate [MiniMax Audio](https://www.minimax.io/audio/subscribe) balance from video and images: a call with no audio credit returns `412 Insufficient credits` however much video credit the account holds.

**`instrumental: true` is required for a wordless track.** On both MiniMax and Flow Music, leaving `lyrics` empty is not enough — the model writes its own words and sings them.

One more thing worth knowing before you run it: none of the three exposes a duration parameter, and asking in the prompt is unreliable. The amount of `lyrics` you supply is the only real lever on song length.
