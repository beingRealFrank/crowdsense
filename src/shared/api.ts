import type { Question } from './questions';

export type Streak = { current: number; best: number };

export type Crowd = { votes: number[]; total: number; shares: number[] };

export type MyPlay = {
  pick: number;
  pred: number[];
  score: number; // provisional while the day is open, final after
  final: boolean;
  rank: number; // 0 until final
  players: number;
};

export type Recap = {
  day: number;
  question: Question;
  crowd: Crowd;
  me: MyPlay | null;
};

export type InitResponse = {
  type: 'init';
  postId: string;
  username: string | null;
  subreddit: string | null;
  day: number;
  today: number;
  open: boolean; // voting open for this post's day
  question: Question;
  me: MyPlay | null;
  crowd: Crowd | null; // only after you have played, or once the day is closed
  voters: number; // always visible
  yesterday: Recap | null; // shown on today's post
  streak: Streak;
  readers: { name: string; points: number }[]; // all-time best crowd readers
};

export type VoteRequest = { pick: number; pred: number[] };

export type VoteResponse = { type: 'vote'; me: MyPlay; crowd: Crowd; streak: Streak; saved: boolean };

export type ShareResponse = { type: 'share'; ok: boolean; message: string };

export type ErrorResponse = { status: 'error'; message: string };
