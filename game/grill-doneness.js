// grill-doneness.js — the teppan gradient. Every pan cooks on the same
// clock: raw -> cooking -> PERFECT (gold, ~5 s) -> overdone -> burnt.
(function () {
  'use strict';

  const PERFECT_START = 6.0;
  const PERFECT_END = 11.0;   // the gold zone lasts about five seconds
  const OVER_END = 13.5;      // then it burns

  function stageAt(t) {
    if (t < 2.5) return 'raw';
    if (t < PERFECT_START) return 'cooking';
    if (t < PERFECT_END) return 'perfect';
    if (t < OVER_END) return 'overdone';
    return 'burnt';
  }

  // Quality of an item lifted off the grill at time t.
  function qualityAt(t) {
    const s = stageAt(t);
    if (s === 'perfect') return 'perfect';
    if (s === 'cooking') return 'under';
    if (s === 'overdone') return 'over';
    if (s === 'burnt') return 'burnt';
    return 'under'; // lifted raw: undercooked
  }

  // 0..1 progress through the whole gradient, for the doneness ring.
  function donenessFrac(t) {
    return Math.min(1, t / OVER_END);
  }

  function updatePans(state, dt) {
    for (let i = 0; i < state.pans.length; i++) {
      const pan = state.pans[i];
      if (!pan.item) continue;
      const before = stageAt(pan.t);
      pan.t += dt;
      const after = stageAt(pan.t);
      if (before !== 'perfect' && after === 'perfect') {
        UR.sparkBurst(state, UR.PAN_X[i], 520, '#ffd93d', 5);
      }
      if (after === 'burnt' && before !== 'burnt') {
        UR.popup(state, UR.PAN_X[i], 470, 'BURNT!', '#ff6b6b', false);
        UR.sfx.buzz(state);
      }
      if (after === 'burnt' || (after === 'perfect' && ((pan.t * 7) | 0) % 3 === 0)) {
        UR.steamPuff(state, UR.PAN_X[i], 505, 1);
      }
    }
  }

  function freePan(state) {
    for (let i = 0; i < state.pans.length; i++) if (!state.pans[i].item) return i;
    return -1;
  }

  // The pan that most urgently needs lifting: burnt first, then the oldest.
  function urgentPan(state) {
    let best = -1, bestT = -1;
    for (let i = 0; i < state.pans.length; i++) {
      if (state.pans[i].item && state.pans[i].t > bestT) { bestT = state.pans[i].t; best = i; }
    }
    return best;
  }

  window.UR = window.UR || {};
  window.UR.PERFECT_START = PERFECT_START;
  window.UR.PERFECT_END = PERFECT_END;
  window.UR.OVER_END = OVER_END;
  window.UR.stageAt = stageAt;
  window.UR.qualityAt = qualityAt;
  window.UR.donenessFrac = donenessFrac;
  window.UR.updatePans = updatePans;
  window.UR.freePan = freePan;
  window.UR.urgentPan = urgentPan;
})();
