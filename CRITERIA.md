# Judging criteria → features

| Criterion | How Crowdsense meets it | Where |
|---|---|---|
| Delightful UX | Two tiny steps (tap an answer, drag a bar); animated "drag the dividers" hint; a 100-person crowd that recolours as your guess morphs into the real split; score count-up and one-line verdicts | `src/client/game.tsx`, `ui.tsx` |
| Polish | Fits a phone viewport; distinct newsprint-poll identity; no peeking at the split before voting; validated server-side scoring; unit tests | `src/shared/*.test.ts` |
| Reddit-y | The game *is* the community: you are scored on reading your own subreddit; opt-in "Share my read" fills each day's thread; mods queue their own questions; all-time best crowd readers board | `src/server/routes/api.ts`, `forms.ts` |
| Daily Content | New question every day (100-question bank, no repeats per cycle, plus mod-queued questions); day closes at midnight UTC and tomorrow's post reveals yesterday's final crowd; streaks | `devvit.json` scheduler; `questions.ts` |
| Stand-out list: Journeys | App.Ready, Journey.Start/Progress/End with score | `src/server/routes/journey.ts` |
