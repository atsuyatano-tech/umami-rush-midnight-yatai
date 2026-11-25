// scoring.js — coins, tips, combo multiplier and the star thresholds that
// grade a finished service.
(function () {
  'use strict';

  const STAR_THRESHOLDS = [450, 850, 1300];
  const QUALITY_FACTOR = { perfect: 1, good: 0.75, under: 0.5, over: 0.55, burnt: 0 };

  // Score a served dish. patienceFrac is the ticket's remaining patience.
  function serveReward(state, dish, quality, patienceFrac) {
    const qf = QUALITY_FACTOR[quality] != null ? QUALITY_FACTOR[quality] : 0.75;
    const base = Math.round(dish.price * qf);
    const tip = Math.round(40 * patienceFrac * qf);
    const comboMult = 1 + Math.min(state.combo, 10) * 0.1;
    const total = Math.round((base + tip) * comboMult);
    return { base: base, tip: tip, total: total };
  }

  function applyServe(state, dish, quality, patienceFrac) {
    const r = serveReward(state, dish, quality, patienceFrac);
    state.score += r.total;
    state.tips += r.tip;
    if (quality === 'perfect' || quality === 'good') {
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
    } else {
      state.combo = 0;
    }
    state.servedCount += 1;
    return r;
  }

  function breakCombo(state) {
    state.combo = 0;
  }

  function starsFor(score) {
    let n = 0;
    for (const t of STAR_THRESHOLDS) if (score >= t) n += 1;
    return n;
  }

  function nextStarAt(score) {
    for (const t of STAR_THRESHOLDS) if (score < t) return t;
    return null;
  }

  window.UR = window.UR || {};
  window.UR.STAR_THRESHOLDS = STAR_THRESHOLDS;
  window.UR.QUALITY_FACTOR = QUALITY_FACTOR;
  window.UR.serveReward = serveReward;
  window.UR.applyServe = applyServe;
  window.UR.breakCombo = breakCombo;
  window.UR.starsFor = starsFor;
  window.UR.nextStarAt = nextStarAt;
})();
