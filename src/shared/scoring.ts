// Crowdsense scoring. Predictions and crowd shares are whole-number percents.

export const crowdShares = (votes: number[]): number[] => {
  const total = votes.reduce((a, v) => a + v, 0);
  if (!total) return votes.map(() => 0);
  return roundTo100(votes.map((v) => (v / total) * 100));
};

// Largest-remainder rounding so shares always sum to exactly 100.
export const roundTo100 = (raw: number[]): number[] => {
  const floors = raw.map((v) => Math.floor(v));
  let left = 100 - floors.reduce((a, v) => a + v, 0);
  const order = raw.map((v, i) => ({ i, r: v - Math.floor(v) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    floors[i]! += 1;
    left--;
  }
  return floors;
};

export const validPrediction = (pred: unknown, n: number): pred is number[] =>
  Array.isArray(pred) &&
  pred.length === n &&
  pred.every((v) => Number.isInteger(v) && v >= 0 && v <= 100) &&
  pred.reduce((a: number, v: number) => a + v, 0) === 100;

// 100 = you read the crowd exactly; 0 = you put everything on the one answer nobody picked.
export const readScore = (pred: number[], crowd: number[]): number => {
  const err = pred.reduce((a, p, i) => a + Math.abs(p - (crowd[i] ?? 0)), 0);
  return Math.max(0, Math.round((100 - err / 2) * 10) / 10);
};

export const verdict = (score: number): string =>
  score >= 95 ? 'Mind reader' : score >= 88 ? 'Crowd whisperer' : score >= 78 ? 'Good instincts' : score >= 65 ? 'Half right' : score >= 50 ? 'Bit of a hunch' : 'Marching alone';
