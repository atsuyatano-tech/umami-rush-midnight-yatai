// game-state.js — the whole mutable state of one service, plus the seeded
// random stream that makes ticket generation deterministic.
(function () {
  'use strict';

  // mulberry32: tiny seeded PRNG. The same seed always deals the same night.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const SERVICE_SECONDS = 150;
  const DEMO_SEED = 20261125;

  function freshPan() { return { item: null, t: 0 }; }

  function createState(seed) {
    return {
      mode: 'title',            // title -> play -> over
      seed: seed,
      rng: mulberry32(seed),
      elapsed: 0,
      timeLeft: SERVICE_SECONDS,
      score: 0,
      tips: 0,
      combo: 0,
      bestCombo: 0,
      servedCount: 0,
      lostCount: 0,
      tickets: [],              // live order tickets on the rail
      nextTicketId: 1,
      lastDishId: null,         // for shared-prep ticket generation
      spawnTimer: 0,
      pans: [freshPan(), freshPan(), freshPan()],
      plate: [],                // prepared component ids on the plating plate
      plateWorst: 'perfect',    // weakest grilled quality plated so far
      passDish: null,           // { dishId, quality, slide } finished dish at the pass
      prepTray: [],             // finished prep portions waiting on the chop board
      chef: {
        x: 570, targetX: 570, facing: 1, walkPhase: 0, moving: false,
        hands: [],              // carried items, max 2, drawn overhead
        action: null,           // { type:'chop', t, dur } while busy
        pending: null           // queued mouse action, runs on arrival
      },
      popups: [],               // floating score text
      steam: [],                // steam puffs
      sparks: [],               // sizzle / clang particles
      bellFlash: 0,
      shake: 0,
      muted: false
    };
  }

  // The prepared-component id a carried item contributes to a plate.
  function preparedId(item) {
    if (!item) return null;
    if (item.kind === 'plain') return item.ing;
    if (item.kind === 'grilled') return item.ing + '-grilled';
    if (item.kind === 'chopped') return item.ing + '-chopped';
    return null;
  }

  function itemLabel(item) {
    if (!item) return '';
    const names = {
      noodles: 'Noodles', rice: 'Rice', batter: 'Batter',
      pork: 'Pork', egg: 'Egg', shrimp: 'Shrimp',
      onion: 'Spring onion', corn: 'Corn', nori: 'Nori'
    };
    let base = names[item.ing] || item.ing;
    if (item.kind === 'grilled') base += item.quality === 'burnt' ? ' (burnt)' : ' (grilled)';
    if (item.kind === 'chopped') base = 'Chopped ' + base.toLowerCase();
    return base;
  }

  window.UR = window.UR || {};
  window.UR.mulberry32 = mulberry32;
  window.UR.createState = createState;
  window.UR.preparedId = preparedId;
  window.UR.itemLabel = itemLabel;
  window.UR.SERVICE_SECONDS = SERVICE_SECONDS;
  window.UR.DEMO_SEED = DEMO_SEED;
})();
