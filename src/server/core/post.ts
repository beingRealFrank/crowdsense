import { context, redis, reddit } from '@devvit/web/server';
import { dayNumber } from '../../shared/day';
import { bankQuestion, type Question } from '../../shared/questions';

// A moderator-queued question for a day overrides the built-in bank.
export const questionForDay = async (day: number): Promise<Question> => {
  const custom = await redis.get(`custom:${day}`);
  if (custom) return JSON.parse(custom) as Question;
  return bankQuestion(day);
};

export const postTitle = (day: number, q: Question): string => `Crowdsense #${day}: ${q.q}`.slice(0, 300);

export const createDailyPost = async (day = dayNumber(Date.now()), force = false) => {
  const existing = await redis.get(`daily:${day}:post`);
  if (existing && !force) return { id: existing, created: false };
  const q = await questionForDay(day);
  // Freeze the question for this day so later queue edits cannot change a live poll.
  await redis.set(`custom:${day}`, JSON.stringify(q));
  const post = await reddit.submitCustomPost({
    subredditName: context.subredditName,
    title: postTitle(day, q),
    entry: 'default',
    postData: { day },
  });
  await redis.set(`daily:${day}:post`, post.id);
  await redis.set(`post:${post.id}:day`, String(day));
  return { id: post.id, created: true };
};

export const dayForPost = async (postId: string): Promise<number> => {
  const stored = await redis.get(`post:${postId}:day`);
  if (stored) return Number(stored);
  const fromData = context.postData?.day;
  if (typeof fromData === 'number') return fromData;
  return dayNumber(Date.now());
};
