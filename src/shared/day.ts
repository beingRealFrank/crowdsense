// Day numbering shared by client and server. Day 1 is 2026-11-13 (UTC).
const EPOCH_UTC = Date.UTC(2026, 10, 13);
const DAY_MS = 86_400_000;

export const dayNumber = (now: number): number => Math.floor((now - EPOCH_UTC) / DAY_MS) + 1;

export const dayStartMs = (day: number): number => EPOCH_UTC + (day - 1) * DAY_MS;
