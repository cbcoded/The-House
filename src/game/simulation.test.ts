/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGameTime,
  formatGameTime,
  simulateOfflineHistory,
  canPerceiveEvent,
  PRESET_SCENARIOS,
} from './simulation';

test('calculateGameTime enforces 3x real-time scale', () => {
  // 20 real minutes = 1200 real seconds = 3600 in-game seconds = 1 hour
  assert.equal(calculateGameTime(1200, 3.0), 3600);
  assert.equal(calculateGameTime(1, 3.0), 3);
});

test('formatGameTime correctly formats day and AM/PM time', () => {
  // 8:00 AM on Day 1
  const morning = formatGameTime(8 * 3600);
  assert.equal(morning.day, 1);
  assert.equal(morning.timeStr, '8:00 AM');
  assert.equal(morning.isNight, false);

  // 11:30 PM on Day 2
  const lateNight = formatGameTime(86400 + 23 * 3600 + 30 * 60);
  assert.equal(lateNight.day, 2);
  assert.equal(lateNight.timeStr, '11:30 PM');
  assert.equal(lateNight.isNight, true);
});

test('simulateOfflineHistory catches up motives and records log', () => {
  const chars = PRESET_SCENARIOS[0].characters.map((c) => ({
    ...c,
    actionTimer: 0,
    currentAction: 'Idle',
    selfTalk: '',
  }));

  // 4 real hours = 12 in-game hours
  const result = simulateOfflineHistory(4 * 3600, chars, 'FAMILY_FRIENDLY');
  assert.equal(result.hoursPassed, 12);
  assert.ok(result.logs.length > 0);
  // Energy replenished because > 6 hours passed
  assert.ok(result.updatedCharacters[0].motives.energy >= 80);
});

test('canPerceiveEvent enforces epistemic isolation', () => {
  const charInKitchen = {
    ...PRESET_SCENARIOS[0].characters[0],
    actionTimer: 0,
    currentAction: 'Idle',
    selfTalk: '',
  };

  // Same room: Kitchen
  assert.equal(canPerceiveEvent(charInKitchen, 'Kitchen', { x: -6, y: 0, z: -4 }), true);

  // Different room far away: Basement
  assert.equal(canPerceiveEvent(charInKitchen, 'Basement', { x: 0, y: -4, z: 0 }), false);

  // Off-grid character perceives nothing
  const charOffGrid = { ...charInKitchen, onGrid: false };
  assert.equal(canPerceiveEvent(charOffGrid, 'Kitchen', { x: -6, y: 0, z: -4 }), false);
});
