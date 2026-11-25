// render-stall.js — the midnight yatai itself: lanterns, neon sign, the
// counter and its five stations, the pans with their doneness rings, the
// plating plate with ghost slots, the pass window, and the chef.
(function () {
  'use strict';
  const UR = window.UR;
  const INK = '#171126';

  function text(g, str, x, y, size, color, align, bold) {
    g.fillStyle = color;
    g.font = (bold ? 'bold ' : '') + size + 'px "Trebuchet MS", sans-serif';
    g.textAlign = align || 'center';
    g.textBaseline = 'middle';
    g.fillText(str, x, y);
  }

  function drawBackground(g, state, now) {
    g.fillStyle = '#241c3f';
    g.fillRect(0, 0, 1280, 800);
    // distant rooftops
    g.fillStyle = '#1a1430';
    g.fillRect(0, 150, 1280, 130);
    g.fillStyle = '#2e2450';
    for (let i = 0; i < 9; i++) g.fillRect(30 + i * 145, 168 - (i % 3) * 16, 92, 60);
    g.fillStyle = '#ffd93d';
    for (let i = 0; i < 9; i++) if (i % 2 === 0) g.fillRect(58 + i * 145, 190, 14, 18);
    // stall roof + noren curtain band
    g.fillStyle = '#7f1d2d';
    g.fillRect(0, 0, 1280, 84);
    g.fillStyle = '#5c1420';
    for (let x = 0; x < 1280; x += 80) g.fillRect(x, 64, 40, 20);
    // neon sign
    const flicker = (Math.sin(now * 9) > -0.92) ? 1 : 0.35;
    g.save();
    g.globalAlpha = flicker;
    UR.rrect(g, 415, 10, 450, 62, 12, '#ff2e88');
    text(g, 'UMAMI RUSH', 640, 34, 34, '#ffffff', 'center', true);
    text(g, 'MIDNIGHT YATAI 屋台', 640, 60, 15, '#ffe3f1', 'center', true);
    g.restore();
    // paper lanterns on strings, hanging below the ticket rail
    for (let i = 0; i < 5; i++) {
      const lx = 70 + i * 175, ly = 330 + Math.sin(now * 1.6 + i) * 4;
      g.strokeStyle = '#0f0b1e'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(lx, 84); g.lineTo(lx, ly - 22); g.stroke();
      g.beginPath(); g.ellipse(lx, ly, 25, 30, 0, 0, Math.PI * 2);
      g.fillStyle = i % 2 ? '#ff9f43' : '#ff6b6b'; g.fill();
      g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
      g.fillStyle = '#fff3bf';
      g.beginPath(); g.ellipse(lx, ly, 13, 19, 0, 0, Math.PI * 2); g.fill();
    }
    // floor planks
    g.fillStyle = '#171126';
    g.fillRect(0, 648, 1280, 152);
    g.strokeStyle = '#241c3f'; g.lineWidth = 3;
    for (let x = 0; x <= 1280; x += 106) { g.beginPath(); g.moveTo(x, 648); g.lineTo(x, 800); g.stroke(); }
  }

  function drawCounter(g, state, now) {
    // counter body and top
    UR.rrect(g, 8, 468, 1264, 176, 8, '#8a5a33');
    g.fillStyle = '#a9713f'; g.fillRect(8, 468, 1264, 26);
    g.fillStyle = '#6f4525'; g.fillRect(8, 610, 1264, 34);
    // station name plates
    for (const st of UR.STATIONS) {
      UR.rrect(g, st.x - 62, 440, 124, 26, 6, '#ffd93d');
      text(g, st.name, st.x, 454, 14, INK, 'center', true);
    }
    const here = UR.stationAt(state.chef.x);
    if (here && state.mode === 'play') {
      g.strokeStyle = '#ffffff'; g.lineWidth = 3;
      g.strokeRect(here.x - 66, 436, 132, 34);
    }
  }

  function drawFridge(g, state) {
    // open ingredient crates on the counter, 3 x 3, keys 1..9
    UR.INGREDIENTS.forEach((ing, i) => {
      const col = i % 3, row = (i / 3) | 0;
      const x = 38 + col * 66, y = 500 + row * 38;
      UR.rrect(g, x, y, 62, 34, 5, '#3d5a80');
      UR.drawItemIcon(g, ing.id, x + 20, y + 17, 12);
      text(g, String(i + 1), x + 50, y + 17, 13, '#ffffff', 'center', true);
    });
    text(g, 'INGREDIENTS', 130, 628, 13, '#ffe8cc', 'center', true);
  }

  function drawChopBoard(g, state, now) {
    UR.rrect(g, 262, 516, 136, 52, 8, '#e9d8a6');
    // knife, mid-chop when the chef is chopping
    const chopDip = state.chef.action && state.chef.action.type === 'chop'
      ? Math.abs(Math.sin(now * 16)) * 12 : 0;
    g.save();
    g.translate(352, 512 - chopDip); g.rotate(-0.5);
    UR.rrect(g, -6, -26, 12, 30, 4, '#495057');
    g.beginPath(); g.moveTo(-14, 2); g.lineTo(20, 2); g.lineTo(8, 18); g.lineTo(-14, 14);
    g.closePath(); g.fillStyle = '#ced4da'; g.fill();
    g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.restore();
    if (state.chef.action && state.chef.action.type === 'chop') {
      const a = state.chef.action;
      UR.drawItemIcon(g, 'onion', 300, 540, 17);
      UR.rrect(g, 268, 574, 124, 12, 6, '#343a40');
      g.fillStyle = '#51cf66';
      g.fillRect(270, 576, 120 * (a.t / a.dur), 8);
    }
    // prep tray with finished portions, on the counter front below the board
    UR.rrect(g, 292, 578, 120, 54, 6, '#748cab');
    text(g, 'PREP TRAY', 352, 591, 11, '#ffffff', 'center', true);
    state.prepTray.forEach((item, i) => {
      UR.drawItemIcon(g, UR.preparedId(item), 322 + i * 30, 613, 12);
    });
  }

  function drawGrill(g, state, now) {
    UR.rrect(g, 414, 492, 312, 92, 10, '#343a40');
    g.fillStyle = '#495057'; g.fillRect(426, 504, 288, 68);
    const stageColor = { raw: '#adb5bd', cooking: '#ffa94d', perfect: '#ffd93d', overdone: '#e8590c', burnt: '#212529' };
    state.pans.forEach((pan, i) => {
      const x = UR.PAN_X[i], y = 538;
      UR.circle(g, x, y, 42, '#212529');
      g.fillStyle = '#5c636a';
      g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.fill();
      if (!pan.item) {
        text(g, 'PAN ' + (i + 1), x, y, 12, '#adb5bd', 'center', true);
        return;
      }
      const stage = UR.stageAt(pan.t);
      if (stage === 'perfect') {
        g.save();
        g.globalAlpha = 0.55 + 0.3 * Math.sin(now * 8);
        UR.circle(g, x, y, 40, '#ffd93d');
        g.restore();
      }
      if (stage === 'burnt') {
        UR.drawItemIcon(g, pan.item.ing, x, y, 20);
        g.fillStyle = 'rgba(10,10,10,0.72)';
        g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill();
        text(g, 'BURNT', x, y, 11, '#ff8787', 'center', true);
      } else {
        UR.drawItemIcon(g, pan.item.ing + '-grilled', x, y, 20);
      }
      // doneness ring: grey -> orange -> GOLD zone -> red
      g.beginPath();
      g.arc(x, y, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * UR.donenessFrac(pan.t));
      g.strokeStyle = stageColor[stage]; g.lineWidth = stage === 'perfect' ? 8 : 5; g.stroke();
      // gold zone marker on the ring
      g.beginPath();
      g.arc(x, y, 46, -Math.PI / 2 + Math.PI * 2 * (UR.PERFECT_START / UR.OVER_END),
        -Math.PI / 2 + Math.PI * 2 * (UR.PERFECT_END / UR.OVER_END));
      g.strokeStyle = '#ffd93d'; g.lineWidth = 3; g.stroke();
      text(g, stage.toUpperCase(), x, y + 58, 12, stageColor[stage], 'center', true);
    });
  }

  // The dish the plate is heading for: most shared components wins, and
  // among equals the biggest order (so ghosts show the full build).
  function plateTarget(state) {
    let best = null, bestScore = -1;
    for (const t of state.tickets) {
      const dish = UR.dishById(t.dishId);
      let overlap = 0;
      for (const c of state.plate) if (dish.components.indexOf(c) >= 0) overlap += 1;
      const s = overlap * 10 + dish.components.length;
      if (s > bestScore) { bestScore = s; best = dish; }
    }
    return best;
  }

  function drawPlating(g, state) {
    UR.circle(g, 850, 540, 56, '#f1fa8c');
    UR.circle(g, 850, 540, 45, '#f8f9fa');
    const target = plateTarget(state);
    if (target) {
      // ghost outlines of what is still missing, in ticket order
      const missing = target.components.filter((c) => state.plate.indexOf(c) < 0);
      missing.forEach((c, i) => {
        const gx = 782 + i * 46, gy = 452 + 0; // above the plate on the shelf
        g.save();
        g.globalAlpha = 0.4;
        UR.drawItemIcon(g, c, gx + 46, 610, 15);
        g.restore();
        g.setLineDash([4, 4]);
        g.strokeStyle = '#ffd93d'; g.lineWidth = 2;
        g.beginPath(); g.arc(gx + 46, 610, 21, 0, Math.PI * 2); g.stroke();
        g.setLineDash([]);
      });
      text(g, target.name, 850, 664, 13, '#ffe8cc', 'center', true);
    }
    state.plate.forEach((c, i) => {
      const off = (i - (state.plate.length - 1) / 2) * 34;
      UR.drawItemIcon(g, c, 850 + off, 532, 17);
    });
    if (!state.plate.length && !target) text(g, 'PLATE', 850, 540, 13, '#868e96', 'center', true);
  }

  function drawPass(g, state, now) {
    // serving window in the back wall with waiting customers
    UR.rrect(g, 978, 268, 250, 168, 10, '#0f0b1e');
    UR.rrect(g, 978, 268, 250, 34, 10, '#7f1d2d');
    text(g, 'PASS — SERVE HERE', 1103, 286, 14, '#ffffff', 'center', true);
    state.tickets.forEach((t, i) => {
      const cx = 1024 + i * 56, cy = 372;
      g.fillStyle = '#4a3f78';
      g.beginPath(); g.arc(cx, cy - 18, 17, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx, cy + 34, 26, Math.PI, 0); g.fill();
      g.fillStyle = '#ffd93d';
      g.beginPath(); g.arc(cx - 6, cy - 20, 2.6, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx + 6, cy - 20, 2.6, 0, Math.PI * 2); g.fill();
    });
    if (!state.tickets.length) text(g, 'no orders… yet', 1103, 380, 14, '#868e96', 'center', true);
    // trash bin
    UR.rrect(g, 1188, 566, 58, 76, 6, '#495057');
    UR.rrect(g, 1182, 556, 70, 14, 6, '#343a40');
    text(g, 'TRASH', 1217, 606, 11, '#ced4da', 'center', true);
    text(g, 'T', 1217, 624, 11, '#ced4da', 'center', true);
  }

  // The finished dish on the counter at the pass, drawn after the counter
  // so the counter never paints over it.
  function drawPassDish(g, state) {
    if (!state.passDish) return;
    const pd = state.passDish;
    const x = 850 + (1090 - 850) * Math.min(1, pd.slide);
    UR.drawDish(g, pd.dishId, x, 520, 34);
    if (pd.slide >= 1) {
      // READY flag
      g.strokeStyle = INK; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + 30, 500); g.lineTo(x + 30, 462); g.stroke();
      g.fillStyle = '#51cf66';
      g.beginPath(); g.moveTo(x + 30, 462); g.lineTo(x + 62, 470); g.lineTo(x + 30, 480); g.closePath(); g.fill();
      g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      text(g, 'READY!', x + 2, 622, 17, '#51cf66', 'center', true);
    }
  }

  function drawSteam(g, state) {
    for (const s of state.steam) {
      g.save();
      g.globalAlpha = 0.35 * (1 - s.t / s.life);
      g.fillStyle = '#f8f9fa';
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    for (const s of state.sparks) {
      g.fillStyle = s.color;
      g.fillRect(s.x - 3, s.y - 3, 6, 6);
    }
  }

  function drawChef(g, state, now) {
    const chef = state.chef;
    const x = chef.x, feet = 716;
    const stride = chef.moving ? Math.sin(chef.walkPhase) * 13 : 0;
    // legs
    g.strokeStyle = INK; g.lineWidth = 11; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 8, 668); g.lineTo(x - 10 + stride, feet); g.stroke();
    g.beginPath(); g.moveTo(x + 8, 668); g.lineTo(x + 10 - stride, feet); g.stroke();
    // body: white apron over indigo
    UR.rrect(g, x - 27, 596, 54, 76, 12, '#3d5a80');
    UR.rrect(g, x - 19, 606, 38, 60, 8, '#f8f9fa');
    // head + hachimaki headband
    UR.circle(g, x, 566, 25, '#ffcf9e');
    UR.rrect(g, x - 26, 544, 52, 13, 5, '#e63946');
    g.fillStyle = '#171126';
    g.beginPath(); g.arc(x - 8 * chef.facing, 566, 3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + 8 * chef.facing, 566, 3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 3;
    g.beginPath(); g.arc(x, 574, 8, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    // arms raised, carrying items overhead
    g.strokeStyle = '#ffcf9e'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(x - 22, 610); g.lineTo(x - 16, 540); g.stroke();
    g.beginPath(); g.moveTo(x + 22, 610); g.lineTo(x + 16, 540); g.stroke();
    chef.hands.forEach((item, i) => {
      const ix = x + (i - (chef.hands.length - 1) / 2) * 40;
      if (item.kind === 'grilled' && item.quality === 'burnt') {
        UR.drawItemIcon(g, item.ing, ix, 516, 17);
        g.fillStyle = 'rgba(10,10,10,0.7)';
        g.beginPath(); g.arc(ix, 516, 20, 0, Math.PI * 2); g.fill();
      } else {
        UR.drawItemIcon(g, UR.preparedId(item), ix, 516, 17);
      }
    });
    if (chef.action && chef.action.type === 'chop') {
      text(g, 'CHOP!', x, 486, 15, '#95d5b2', 'center', true);
    }
  }

  function drawStall(g, state, now) {
    drawBackground(g, state, now);
    drawPass(g, state, now);
    drawCounter(g, state, now);
    drawFridge(g, state);
    drawChopBoard(g, state, now);
    drawGrill(g, state, now);
    drawPlating(g, state);
    drawPassDish(g, state);
    drawChef(g, state, now);
    drawSteam(g, state);
  }

  window.UR = window.UR || {};
  window.UR.drawStall = drawStall;
  window.UR.plateTarget = plateTarget;
  window.UR.stallText = text;
})();
