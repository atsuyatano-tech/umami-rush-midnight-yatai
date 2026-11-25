// difficulty.js — how one 150-second service ramps: more simultaneous
// tickets, shorter patience, tighter spawns, and a RUSH in the last 30 s.
(function () {
  'use strict';

  function phaseAt(elapsed) {
    if (elapsed < 50) return 0;   // warm-up: learn the counter
    if (elapsed < 100) return 1;  // dinner builds
    return 2;                     // full house, then the rush
  }

  function maxTickets(elapsed) {
    return [2, 3, 4][phaseAt(elapsed)];
  }

  function patienceScale(elapsed) {
    return [1.0, 0.85, 0.7][phaseAt(elapsed)];
  }

  function spawnInterval(elapsed) {
    return [9.5, 7.5, 5.5][phaseAt(elapsed)];
  }

  function basePatience(rng, elapsed) {
    return (52 + rng() * 18) * patienceScale(elapsed);
  }

  function isRush(state) {
    return state.mode === 'play' && state.timeLeft <= 30 && state.timeLeft > 0;
  }

  window.UR = window.UR || {};
  window.UR.phaseAt = phaseAt;
  window.UR.maxTickets = maxTickets;
  window.UR.patienceScale = patienceScale;
  window.UR.spawnInterval = spawnInterval;
  window.UR.basePatience = basePatience;
  window.UR.isRush = isRush;
})();
