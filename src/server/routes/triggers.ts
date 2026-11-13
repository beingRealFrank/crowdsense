import { Hono } from 'hono';
import type { TaskResponse } from '@devvit/web/server';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';
import { dayNumber } from '../../shared/day';
import { createDailyPost, questionForDay } from '../core/post';
import { finalizeDay } from '../core/scores';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  try {
    await c.req.json<OnAppInstallRequest>();
    const post = await createDailyPost();
    return c.json<TriggerResponse>({ status: 'success', message: `Daily post ${post.id}` }, 200);
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<TriggerResponse>({ status: 'error', message: 'Failed to create post' }, 400);
  }
});

export const scheduler = new Hono();

// Runs at 00:05 UTC: lock yesterday's scores, then post today's question.
scheduler.post('/daily-post', async (c) => {
  const today = dayNumber(Date.now());
  try {
    const yq = await questionForDay(today - 1);
    const n = await finalizeDay(today - 1, yq.answers.length);
    console.log(`finalized day ${today - 1}: ${n} players`);
  } catch (error) {
    console.error(`finalize failed: ${error}`);
  }
  try {
    const post = await createDailyPost(today);
    console.log(`daily post ${post.id} created=${post.created}`);
  } catch (error) {
    console.error(`daily post failed: ${error}`);
  }
  return c.json<TaskResponse>({ status: 'ok' }, 200);
});
