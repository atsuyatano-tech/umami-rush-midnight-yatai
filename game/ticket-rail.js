// ticket-rail.js — order tickets: seeded generation (consecutive tickets
// deliberately share a prep step), patience drain and expiry.
(function () {
  'use strict';
  const UR = window.UR;

  // Pick the next dish. 65% of the time it shares a component with the
  // previous ticket, so one chop or one pan can serve two orders.
  function pickDish(state) {
    const dishes = UR.DISHES;
    const prev = state.lastDishId ? UR.dishById(state.lastDishId) : null;
    if (prev && state.rng() < 0.65) {
      const sharing = dishes.filter((d) => d.id !== prev.id && UR.sharesComponent(d, prev));
      if (sharing.length) return sharing[(state.rng() * sharing.length) | 0];
    }
    return dishes[(state.rng() * dishes.length) | 0];
  }

  function spawnTicket(state) {
    const dish = pickDish(state);
    const patience = UR.basePatience(state.rng, state.elapsed);
    state.tickets.push({
      id: state.nextTicketId++,
      dishId: dish.id,
      patience: patience,
      patienceMax: patience,
      slide: 0 // slide-in animation 0..1
    });
    state.lastDishId = dish.id;
  }

  function updateTickets(state, dt) {
    if (state.tickets.length < UR.maxTickets(state.elapsed)) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnTicket(state);
        state.spawnTimer = UR.spawnInterval(state.elapsed);
      }
    }
    for (const t of state.tickets) {
      t.patience -= dt;
      if (t.slide < 1) t.slide = Math.min(1, t.slide + dt * 2.4);
    }
    const expired = state.tickets.filter((t) => t.patience <= 0);
    for (const t of expired) {
      UR.breakCombo(state);
      state.lostCount += 1;
      UR.popup(state, 640, 250, 'TOO LATE! COMBO LOST', '#ff6b6b', true);
      UR.sfx.buzz(state);
    }
    if (expired.length) state.tickets = state.tickets.filter((t) => t.patience > 0);
  }

  function findTicket(state, dishId) {
    for (const t of state.tickets) if (t.dishId === dishId) return t;
    return null;
  }

  // Components wanted by two or more live tickets: the shared prep steps.
  function sharedComponents(state) {
    const counts = {};
    for (const t of state.tickets) {
      const dish = UR.dishById(t.dishId);
      for (const c of dish.components) counts[c] = (counts[c] || 0) + 1;
    }
    return Object.keys(counts).filter((c) => counts[c] >= 2);
  }

  window.UR = window.UR || {};
  window.UR.spawnTicket = spawnTicket;
  window.UR.updateTickets = updateTickets;
  window.UR.findTicket = findTicket;
  window.UR.sharedComponents = sharedComponents;
})();
