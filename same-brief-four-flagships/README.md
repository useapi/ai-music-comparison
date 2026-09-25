# Same brief, four flagships

📖 Full walkthrough: [Four AI Music APIs on the Same Six Briefs: TemPolor v4.8, MiniMax Music-3.0, Lyria 3.5 and Mureka V9.5](https://useapi.net/docs/articles/ai-music-flagships-compared)
📺 Skimmable 12-minute cut of every track: [YouTube](https://youtu.be/Yqllep1eMBw)

`compare.mjs` sends one brief from `prompts.json` to the four current AI music flagships in parallel — TemPolor `v4.8` / `i4` (via the [TemPolor API](https://useapi.net/docs/api-tempolor-v1)), MiniMax `music-3.0` (via the [native MiniMax music endpoint](https://useapi.net/docs/api-minimax-v1/post-minimax-music-create)), Google `lyria-3.5` (via the [Flow Music API](https://useapi.net/docs/api-flowmusic-v1)), and Mureka `V9.5` (via the [Mureka API](https://useapi.net/docs/api-mureka-v1)) — polls every job until it is final, and downloads every result. Mureka returns two variants, Flow Music an A/B pair with a lossless WAV, MiniMax and TemPolor a single track each.

```bash
node ./compare.mjs <API_TOKEN> deep-house
```

The briefs are the same six the article uses, so your output is directly comparable to the tracks published there — and to the [previous generation](../same-brief-five-models), which ran these same words through Mureka O2/V9, MiniMax music-2.6, ElevenLabs music-v1 and Lyria 3 Pro.

Brief types map to the right endpoint per service automatically:

| `type` | TemPolor | Mureka | MiniMax (native) | Flow Music (Lyria) |
|---|---|---|---|---|
| `instrumental` | [music/instrumental](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-instrumental) (`i4`) | [music/create-instrumental](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-instrumental) | `instrumental: true` | `instrumental: true` |
| `prompt` | [music/song](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-song) (`v4.8`) | [music/create](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create) | `prompt` | `prompt` |
| `lyrics` | [music/song](https://useapi.net/docs/api-tempolor-v1/post-tempolor-music-song) + `lyrics` | [music/create-advanced](https://useapi.net/docs/api-mureka-v1/post-mureka-music-create-advanced) (`lyrics` + `desc` + `vocal_gender`) | `prompt` + `lyrics` | `prompt` + `lyrics` |

With a single account per service nothing else is needed. If you have several, pin them with `TEMPOLOR_ACCOUNT`, `MUREKA_ACCOUNT`, `MINIMAX_ACCOUNT` and `FLOWMUSIC_EMAIL` environment variables.

## Five things that will bite you

**TemPolor reports a song COMPLETED before you can download it.** `status_final` flips to `true` and `status_name` reads `COMPLETED`, but [`GET music/download/job_id`](https://useapi.net/docs/api-tempolor-v1/get-tempolor-music-download-job_id) answers `404` for a few more seconds. Three of our four vocal rounds hit it on the first attempt. Treat that `404` as "not ready" and keep polling — `pollTempolor` does.

**TemPolor picks the model by endpoint, not by a flag.** Vocals are `v4.8` on `music/song`, instrumentals are `i4` on `music/instrumental`. Older model names are still accepted and routed to these two, so you cannot get stuck on an old model — but you also will not be told which one ran unless you pass `model_song` / `model_instrumental` yourself.

**`lyria-3-pro` is still the Flow Music default.** Omit `model` and you get the previous generation, silently — the render succeeds and nothing tells you it was the old model. The script always passes `model: 'lyria-3.5'` explicitly.

**MiniMax runs one music generation per account at a time** and returns `429` otherwise — and it counts songs you start on [minimax.io](https://www.minimax.io/audio/music) as well as through the API. The script waits and retries rather than failing. Music also bills against a separate [MiniMax Audio](https://www.minimax.io/audio/subscribe) balance from video and images: a call with no audio credit returns `412 Insufficient credits` however much video credit the account holds.

**`instrumental: true` is required for a wordless track.** On both MiniMax and Flow Music, leaving `lyrics` empty is not enough — the model writes its own words and sings them. TemPolor sidesteps the question by putting instrumentals on their own endpoint.

Two more things worth knowing before you run it. None of the four exposes a duration parameter, and asking in the prompt is unreliable — the amount of `lyrics` you supply is the only real lever on song length. And if you supply your own lyrics with role labels, check what each model does with them: TemPolor's own lyric generator writes inline `[Male]` / `[Female]` tags that its singer then performs as words, while MiniMax's `(Male)` / `(Female)` are dropped. Labels inside `lyrics` are not a portable API feature.
