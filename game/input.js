// input.js — mouse and keyboard. Click a station, bin, pan or the pass and
// the chef walks there and acts; keys move and act in place.
(function () {
  'use strict';
  const UR = window.UR;

  function bindInput(state, canvas) {
    const keys = {};

    window.addEventListener('keydown', (e) => {
      if (state.mode === 'title' && (e.key === ' ' || e.key === 'Enter')) { UR.startService(state); return; }
      if (state.mode === 'over' && (e.key === ' ' || e.key === 'Enter')) { UR.restartService(state); return; }
      if (state.mode !== 'play') return;
      keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key.toLowerCase() === 'e') { UR.interact(state); e.preventDefault(); }
      if (e.key.toLowerCase() === 't') UR.trashHand(state);
      if (e.key.toLowerCase() === 'm') state.muted = !state.muted;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= UR.INGREDIENTS.length) {
        const ing = UR.INGREDIENTS[n - 1].id;
        UR.sendChefTo(state, UR.STATIONS[0].x, () => UR.pickIngredient(state, ing));
      }
    });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

    // Held movement keys nudge the target every frame from boot's loop.
    state.keys = keys;

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (state.mode === 'title') { UR.startService(state); return; }
      if (state.mode === 'over') { UR.restartService(state); return; }
      handleClick(state, x, y);
    });
  }

  function handleClick(state, x, y) {
    // Fridge bins (drawn at the fridge, y 494..632, three columns).
    if (x > 30 && x < 238 && y > 492 && y < 634) {
      const col = Math.min(2, ((x - 32) / 68) | 0);
      const row = Math.min(2, ((y - 494) / 46) | 0);
      const ing = UR.INGREDIENTS[row * 3 + col];
      if (ing) UR.sendChefTo(state, UR.STATIONS[0].x, () => UR.pickIngredient(state, ing.id));
      return;
    }
    // Grill pans.
    for (let i = 0; i < 3; i++) {
      if (Math.abs(x - UR.PAN_X[i]) < 48 && y > 480 && y < 580) {
        UR.sendChefTo(state, UR.STATIONS[2].x, () => UR.grillInteract(state, i));
        return;
      }
    }
    // Trash bin.
    if (x > 1180 && y > 560) { UR.sendChefTo(state, UR.TRASH_X - 30, () => UR.trashHand(state)); return; }
    // Stations by counter zone.
    const st = UR.stationAt(x);
    if (st && y > 380) {
      UR.sendChefTo(state, st.x, () => {
        if (st.id === 'fridge') return; // bins handle the fridge
        if (st.id === 'chop') UR.chopInteract(state);
        else if (st.id === 'grill') UR.grillInteract(state, null);
        else if (st.id === 'plate') UR.plateInteract(state);
        else if (st.id === 'pass') UR.passInteract(state);
      });
      return;
    }
    // Anywhere else on the floor: just walk there.
    if (y > 380) UR.sendChefTo(state, x, null);
  }

  // Called each fixed step: held arrow / AD keys override the walk target.
  function pollKeys(state, dt) {
    if (state.mode !== 'play' || state.chef.action) return;
    const k = state.keys || {};
    let dir = 0;
    if (k['arrowleft'] || k['a']) dir -= 1;
    if (k['arrowright'] || k['d']) dir += 1;
    if (dir !== 0) {
      state.chef.pending = null;
      state.chef.targetX = Math.max(UR.CHEF_MIN_X,
        Math.min(UR.CHEF_MAX_X, state.chef.x + dir * 140));
    }
  }

  window.UR = window.UR || {};
  window.UR.bindInput = bindInput;
  window.UR.pollKeys = pollKeys;
  window.UR.handleClick = handleClick;
})();
