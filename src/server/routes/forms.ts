import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { redis } from '@devvit/web/server';
import { dayNumber } from '../../shared/day';
import { parseCustom } from '../../shared/questions';

export const forms = new Hono();

forms.post('/queue-question', async (c) => {
  const { question, answers, daysAhead } = await c.req.json<{ question?: string; answers?: string; daysAhead?: number }>();
  const parsed = parseCustom(question, answers);
  if (typeof parsed === 'string') return c.json<UiResponse>({ showToast: parsed }, 200);
  const ahead = Math.floor(Number(daysAhead ?? 1));
  if (!(ahead >= 1 && ahead <= 60)) return c.json<UiResponse>({ showToast: 'Pick a day 1 to 60 days ahead' }, 200);
  const day = dayNumber(Date.now()) + ahead;
  if (await redis.get(`daily:${day}:post`)) return c.json<UiResponse>({ showToast: 'That day is already live' }, 200);
  await redis.set(`custom:${day}`, JSON.stringify(parsed));
  return c.json<UiResponse>({ showToast: `Queued for Crowdsense #${day}` }, 200);
});
