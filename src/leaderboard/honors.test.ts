import { describe, expect, test } from 'vitest';
import { leaderboardEntry as entry } from '../testing/leaderboard-entries';
import { pickHonors } from './honors';

describe('pickHonors', () => {
  test('the Last Winner won most recently, even when someone else ranks first', () => {
    const ann = entry('Ann', { rank: 1, wins: 3, latestWinningHand: 'flush', lastWonAt: 1_000 });
    const bob = entry('Bob', { rank: 2, wins: 1, latestWinningHand: 'pair', lastWonAt: 2_000 });
    const cal = entry('Cal', { rank: 3 });

    const honors = pickHonors([ann, bob, cal]);

    expect(honors.lastWinner?.displayName).toBe('Bob');
    expect(honors.reigningChampion?.displayName).toBe('Ann');
  });

  test('one member can hold both honors', () => {
    const ann = entry('Ann', { rank: 1, wins: 1, latestWinningHand: 'flush', lastWonAt: 1_000 });

    const honors = pickHonors([ann, entry('Bob', { rank: 2 })]);

    expect(honors.lastWinner?.displayName).toBe('Ann');
    expect(honors.reigningChampion?.displayName).toBe('Ann');
  });

  test('nobody holds an honor before the first win', () => {
    const honors = pickHonors([entry('Ann'), entry('Bob')]);

    expect(honors).toEqual({ lastWinner: null, reigningChampion: null });
  });

  test('nobody holds an honor on an empty Leaderboard', () => {
    expect(pickHonors([])).toEqual({ lastWinner: null, reigningChampion: null });
  });
});
