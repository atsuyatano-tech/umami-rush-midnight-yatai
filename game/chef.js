// chef.js — the chef: walks the counter in real time, carries at most two
// items overhead, and finishes timed actions like chopping.
(function () {
  'use strict';
  const UR = window.UR;

  const SPEED = 360; // px per second along the counter
  const MIN_X = 70, MAX_X = 1225;

  function sendTo(state, x, pending) {
    state.chef.targetX = Math.max(MIN_X, Math.min(MAX_X, x));
    state.chef.pending = pending || null;
  }

  function updateChef(state, dt) {
    const chef = state.chef;
    if (chef.action) {
      chef.action.t += dt;
      if (chef.action.type === 'chop' && chef.action.t >= chef.action.dur) {
        UR.finishChop(state);
      }
      return; // busy hands: no walking mid-chop
    }
    const dx = chef.targetX - chef.x;
    if (Math.abs(dx) > 3) {
      const step = Math.sign(dx) * Math.min(Math.abs(dx), SPEED * dt);
      chef.x += step;
      chef.facing = dx > 0 ? 1 : -1;
      chef.walkPhase += dt * 11;
      chef.moving = true;
    } else {
      chef.moving = false;
      if (chef.pending) {
        const p = chef.pending;
        chef.pending = null;
        p();
      }
    }
  }

  window.UR = window.UR || {};
  window.UR.sendChefTo = sendTo;
  window.UR.updateChef = updateChef;
  window.UR.CHEF_MIN_X = MIN_X;
  window.UR.CHEF_MAX_X = MAX_X;
})();
