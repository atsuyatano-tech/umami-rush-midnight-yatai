// boot.js — wires everything together: the fixed-timestep loop, the
// service lifecycle (title -> play -> over), and a pose hook that stages
// exact game states for screenshots (?pose=hero|calm|juggle|results).
(function () {
  'use strict';
  const UR = window.UR;

  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const state = UR.createState(UR.DEMO_SEED);
  UR.state = state;

  function resetInto(seed) {
    const fresh = UR.createState(seed);
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, fresh);
  }

  UR.startService = function (s) {
    const muted = s.muted;
    resetInto(UR.DEMO_SEED);
    state.muted = muted;
    state.mode = 'play';
    UR.spawnTicket(state);
    UR.spawnTicket(state);
    state.spawnTimer = 6;
    UR.sfx.bell(state);
  };

  UR.restartService = UR.startService;

  let lastChopTick = -1;

  function step(dt) {
    if (state.mode !== 'play' || state.frozen) return;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, UR.SERVICE_SECONDS - state.elapsed);
    if (state.timeLeft <= 0) {
      state.mode = 'over';
      UR.sfx.bell(state);
      return;
    }
    UR.pollKeys(state, dt);
    UR.updateChef(state, dt);
    if (state.chef.action && state.chef.action.type === 'chop') {
      const tick = (state.chef.action.t * 7) | 0;
      if (tick !== lastChopTick) { lastChopTick = tick; UR.sfx.chop(state); }
    }
    UR.updateTickets(state, dt);
    UR.updatePans(state, dt);
    if (state.passDish && state.passDish.slide < 1) {
      state.passDish.slide = Math.min(1, state.passDish.slide + dt * 1.3);
      if (((state.elapsed * 5) | 0) % 2 === 0) UR.steamPuff(state, 1000, 500, 1);
    }
    UR.updateEffects(state, dt);
  }

  function render(now) {
    ctx.save();
    if (state.shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    UR.drawStall(ctx, state, now);
    UR.drawHudAll(ctx, state, now);
    ctx.restore();
  }

  // --- pose hook: exact states, rendered by the game's own renderer -------
  function ticket(dishId, frac) {
    return { id: state.nextTicketId++, dishId: dishId, patience: 60 * frac, patienceMax: 60, slide: 1 };
  }
  function puff(x, y, n) { for (let i = 0; i < n; i++) UR.steamPuff(state, x, y, 1); }

  function pose(name) {
    resetInto(UR.DEMO_SEED);
    state.mode = 'play';
    state.frozen = true;
    if (name === 'hero') {
      // RUSH: every station alive, the full doneness gradient in one frame.
      // Tickets 1+2 share a prep step; ticket 3 shares nothing (no stamp)
      // and is nearly out of patience, so its customer is impatient.
      state.elapsed = 126; state.timeLeft = 24;
      state.score = 860; state.tips = 130; state.combo = 4; state.bestCombo = 6; state.servedCount = 7;
      state.tickets = [ticket('miso-ramen', 0.9), ticket('shrimp-rice', 0.55), ticket('egg-oko', 0.18)];
      state.pans[0] = { item: { kind: 'plain', ing: 'pork' }, t: 8.2 };   // PERFECT, golden
      state.pans[1] = { item: { kind: 'plain', ing: 'shrimp' }, t: 1.0 }; // pale raw, just placed
      state.pans[2] = { item: { kind: 'plain', ing: 'egg' }, t: 14.6 };   // fully BURNT, thick smoke
      state.plate = ['noodles', 'pork-grilled'];
      state.prepTray = [{ kind: 'chopped', ing: 'onion' }, { kind: 'grilled', ing: 'egg', quality: 'perfect' }];
      state.passDish = { dishId: 'miso-ramen', quality: 'perfect', slide: 1 };
      // the chef tends pan 1 at the GRILL, clear of the plating bowl so
      // the mid-assembly bowl stays fully visible
      state.chef.x = 478; state.chef.targetX = 478; state.chef.facing = 1;
      state.chef.moving = false; state.chef.walkPhase = 0;
      state.chef.hands = [];
      puff(1090, 500, 3); puff(478, 505, 2);
    } else if (name === 'results') {
      // End of service: the timer has expired in normal play (mode 'over')
      // with a strong night behind it — 12 served, three stars.
      state.mode = 'over';
      state.elapsed = 150; state.timeLeft = 0;
      state.score = 1420; state.tips = 260; state.combo = 8; state.bestCombo = 8;
      state.servedCount = 12; state.lostCount = 1;
      state.tickets = [ticket('egg-ramen', 0.6)];
      state.pans[0] = { item: { kind: 'plain', ing: 'pork' }, t: 8.2 };
      state.passDish = { dishId: 'miso-ramen', quality: 'perfect', slide: 1 };
      state.chef.x = 1000; state.chef.targetX = 1000; state.chef.facing = 1;
      puff(1090, 500, 3);
    } else if (name === 'calm' || name === 'planning') {
      // Early calm service: one ticket, chef mid-chop, one raw pan, full timer
      state.elapsed = 8; state.timeLeft = 142;
      state.score = 40; state.tips = 0; state.combo = 0; state.servedCount = 0;
      state.tickets = [ticket('miso-ramen', 0.92)];
      state.pans[0] = { item: { kind: 'plain', ing: 'pork' }, t: 1.1 };
      state.prepTray = [{ kind: 'chopped', ing: 'onion' }];
      state.chef.x = 330; state.chef.targetX = 330;
      state.chef.hands = [{ kind: 'plain', ing: 'onion' }];
      state.chef.action = { type: 'chop', t: 0.55, dur: 1.1, idx: 0 };
      puff(478, 505, 1);
    } else if (name === 'juggle') {
      // Three-pan juggle: raw / PERFECT / burnt with smoke, patience in red
      state.elapsed = 82; state.timeLeft = 68;
      state.score = 540; state.tips = 70; state.combo = 3; state.servedCount = 4;
      state.tickets = [ticket('shrimp-oko', 0.7), ticket('egg-ramen', 0.14)];
      state.pans[0] = { item: { kind: 'plain', ing: 'shrimp' }, t: 1.2 };
      state.pans[1] = { item: { kind: 'plain', ing: 'pork' }, t: 8.4 };
      state.pans[2] = { item: { kind: 'plain', ing: 'egg' }, t: 14.2 };
      state.chef.x = 752; state.chef.targetX = 662; state.chef.facing = -1; state.chef.moving = true;
      state.chef.walkPhase = 0.7;
      puff(662, 500, 3);
    } else if (name === 'serve') {
      // The serve moment: popup, combo x7, a customer receiving the bowl
      state.elapsed = 93; state.timeLeft = 57;
      state.score = 1240; state.tips = 210; state.combo = 7; state.bestCombo = 7; state.servedCount = 11;
      const arriving = ticket('egg-ramen', 0.95); arriving.slide = 0.94;
      state.tickets = [ticket('corn-oko', 0.8), arriving];
      state.passDish = { dishId: 'miso-ramen', quality: 'perfect', slide: 1 };
      state.chef.x = 985; state.chef.targetX = 1090; state.chef.facing = 1; state.chef.moving = true;
      state.chef.walkPhase = 2.1;
      state.popups.push({ x: 1090, y: 428, text: '+PERFECT! +145', color: '#ffd93d', t: 0, life: 999, big: true });
      state.popups.push({ x: 1090, y: 655, text: 'COMBO x7', color: '#ff9f43', t: 0, life: 999, big: false });
      state.bellFlash = 0.4;
      puff(1000, 500, 2);
    }
  }

  const poseName = new URLSearchParams(window.location.search).get('pose');
  if (poseName) pose(poseName);

  UR.bindInput(state, canvas);

  let acc = 0, last = performance.now();
  function frame(nowMs) {
    const now = nowMs / 1000;
    acc += Math.min(0.25, (nowMs - last) / 1000);
    last = nowMs;
    const dt = 1 / 60;
    while (acc >= dt) { step(dt); acc -= dt; }
    render(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
