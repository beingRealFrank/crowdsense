import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type { ErrorResponse, InitResponse, Recap, ShareResponse, VoteRequest, VoteResponse } from '../../shared/api';
import { dayNumber } from '../../shared/day';
import { validPrediction } from '../../shared/scoring';
import { dayForPost, questionForDay } from '../core/post';
import { bumpStreak, finalizeDay, getCrowd, getPlay, getStreak, recordVote, topReaders } from '../core/scores';
import { endJourney } from './journey';

export const api = new Hono();

const err = (message: string) => ({ status: 'error', message }) satisfies ErrorResponse;

// Closed days are finalized lazily too, in case the scheduler run was missed.
const ensureFinal = async (day: number, today: number, n: number) => {
  if (day < today) await finalizeDay(day, n);
};

api.get('/init', async (c) => {
  const { postId } = context;
  if (!postId) return c.json(err('postId missing'), 400);
  const today = dayNumber(Date.now());
  const day = await dayForPost(postId);
  const question = await questionForDay(day);
  const n = question.answers.length;
  await ensureFinal(day, today, n);
  const username = (await reddit.getCurrentUsername()) ?? null;
  const crowd = await getCrowd(day, n);
  const me = username ? await getPlay(day, username, crowd) : null;
  const open = day === today;

  let yesterday: Recap | null = null;
  if (open && day > 1) {
    const yq = await questionForDay(day - 1);
    await ensureFinal(day - 1, today, yq.answers.length);
    const ycrowd = await getCrowd(day - 1, yq.answers.length);
    if (ycrowd.total > 0) {
      yesterday = { day: day - 1, question: yq, crowd: ycrowd, me: username ? await getPlay(day - 1, username, ycrowd) : null };
    }
  }

  const [streak, readers] = await Promise.all([
    username ? getStreak(username, today) : Promise.resolve({ current: 0, best: 0 }),
    topReaders(),
  ]);
  return c.json<InitResponse>({
    type: 'init',
    postId,
    username,
    subreddit: context.subredditName ?? null,
    day,
    today,
    open,
    question,
    me,
    // No peeking: the live split is only shown once you have voted, or after the day closes.
    crowd: me || !open ? crowd : null,
    voters: crowd.total,
    yesterday,
    streak,
    readers,
  });
});

api.post('/vote', async (c) => {
  const { postId } = context;
  if (!postId) return c.json(err('postId missing'), 400);
  const today = dayNumber(Date.now());
  const day = await dayForPost(postId);
  if (day !== today) return c.json(err('This poll has closed'), 400);
  const question = await questionForDay(day);
  const n = question.answers.length;
  const { pick, pred } = await c.req.json<VoteRequest>();
  if (!Number.isInteger(pick) || pick < 0 || pick >= n) return c.json(err('Pick an answer first'), 400);
  if (!validPrediction(pred, n)) return c.json(err('Your read must add up to 100%'), 400);
  const username = await reddit.getCurrentUsername();
  if (!username) {
    const crowd = await getCrowd(day, n);
    return c.json<VoteResponse>({
      type: 'vote',
      me: { pick, pred, score: 0, final: false, rank: 0, players: crowd.total },
      crowd,
      streak: { current: 0, best: 0 },
      saved: false,
    });
  }
  const fresh = await recordVote(day, username, pick, pred);
  const crowd = await getCrowd(day, n);
  const me = (await getPlay(day, username, crowd))!;
  if (fresh) await endJourney(c.req.header('x-devvit-journey-id') ?? '', me.score);
  const streak = await bumpStreak(username, today);
  return c.json<VoteResponse>({ type: 'vote', me, crowd, streak, saved: true });
});

// Posts the player's read as a comment from their account, only when they tap Share.
api.post('/share', async (c) => {
  const { postId } = context;
  const username = await reddit.getCurrentUsername();
  if (!postId || !username) return c.json<ShareResponse>({ type: 'share', ok: false, message: 'Log in to share' });
  const day = await dayForPost(postId);
  const q = await questionForDay(day);
  const crowd = await getCrowd(day, q.answers.length);
  const me = await getPlay(day, username, crowd);
  if (!me) return c.json<ShareResponse>({ type: 'share', ok: false, message: 'Play first' });
  const blocks = ['🟧', '🟦', '🟪', '🟨'];
  const lines = q.answers.map((a, i) => `${blocks[i]} ${a}: I guessed **${me.pred[i]}%**${i === me.pick ? ' (my pick)' : ''}`);
  const text = `Crowdsense #${day} · my read of the crowd\n\n${lines.join('  \n')}\n\n${me.final ? 'Final' : 'Early'} score: **${me.score.toFixed(1)}**`;
  try {
    await reddit.submitComment({ id: postId, text, runAs: 'USER' });
    return c.json<ShareResponse>({ type: 'share', ok: true, message: 'Your read is in the comments' });
  } catch (e) {
    console.error('share failed', e);
    return c.json<ShareResponse>({ type: 'share', ok: false, message: 'Could not post comment' });
  }
});
