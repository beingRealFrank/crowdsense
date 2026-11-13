# Crowdsense

**One question a day. Give your answer, then guess how everyone else answered.**

Crowdsense is a daily game for Reddit, built on Devvit Web as an interactive post.
Every day at 00:05 UTC the app posts a new everyday question to the subreddit, for example
*"Crowdsense #12: Where does the toilet paper go?"* Nobody is scored on being right about the
question. You are scored on how well you **read your own community**.

## How to play

1. Open today's Crowdsense post and tap **Read the crowd**.
2. **Step 1: your honest answer.** Tap one of the 3-4 answers. It counts as a vote.
3. **Step 2: your read.** Drag the dividers on the bar to split 100% across the answers, the way
   you think the subreddit will vote. The **+ / −** buttons fine-tune by 1%. The 100 little
   people below show your guess as a crowd.
4. Press **Lock my read**. Your guess morphs into the real split so far, the crowd recolours, and
   your score counts up.
5. **Score:** 100 minus half the total gap between your read and the crowd. 100 = you read the
   crowd exactly.

You can't peek: the live split is hidden until you have voted. One vote and one read per day.

## Daily loop

- **One shared question per day** from a bank of 100 original, light, non-political questions,
  walked in a seeded shuffle so none repeats until all have been used.
- **Scores move until midnight UTC.** Early on you see an "early read" with the vote count; at
  00:05 UTC the day is locked, final scores and ranks are computed, and points go to the
  all-time **Best crowd readers** board.
- **Yesterday's crowd** appears on today's post: the final split of yesterday's question, your
  final score and your rank.
- **Streaks**, a countdown to the next question, and **Share my read**: one tap posts your guess
  as a comment from your account, so each day's thread fills with people's reads. Nothing is
  ever posted without that tap.
- **Moderators make it theirs:** *Crowdsense: queue a question* (subreddit menu) schedules a
  custom question with 2-4 answers for any day up to 60 days ahead. It replaces the built-in one.

## For moderators

Install the app on a subreddit. It creates today's post on install and a new post every day at
00:05 UTC. Moderators can also create today's post and queue custom questions from the subreddit
menu.

## How it is built

- **Devvit Web** interactive post: React 19 client (`src/client`), Hono server (`src/server`),
  Redis for votes, reads, final scores, streaks and the all-time board, the Devvit scheduler for
  the daily post and day-close, a Devvit form for queued questions, and user actions
  (`SUBMIT_COMMENT`) for opt-in sharing.
- **Scoring is server-side** (`src/shared/scoring.ts`); the client only sends the vote and the
  read, which are validated (integers, summing to 100). Days are finalized by the scheduler, and
  lazily on the next visit if a run was missed.
- **No fake crowd:** every number shown comes from real votes in the subreddit.
- **Devvit Journeys** instrumentation: App.Ready on load, Journey.Start/Progress on picking an
  answer, Journey.End with the score.

```bash
npm install
npm run test:unit   # scoring, rounding, question bank and custom-question tests
npm run dev         # devvit playtest
npm run deploy      # type-check, lint, devvit upload
```

## AI disclosure

The code, documentation and video for this project were produced by Claude Code AI agents.
The entrant chose and edited the concept, approved the scope and reviewed the submission.
See [AI_USE.md](AI_USE.md).

## License

MIT. See [LICENSE](LICENSE).
