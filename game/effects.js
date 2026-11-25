// effects.js — floating popups, steam puffs and sizzle sparks. Purely visual
// feedback; updated on the same fixed timestep as the game.
(function () {
  'use strict';

  function popup(state, x, y, text, color, big) {
    state.popups.push({ x: x, y: y, text: text, color: color || '#ffe066', t: 0, life: big ? 1.6 : 1.1, big: !!big });
  }

  function steamPuff(state, x, y, n) {
    for (let i = 0; i < (n || 1); i++) {
      state.steam.push({
        x: x + (state.rng() - 0.5) * 22, y: y,
        vx: (state.rng() - 0.5) * 8, vy: -26 - state.rng() * 18,
        r: 6 + state.rng() * 7, t: 0, life: 1.1 + state.rng() * 0.5
      });
    }
  }

  function sparkBurst(state, x, y, color, n) {
    for (let i = 0; i < (n || 6); i++) {
      const a = state.rng() * Math.PI * 2, sp = 30 + state.rng() * 60;
      state.sparks.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
        color: color, t: 0, life: 0.45
      });
    }
  }

  function updateEffects(state, dt) {
    for (const p of state.popups) { p.t += dt; p.y -= 34 * dt; }
    state.popups = state.popups.filter((p) => p.t < p.life);
    for (const s of state.steam) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += 9 * dt; }
    state.steam = state.steam.filter((s) => s.t < s.life);
    for (const s of state.sparks) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 190 * dt; }
    state.sparks = state.sparks.filter((s) => s.t < s.life);
    if (state.bellFlash > 0) state.bellFlash -= dt;
    if (state.shake > 0) state.shake -= dt;
  }

  window.UR = window.UR || {};
  window.UR.popup = popup;
  window.UR.steamPuff = steamPuff;
  window.UR.sparkBurst = sparkBurst;
  window.UR.updateEffects = updateEffects;
})();
