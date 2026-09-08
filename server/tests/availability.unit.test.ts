import { describe, it, expect } from 'vitest';
import { computeOpenSlots, DAILY_SLOTS } from '../src/lib/availability';

describe('computeOpenSlots', () => {
  it('returns all slots when nothing is booked', () => {
    expect(computeOpenSlots([])).toEqual(DAILY_SLOTS);
  });

  it('excludes booked slots', () => {
    const result = computeOpenSlots(['09:00', '14:00']);
    expect(result).not.toContain('09:00');
    expect(result).not.toContain('14:00');
    expect(result).toHaveLength(DAILY_SLOTS.length - 2);
  });
});
