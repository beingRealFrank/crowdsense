import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayNumber } from './day.ts';
import { BANK, bankIndexForDay, bankQuestion, parseCustom } from './questions.ts';
import { crowdShares, readScore, roundTo100, validPrediction } from './scoring.ts';

test('day numbering starts at 1 on 2026-11-13 UTC', () => {
  assert.equal(dayNumber(Date.UTC(2026, 10, 13, 0, 0, 1)), 1);
  assert.equal(dayNumber(Date.UTC(2026, 10, 14, 23, 59)), 2);
});

test('bank has at least 90 well-formed, unique questions', () => {
  assert.ok(BANK.length >= 90, `only ${BANK.length}`);
  assert.equal(new Set(BANK.map((q) => q.q)).size, BANK.length);
  for (const q of BANK) {
    assert.ok(q.answers.length >= 3 && q.answers.length <= 4, q.q);
    assert.ok(q.q.length <= 140, q.q);
    assert.ok(q.answers.every((a) => a.length <= 48), q.q);
  }
});

test('no question repeats within one full cycle, and selection is deterministic', () => {
  const seen = new Set<number>();
  for (let d = 1; d <= BANK.length; d++) seen.add(bankIndexForDay(d));
  assert.equal(seen.size, BANK.length);
  assert.deepEqual(bankQuestion(42), bankQuestion(42));
});

test('crowd shares round to exactly 100', () => {
  assert.deepEqual(crowdShares([1, 1, 1]), [34, 33, 33]);
  assert.deepEqual(crowdShares([0, 0, 0, 0]), [0, 0, 0, 0]);
  for (const v of [[3, 7, 11, 2], [1, 0, 0, 0], [5, 5, 5, 6]]) {
    assert.equal(crowdShares(v).reduce((a, b) => a + b, 0), 100);
  }
  assert.deepEqual(roundTo100([50, 50]), [50, 50]);
});

test('read score: exact = 100, opposite = 0, half error = 50', () => {
  assert.equal(readScore([40, 30, 30], [40, 30, 30]), 100);
  assert.equal(readScore([100, 0], [0, 100]), 0);
  assert.equal(readScore([50, 50, 0], [0, 50, 50]), 50);
});

test('predictions must be integer percents summing to 100', () => {
  assert.ok(validPrediction([25, 25, 50], 3));
  assert.ok(!validPrediction([25, 25, 49], 3));
  assert.ok(!validPrediction([25, 25.5, 49.5], 3));
  assert.ok(!validPrediction([-10, 60, 50], 3));
  assert.ok(!validPrediction([50, 50], 3));
});

test('custom questions are validated', () => {
  assert.deepEqual(parseCustom('Best season for a picnic?', 'Spring\nSummer\n\nAutumn'), {
    q: 'Best season for a picnic?',
    answers: ['Spring', 'Summer', 'Autumn'],
  });
  assert.equal(typeof parseCustom('Hi?', 'a\nb'), 'string');
  assert.equal(typeof parseCustom('A fine question here?', 'only one'), 'string');
  assert.equal(typeof parseCustom('A fine question here?', 'same\nSame'), 'string');
});
