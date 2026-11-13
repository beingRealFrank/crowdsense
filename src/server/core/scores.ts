import { redis } from '@devvit/web/server';
import type { Crowd, MyPlay, Streak } from '../../shared/api';
import { crowdShares, readScore } from '../../shared/scoring';

const k = {
  votes: (d: number) => `day:${d}:votes`, // hash answerIndex -> count
  players: (d: number) => `day:${d}:players`, // zset username -> join time
  play: (d: number, u: string) => `day:${d}:play:${u}`, // {pick, pred}
  final: (d: number) => `day:${d}:final`, // zset username -> final score
  finalized: (d: number) => `day:${d}:finalized`,
  readers: 'readers:points', // zset username -> cumulative final points
  streak: (u: string) => `user:${u}:streak`,
};

type Stored = { pick: number; pred: number[]; at: number };

export const getCrowd = async (day: number, n: number): Promise<Crowd> => {
  const h = await redis.hGetAll(k.votes(day));
  const votes = Array.from({ length: n }, (_, i) => Number(h[String(i)] ?? 0));
  return { votes, total: votes.reduce((a, v) => a + v, 0), shares: crowdShares(votes) };
};

const isFinal = async (day: number) => Boolean(await redis.get(k.finalized(day)));

export const getPlay = async (day: number, user: string, crowd: Crowd): Promise<MyPlay | null> => {
  const raw = await redis.get(k.play(day, user));
  if (!raw) return null;
  const { pick, pred } = JSON.parse(raw) as Stored;
  if (await isFinal(day)) {
    const [score, players, ascRank] = await Promise.all([
      redis.zScore(k.final(day), user),
      redis.zCard(k.final(day)),
      redis.zRank(k.final(day), user),
    ]);
    return { pick, pred, score: score ?? readScore(pred, crowd.shares), final: true, rank: players - (ascRank ?? 0), players };
  }
  return { pick, pred, score: readScore(pred, crowd.shares), final: false, rank: 0, players: crowd.total };
};

// First vote only; later calls return the stored play.
export const recordVote = async (day: number, user: string, pick: number, pred: number[]): Promise<boolean> => {
  const set = await redis.set(k.play(day, user), JSON.stringify({ pick, pred, at: Date.now() } satisfies Stored), { nx: true });
  if (!set) return false;
  await redis.hIncrBy(k.votes(day), String(pick), 1);
  await redis.zAdd(k.players(day), { member: user, score: Date.now() });
  return true;
};

// Locks final scores for a closed day. Idempotent.
export const finalizeDay = async (day: number, n: number): Promise<number> => {
  if (await isFinal(day)) return 0;
  const crowd = await getCrowd(day, n);
  const players = await redis.zRange(k.players(day), 0, -1, { by: 'rank' });
  for (const { member } of players) {
    const raw = await redis.get(k.play(day, member));
    if (!raw) continue;
    const { pred } = JSON.parse(raw) as Stored;
    const score = readScore(pred, crowd.shares);
    await redis.zAdd(k.final(day), { member, score });
    await redis.zIncrBy(k.readers, member, Math.round(score));
  }
  await redis.set(k.finalized(day), '1');
  return players.length;
};

export const topReaders = async (): Promise<{ name: string; points: number }[]> =>
  (await redis.zRange(k.readers, 0, 4, { by: 'rank', reverse: true })).map((m) => ({ name: m.member, points: m.score }));

export const getStreak = async (user: string, today: number): Promise<Streak> => {
  const s = await redis.hGetAll(k.streak(user));
  const last = Number(s.last ?? 0);
  const current = last >= today - 1 ? Number(s.current ?? 0) : 0;
  return { current, best: Number(s.best ?? 0) };
};

export const bumpStreak = async (user: string, today: number): Promise<Streak> => {
  const s = await redis.hGetAll(k.streak(user));
  const last = Number(s.last ?? 0);
  if (last === today) return { current: Number(s.current ?? 1), best: Number(s.best ?? 1) };
  const current = last === today - 1 ? Number(s.current ?? 0) + 1 : 1;
  const best = Math.max(current, Number(s.best ?? 0));
  await redis.hSet(k.streak(user), { last: String(today), current: String(current), best: String(best) });
  return { current, best };
};
