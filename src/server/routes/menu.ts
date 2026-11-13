import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createDailyPost } from '../core/post';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const post = await createDailyPost(undefined, true);
    return c.json<UiResponse>({ navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}` }, 200);
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>({ showToast: 'Failed to create post' }, 400);
  }
});

menu.post('/queue-question', async (c) =>
  c.json<UiResponse>(
    {
      showForm: {
        name: 'queueQuestion',
        form: {
          title: 'Queue a Crowdsense question',
          description: 'Your question replaces the built-in one on the chosen day.',
          acceptLabel: 'Queue it',
          fields: [
            { name: 'question', label: 'Question (8-140 characters)', type: 'string', required: true },
            { name: 'answers', label: 'Answers, one per line (2 to 4)', type: 'paragraph', required: true },
            { name: 'daysAhead', label: 'Days from today (1 = tomorrow)', type: 'number', defaultValue: 1, required: true },
          ],
        },
      },
    },
    200
  )
);
