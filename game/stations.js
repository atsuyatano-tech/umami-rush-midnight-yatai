// stations.js — the five stations along the counter and everything the
// chef can do at each: fridge bins, chop board + prep tray, grill pans,
// plating plate, pass window, and the trash bin.
(function () {
  'use strict';
  const UR = window.UR;

  const STATIONS = [
    { id: 'fridge', name: 'FRIDGE', x: 130 },
    { id: 'chop', name: 'CHOP BOARD', x: 330 },
    { id: 'grill', name: 'GRILL', x: 570 },
    { id: 'plate', name: 'PLATING', x: 850 },
    { id: 'pass', name: 'PASS', x: 1090 }
  ];
  const PAN_X = [478, 570, 662];
  const TRASH_X = 1218;

  function stationAt(x) {
    let best = null, bd = 1e9;
    for (const s of STATIONS) {
      const d = Math.abs(x - s.x);
      if (d < bd) { bd = d; best = s; }
    }
    return bd <= 78 ? best : null;
  }

  function handsFull(state) { return state.chef.hands.length >= 2; }

  function giveItem(state, item) {
    if (handsFull(state)) return false;
    state.chef.hands.push(item);
    return true;
  }

  // --- FRIDGE -------------------------------------------------------------
  function pickIngredient(state, ingId) {
    const g = UR.ingredientById(ingId);
    if (!g) return;
    if (!giveItem(state, { kind: 'plain', ing: ingId })) {
      UR.popup(state, state.chef.x, 560, 'HANDS FULL', '#ffd93d', false);
      return;
    }
    UR.sfx.pickup(state);
  }

  // Space at the fridge grabs the first thing a live ticket still needs.
  function smartPick(state) {
    const held = state.chef.hands.map((h) => UR.preparedId(h));
    for (const t of state.tickets) {
      const dish = UR.dishById(t.dishId);
      for (const c of dish.components) {
        if (held.indexOf(c) >= 0) continue;
        if (state.plate.indexOf(c) >= 0) continue;
        pickIngredient(state, UR.rawOf(c));
        return;
      }
    }
    pickIngredient(state, 'noodles');
  }

  // --- CHOP BOARD -----------------------------------------------------------
  function chopInteract(state) {
    const hands = state.chef.hands;
    const idx = hands.findIndex((h) => h.kind === 'plain' && UR.prepOf(h.ing) === 'chop');
    if (idx >= 0) {
      state.chef.action = { type: 'chop', t: 0, dur: 1.1, idx: idx };
      return;
    }
    const cIdx = hands.findIndex((h) => h.kind === 'chopped');
    if (cIdx >= 0 && state.prepTray.length < 3) {
      state.prepTray.push(hands.splice(cIdx, 1)[0]);
      UR.sfx.plate(state);
      return;
    }
    if (state.prepTray.length && !handsFull(state)) {
      giveItem(state, state.prepTray.pop());
      UR.sfx.pickup(state);
    }
  }

  function finishChop(state) {
    const a = state.chef.action;
    const item = state.chef.hands[a.idx];
    if (item) {
      item.kind = 'chopped';
      UR.popup(state, 330, 470, 'CHOPPED!', '#95d5b2', false);
      UR.sparkBurst(state, 330, 520, '#95d5b2', 6);
    }
    state.chef.action = null;
  }

  // --- GRILL ----------------------------------------------------------------
  function grillInteract(state, panIdx) {
    const hands = state.chef.hands;
    if (panIdx != null && state.pans[panIdx].item) { liftPan(state, panIdx); return; }
    const rawIdx = hands.findIndex((h) => h.kind === 'plain' && UR.prepOf(h.ing) === 'grill');
    if (rawIdx >= 0) {
      const target = (panIdx != null && !state.pans[panIdx].item) ? panIdx : UR.freePan(state);
      if (target < 0) { UR.popup(state, 570, 470, 'PANS FULL', '#ffd93d', false); return; }
      const item = hands.splice(rawIdx, 1)[0];
      state.pans[target] = { item: item, t: 0 };
      UR.sfx.sizzle(state);
      return;
    }
    const u = UR.urgentPan(state);
    if (u >= 0) liftPan(state, u);
  }

  function liftPan(state, panIdx) {
    const pan = state.pans[panIdx];
    if (!pan.item || handsFull(state)) {
      if (pan.item) UR.popup(state, state.chef.x, 560, 'HANDS FULL', '#ffd93d', false);
      return;
    }
    const quality = UR.qualityAt(pan.t);
    giveItem(state, { kind: 'grilled', ing: pan.item.ing, quality: quality });
    state.pans[panIdx] = { item: null, t: 0 };
    if (quality === 'perfect') {
      UR.popup(state, UR.PAN_X[panIdx], 460, 'PERFECT!', '#ffd93d', false);
      UR.sparkBurst(state, UR.PAN_X[panIdx], 510, '#ffd93d', 8);
    }
    UR.sfx.pickup(state);
  }

  // --- PLATING --------------------------------------------------------------
  // A plate is complete when its multiset of components equals a ticket's.
  function plateMatch(state) {
    for (const t of state.tickets) {
      const dish = UR.dishById(t.dishId);
      if (dish.components.length !== state.plate.length) continue;
      const want = dish.components.slice().sort();
      const have = state.plate.slice().sort();
      if (want.every((c, i) => c === have[i])) return dish;
    }
    return null;
  }

  const QUALITY_RANK = { perfect: 3, good: 2, over: 1, under: 1, burnt: 0 };

  function plateInteract(state) {
    const hands = state.chef.hands;
    if (hands.length) {
      const item = hands[hands.length - 1];
      if (item.kind === 'grilled' && item.quality === 'burnt') {
        UR.popup(state, 850, 470, 'BURNT — TRASH IT (T)', '#ff6b6b', false);
        return;
      }
      const pid = UR.preparedId(item);
      if (pid && state.plate.length < 4) {
        hands.pop();
        state.plate.push(pid);
        if (item.kind === 'grilled' &&
            QUALITY_RANK[item.quality] < QUALITY_RANK[state.plateWorst]) {
          state.plateWorst = item.quality;
        }
        UR.sfx.plate(state);
        UR.steamPuff(state, 850, 520, 1);
        const dish = plateMatch(state);
        if (dish) finishDish(state, dish);
        return;
      }
    }
    if (state.plate.length) {
      // take the last component back
      const pid = state.plate.pop();
      const raw = UR.rawOf(pid);
      const kind = pid.endsWith('-grilled') ? 'grilled' : pid.endsWith('-chopped') ? 'chopped' : 'plain';
      const item = { kind: kind, ing: raw };
      if (kind === 'grilled') item.quality = 'good';
      giveItem(state, item);
      if (!state.plate.length) state.plateWorst = 'perfect';
    }
  }

  function finishDish(state, dish) {
    // The finished dish inherits the weakest grilled quality on the plate:
    // lift everything in the gold zone and the dish serves as PERFECT.
    const quality = state.plateWorst;
    state.plate = [];
    state.plateWorst = 'perfect';
    state.passDish = { dishId: dish.id, quality: quality, slide: 0 };
    UR.popup(state, 960, 470, dish.name + ' READY!', '#ffd93d', true);
    UR.sfx.bell(state);
    state.bellFlash = 0.5;
  }

  // --- PASS -----------------------------------------------------------------
  function passInteract(state) {
    const pd = state.passDish;
    if (!pd) return;
    const ticket = UR.findTicket(state, pd.dishId);
    if (!ticket) { trashPassDish(state); return; }
    const dish = UR.dishById(pd.dishId);
    const frac = Math.max(0, ticket.patience / ticket.patienceMax);
    const reward = UR.applyServe(state, dish, pd.quality, frac);
    state.tickets = state.tickets.filter((t) => t.id !== ticket.id);
    state.passDish = null;
    const tag = pd.quality === 'perfect' ? '+PERFECT! +' : '+SERVED +';
    UR.popup(state, 1090, 430, tag + reward.total, '#ffd93d', true);
    UR.popup(state, 1090, 480, 'COMBO x' + Math.max(1, state.combo), '#ff9f43', false);
    UR.sparkBurst(state, 1090, 520, '#ffd93d', 10);
    UR.sfx.coin(state); UR.sfx.bell(state);
    state.bellFlash = 0.5;
  }

  function trashPassDish(state) {
    state.passDish = null;
    UR.breakCombo(state);
    UR.popup(state, 1090, 470, 'NO TICKET — TRASHED', '#ff6b6b', false);
  }

  // --- TRASH ------------------------------------------------------------------
  function trashHand(state) {
    const hands = state.chef.hands;
    if (!hands.length) return;
    const item = hands.pop();
    if (item.kind === 'grilled' && item.quality === 'burnt') {
      UR.breakCombo(state);
      UR.popup(state, state.chef.x, 560, 'BURNT TRASHED — COMBO LOST', '#ff6b6b', false);
    } else {
      UR.popup(state, state.chef.x, 560, 'TRASHED', '#adb5bd', false);
    }
    UR.sfx.buzz(state);
  }

  // The context action for the station the chef is standing at.
  function interact(state) {
    if (state.chef.action) return;
    const st = stationAt(state.chef.x);
    if (!st) return;
    if (st.id === 'fridge') smartPick(state);
    else if (st.id === 'chop') chopInteract(state);
    else if (st.id === 'grill') grillInteract(state, null);
    else if (st.id === 'plate') plateInteract(state);
    else if (st.id === 'pass') passInteract(state);
  }

  window.UR = window.UR || {};
  window.UR.STATIONS = STATIONS;
  window.UR.PAN_X = PAN_X;
  window.UR.TRASH_X = TRASH_X;
  window.UR.stationAt = stationAt;
  window.UR.pickIngredient = pickIngredient;
  window.UR.chopInteract = chopInteract;
  window.UR.finishChop = finishChop;
  window.UR.grillInteract = grillInteract;
  window.UR.liftPan = liftPan;
  window.UR.plateInteract = plateInteract;
  window.UR.plateMatch = plateMatch;
  window.UR.passInteract = passInteract;
  window.UR.trashHand = trashHand;
  window.UR.interact = interact;
})();
