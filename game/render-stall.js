// render-stall.js — the midnight yatai itself: lanterns, neon sign, back
// shelf, the counter and its five stations, pans whose food changes with
// doneness, the plating bowl with ghost slots on its rim, the pass window
// with three different customers, street stools in the lantern light, and
// the chef.
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

  // Three visibly different customers: skin, hair and clothes all vary.
  const CUSTOMERS = [
    { skin: '#ffcf9e', hair: '#3a2a1a', hairStyle: 'cap', top: '#e63946', accent: '#ffd93d' },
    { skin: '#c68642', hair: '#101010', hairStyle: 'bun', top: '#4361ee', accent: '#ff9f43' },
    { skin: '#ffe0bd', hair: '#8a5a33', hairStyle: 'spiky', top: '#2a9d8f', accent: '#f4a261' }
  ];

  // The classic anger vein-pop mark, drawn in red at a head's top corner.
  function drawAngerMark(g, x, y, s) {
    g.save();
    g.strokeStyle = '#e63946'; g.lineWidth = 3.5; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * s * 0.3, y + Math.sin(a) * s * 0.3);
      g.quadraticCurveTo(x + Math.cos(a) * s * 0.85, y + Math.sin(a) * s * 0.85,
        x + Math.cos(a + 0.5) * s * 1.05, y + Math.sin(a + 0.5) * s * 1.05);
      g.stroke();
    }
    g.restore();
  }

  // A white speech bubble holding the mini icon of a dish, so an order
  // visibly belongs to the person asking for it.
  function drawOrderBubble(g, dishId, x, y, s) {
    g.save();
    UR.rrect(g, x - s * 1.15, y - s * 0.95, s * 2.3, s * 1.9, 9, '#ffffff');
    g.beginPath();
    g.moveTo(x - s * 0.25, y + s * 0.92); g.lineTo(x + s * 0.3, y + s * 0.92); g.lineTo(x, y + s * 1.45);
    g.closePath(); g.fillStyle = '#ffffff'; g.fill();
    g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    UR.drawDish(g, dishId, x, y + s * 0.05, s * 0.62);
    g.restore();
  }

  function drawCustomer(g, c, x, y, s, happy, angry) {
    // torso
    g.beginPath(); g.arc(x, y + s * 1.15, s * 0.95, Math.PI, 0);
    g.closePath();
    g.fillStyle = c.top; g.fill();
    g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = c.accent;
    g.fillRect(x - s * 0.95, y + s * 0.78, s * 1.9, s * 0.22);
    // head
    UR.circle(g, x, y, s * 0.62, c.skin);
    // hair
    g.fillStyle = c.hair;
    if (c.hairStyle === 'cap') {
      g.beginPath(); g.arc(x, y - s * 0.12, s * 0.64, Math.PI, Math.PI * 2); g.closePath(); g.fill();
      g.fillRect(x - s * 0.85, y - s * 0.16, s * 1.7, s * 0.16);
    } else if (c.hairStyle === 'bun') {
      g.beginPath(); g.arc(x, y - s * 0.18, s * 0.64, Math.PI, Math.PI * 2); g.closePath(); g.fill();
      UR.circle(g, x, y - s * 0.78, s * 0.24, c.hair);
    } else {
      g.beginPath();
      for (let i = -2; i <= 2; i++) {
        g.moveTo(x + i * s * 0.24 - s * 0.1, y - s * 0.3);
        g.lineTo(x + i * s * 0.24, y - s * 0.78);
        g.lineTo(x + i * s * 0.24 + s * 0.1, y - s * 0.3);
      }
      g.closePath(); g.fill();
    }
    // face: eyes + mouth (happy = open smile while being served;
    // angry = slanted brows, a frown and a red anger mark)
    g.fillStyle = INK;
    g.beginPath(); g.arc(x - s * 0.22, y + s * 0.05, s * 0.06, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + s * 0.22, y + s * 0.05, s * 0.06, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.5;
    if (angry) {
      g.beginPath(); g.moveTo(x - s * 0.36, y - s * 0.14); g.lineTo(x - s * 0.1, y - s * 0.04); g.stroke();
      g.beginPath(); g.moveTo(x + s * 0.36, y - s * 0.14); g.lineTo(x + s * 0.1, y - s * 0.04); g.stroke();
    }
    g.beginPath();
    if (happy) g.arc(x, y + s * 0.18, s * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
    else if (angry) g.arc(x, y + s * 0.42, s * 0.14, 1.15 * Math.PI, 1.85 * Math.PI);
    else g.arc(x, y + s * 0.22, s * 0.14, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
    if (angry) drawAngerMark(g, x + s * 0.52, y - s * 0.5, s * 0.34);
    // blush
    g.fillStyle = 'rgba(255,120,140,0.5)';
    g.beginPath(); g.arc(x - s * 0.4, y + s * 0.22, s * 0.09, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + s * 0.4, y + s * 0.22, s * 0.09, 0, Math.PI * 2); g.fill();
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
    // stall roof band
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
    // back shelf with stacked bowls, jars and bottles (behind the lanterns)
    for (const sy of [318, 392]) {
      g.fillStyle = '#5b3a22'; g.fillRect(372, sy, 560, 10);
      g.fillStyle = '#8a5a33'; g.fillRect(372, sy, 560, 4);
    }
    // stacked bowls on the top shelf
    for (let i = 0; i < 3; i++) {
      const bx = 420 + i * 16;
      g.beginPath(); g.arc(bx + 30, 306 - i * 2, 30, 0.1 * Math.PI, 0.9 * Math.PI); g.closePath();
      g.fillStyle = i % 2 ? '#4361ee' : '#e63946'; g.fill();
      g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    }
    for (let i = 0; i < 2; i++) {
      g.beginPath(); g.arc(540 + i * 4, 308 - i * 7, 26, 0.1 * Math.PI, 0.9 * Math.PI); g.closePath();
      g.fillStyle = '#f8f9fa'; g.fill();
      g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    }
    // jars with pickles / sauces
    const jarCols = ['#e63946', '#ffd93d', '#51cf66', '#ff9f43'];
    jarCols.forEach((col, i) => {
      const jx = 640 + i * 62;
      UR.rrect(g, jx, 276, 42, 42, 7, '#dbe7f3');
      g.beginPath(); g.arc(jx + 21, 300, 13, 0, Math.PI * 2);
      g.fillStyle = col; g.fill();
      UR.rrect(g, jx + 4, 268, 34, 10, 4, '#7f1d2d');
    });
    // bottles on the lower shelf
    ['#2a9d8f', '#e76f51', '#4361ee', '#bc6c25', '#7f1d2d'].forEach((col, i) => {
      const bx = 420 + i * 58;
      UR.rrect(g, bx, 356, 26, 36, 5, col);
      UR.rrect(g, bx + 8, 344, 10, 12, 3, col);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(bx + 5, 362, 5, 20);
    });
    // a hanging menu board on the shelf, kept clear of every lantern so
    // its full text stays readable in every shot
    UR.rrect(g, 668, 326, 212, 86, 6, '#fff6db');
    text(g, "TONIGHT'S MENU", 774, 342, 13, INK, 'center', true);
    text(g, 'RAMEN ¥110', 774, 362, 12.5, '#7f1d2d', 'center', true);
    text(g, 'RICE ¥115', 774, 380, 12.5, '#7f1d2d', 'center', true);
    text(g, 'OKONOMIYAKI ¥85', 774, 398, 12.5, '#7f1d2d', 'center', true);
    // paper lanterns on strings (x positions chosen to clear the menu board)
    for (let i = 0; i < 5; i++) {
      const lx = [70, 245, 420, 595, 950][i], ly = 330 + Math.sin(now * 1.6 + i) * 4;
      g.strokeStyle = '#0f0b1e'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(lx, 84); g.lineTo(lx, ly - 22); g.stroke();
      g.beginPath(); g.ellipse(lx, ly, 25, 30, 0, 0, Math.PI * 2);
      g.fillStyle = i % 2 ? '#ff9f43' : '#ff6b6b'; g.fill();
      g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
      g.fillStyle = '#fff3bf';
      g.beginPath(); g.ellipse(lx, ly, 13, 19, 0, 0, Math.PI * 2); g.fill();
    }
    // street / ground strip: warm pavement with lantern light pools
    g.fillStyle = '#2b2138';
    g.fillRect(0, 648, 1280, 152);
    g.strokeStyle = '#3a2d4d'; g.lineWidth = 3;
    for (let x = 0; x <= 1280; x += 106) { g.beginPath(); g.moveTo(x, 648); g.lineTo(x - 30, 800); g.stroke(); }
    g.beginPath(); g.moveTo(0, 706); g.lineTo(1280, 706); g.stroke();
    g.beginPath(); g.moveTo(0, 762); g.lineTo(1280, 762); g.stroke();
    // pools of warm lantern light on the street
    g.save();
    for (let i = 0; i < 6; i++) {
      const px = 90 + i * 215, py = 716 + (i % 2) * 34;
      const grad = g.createRadialGradient(px, py, 8, px, py, 105);
      grad.addColorStop(0, 'rgba(255,170,60,0.34)');
      grad.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = grad;
      g.beginPath(); g.ellipse(px, py, 118, 44, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // Stools at the street edge with the three customers waiting / eating.
  // Each seated customer is linked to a live ticket: an order bubble over
  // their head shows the dish they are waiting for, and the customer whose
  // ticket is nearly out of patience is visibly impatient — anger mark,
  // frown and a tapping foot — while the others smile.
  function drawStreetCustomers(g, state, now) {
    const spots = [
      { x: 84, c: 0 }, { x: 196, c: 1 }, { x: 1186, c: 2 }
    ];
    spots.forEach((sp, i) => {
      const bob = Math.sin(now * 2 + sp.x) * 2;
      const t = state.tickets[i];
      const impatient = !!t && (t.patience / t.patienceMax) < 0.25;
      // stool: round seat + legs
      g.fillStyle = '#7f1d2d';
      g.beginPath(); g.ellipse(sp.x, 742, 30, 9, 0, 0, Math.PI * 2); g.fill();
      g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
      g.strokeStyle = '#5c1420'; g.lineWidth = 6;
      g.beginPath(); g.moveTo(sp.x - 18, 748); g.lineTo(sp.x - 22, 782); g.stroke();
      g.beginPath(); g.moveTo(sp.x + 18, 748); g.lineTo(sp.x + 22, 782); g.stroke();
      if (impatient) {
        // tapping foot beside the stool, bouncing fast
        const tap = Math.abs(Math.sin(now * 14)) * 5;
        g.beginPath(); g.ellipse(sp.x + 34, 784 - tap, 11, 5.5, -0.25, 0, Math.PI * 2);
        g.fillStyle = INK; g.fill();
      }
      drawCustomer(g, CUSTOMERS[sp.c], sp.x, 690 + bob, 30,
        !impatient && (sp.c === 2 ? !!state.passDish : true), impatient);
      if (t) drawOrderBubble(g, t.dishId, sp.x + 6, 606 + bob, 26);
    });
  }

  function drawCounter(g, state, now) {
    // counter body: warm wood with plank lines
    UR.rrect(g, 8, 468, 1264, 176, 8, '#8a5a33');
    g.strokeStyle = 'rgba(70,42,18,0.55)'; g.lineWidth = 2.5;
    for (let x = 90; x < 1264; x += 118) { g.beginPath(); g.moveTo(x, 496); g.lineTo(x, 644); g.stroke(); }
    g.beginPath(); g.moveTo(8, 560); g.lineTo(1272, 560); g.stroke();
    // polished wooden top with a warm sheen
    g.fillStyle = '#b07a45'; g.fillRect(8, 468, 1264, 26);
    g.fillStyle = 'rgba(255,220,160,0.35)'; g.fillRect(8, 468, 1264, 7);
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
    // open ingredient crates on the counter, 3 x 3, keys 1..9. The tiles
    // are as large as the counter front allows (the shelf band above the
    // counter is kept shallow) and the sprites fill them, so each of the
    // 9 ingredients reads at contact-sheet size.
    UR.INGREDIENTS.forEach((ing, i) => {
      const col = i % 3, row = (i / 3) | 0;
      const x = 32 + col * 68, y = 494 + row * 46;
      UR.rrect(g, x, y, 66, 44, 5, '#3d5a80');
      g.fillStyle = 'rgba(190,227,255,0.35)'; g.fillRect(x + 3, y + 3, 60, 8);
      UR.drawItemIcon(g, ing.id, x + 23, y + 23, 15);
      text(g, String(i + 1), x + 55, y + 22, 15, '#ffffff', 'center', true);
    });
  }

  function drawChopBoard(g, state, now) {
    UR.rrect(g, 262, 512, 136, 54, 8, '#e9d8a6');
    g.strokeStyle = 'rgba(146,110,52,0.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(268, 530); g.lineTo(392, 530); g.stroke();
    g.beginPath(); g.moveTo(268, 548); g.lineTo(392, 548); g.stroke();
    const chopping = state.chef.action && state.chef.action.type === 'chop';
    const chopDip = chopping ? Math.abs(Math.sin(now * 16)) * 12 : 5;
    // a spring onion lies mid-chop on the board at all times, rings beside it
    UR.drawItemIcon(g, 'onion-chopped', 292, 544, 10);
    UR.drawItemIcon(g, 'onion', 330, 540, 13);
    // knife, pressed down into the onion
    g.save();
    g.translate(356, 516 - chopDip * 0.4); g.rotate(-0.42);
    UR.rrect(g, -6, -28, 13, 32, 4, '#495057');
    g.beginPath(); g.moveTo(-16, 2); g.lineTo(24, 2); g.lineTo(10, 20); g.lineTo(-16, 15);
    g.closePath(); g.fillStyle = '#e9ecef'; g.fill();
    g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    g.restore();
    if (chopping) {
      const a = state.chef.action;
      UR.rrect(g, 268, 574, 124, 12, 6, '#343a40');
      g.fillStyle = '#51cf66';
      g.fillRect(270, 576, 120 * (a.t / a.dur), 8);
    }
    // prep tray with finished portions, on the counter front below the board
    UR.rrect(g, 292, 580, 120, 52, 6, '#748cab');
    text(g, 'PREP TRAY', 352, 592, 11, '#ffffff', 'center', true);
    state.prepTray.forEach((item, i) => {
      UR.drawItemIcon(g, UR.preparedId(item), 322 + i * 30, 614, 11);
    });
  }

  function drawGrill(g, state, now) {
    UR.rrect(g, 414, 492, 312, 92, 10, '#343a40');
    g.fillStyle = '#495057'; g.fillRect(426, 504, 288, 68);
    // glowing coals under the grill plate
    g.fillStyle = 'rgba(255,110,40,0.35)'; g.fillRect(426, 560, 288, 12);
    const stageColor = { raw: '#adb5bd', cooking: '#ffa94d', perfect: '#ffd93d', overdone: '#e8590c', burnt: '#ff8787' };
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
      UR.drawPanFood(g, pan.item.ing, stage, x, y, now);
      // gentle steam wisps over cooking food (smoke is drawn in drawPanFood)
      if (stage === 'cooking' || stage === 'perfect') {
        g.save();
        g.strokeStyle = 'rgba(248,249,250,0.55)'; g.lineWidth = 3.5; g.lineCap = 'round';
        for (let wI = 0; wI < 2; wI++) {
          const ph = (now * 0.9 + wI * 0.5 + i * 0.3) % 1;
          g.globalAlpha = 0.5 * (1 - ph);
          g.beginPath();
          g.moveTo(x - 10 + wI * 20, y - 30 - ph * 16);
          g.quadraticCurveTo(x - 16 + wI * 20 + Math.sin(ph * 9) * 5, y - 42 - ph * 16, x - 8 + wI * 20, y - 54 - ph * 14);
          g.stroke();
        }
        g.restore();
      }
      // doneness ring: grey -> orange -> GOLD zone -> red (secondary cue)
      g.beginPath();
      g.arc(x, y, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * UR.donenessFrac(pan.t));
      g.strokeStyle = stageColor[stage]; g.lineWidth = stage === 'perfect' ? 8 : 5; g.stroke();
      g.beginPath();
      g.arc(x, y, 46, -Math.PI / 2 + Math.PI * 2 * (UR.PERFECT_START / UR.OVER_END),
        -Math.PI / 2 + Math.PI * 2 * (UR.PERFECT_END / UR.OVER_END));
      g.strokeStyle = '#ffd93d'; g.lineWidth = 3; g.stroke();
      // doneness label on a high-contrast chip (white on near-black, with
      // a coloured edge) ABOVE the pan, where the chef's body never covers
      // it — the state is legible even at thumbnail size
      const label = stage.toUpperCase();
      const chipW = label.length * 8.4 + 16;
      g.save();
      UR.rrect(g, x - chipW / 2, y - 72, chipW, 22, 6, '#171126');
      g.strokeStyle = stageColor[stage]; g.lineWidth = 2.5;
      g.strokeRect(x - chipW / 2 + 1, y - 71, chipW - 2, 20);
      text(g, label, x, y - 60, 12.5, '#ffffff', 'center', true);
      g.restore();
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

  function drawPlating(g, state, now) {
    const cx = 850, cy = 548, R = 60;
    const target = plateTarget(state);
    const plateBase = state.plate.find((c) => c === 'noodles' || c === 'rice' || c === 'batter');
    // shadow + the bowl itself, filling component by component
    g.beginPath(); g.ellipse(cx, cy + R * 0.72, R * 1.05, 12, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fill();
    if (plateBase === 'batter') {
      UR.drawItemIcon(g, 'batter', cx, cy - 4, 42);
    } else {
      UR.drawBowlBase(g, cx, cy, R, plateBase === 'rice' ? '#4361ee' : plateBase === 'noodles' ? '#e63946' : '#e8e2d4');
      if (plateBase === 'noodles') {
        // broth + noodle swirls appear the moment the base lands
        g.beginPath(); g.ellipse(cx, cy - R * 0.18, R * 0.86, R * 0.27, 0, 0, Math.PI * 2);
        g.fillStyle = '#e8892a'; g.fill();
        g.strokeStyle = '#ffd93d'; g.lineWidth = 4; g.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          g.beginPath();
          g.moveTo(cx - R * 0.55, cy - R * 0.26 + i * R * 0.11);
          g.quadraticCurveTo(cx, cy - R * 0.38 + i * R * 0.11, cx + R * 0.55, cy - R * 0.26 + i * R * 0.11);
          g.stroke();
        }
      } else if (plateBase === 'rice') {
        g.beginPath(); g.ellipse(cx, cy - R * 0.2, R * 0.84, R * 0.3, 0, Math.PI, Math.PI * 2);
        g.closePath(); g.fillStyle = '#ffffff'; g.fill();
        g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
      }
    }
    // plated components sit inside the bowl, fanned across the surface
    const rest = state.plate.filter((c) => c !== plateBase);
    rest.forEach((c, i) => {
      const off = (i - (rest.length - 1) / 2) * R * 0.66;
      UR.drawItemIcon(g, c, cx + off, cy - R * 0.24, 17);
    });
    // ghost slots ON the bowl rim: dashed circles holding the needed
    // sprite at low alpha, exactly where it will land
    if (target) {
      const missing = target.components.filter((c) => state.plate.indexOf(c) < 0);
      missing.forEach((c, i) => {
        const a = Math.PI * (0.12 + 0.76 * (missing.length === 1 ? 0.5 : i / (missing.length - 1)));
        const gx = cx + Math.cos(a) * R * 1.02, gy = cy - R * 0.18 + Math.sin(a) * R * 0.36;
        g.save();
        g.globalAlpha = 0.42;
        UR.drawItemIcon(g, c, gx, gy, 13);
        g.restore();
        g.setLineDash([5, 4]);
        g.strokeStyle = '#ffd93d'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(gx, gy, 21, 0, Math.PI * 2); g.stroke();
        g.setLineDash([]);
      });
      text(g, target.name, 795, 664, 13, '#ffe8cc', 'left', true);
      // steam over a nearly finished bowl
      if (state.plate.length >= 2) {
        g.save();
        g.strokeStyle = 'rgba(248,249,250,0.5)'; g.lineWidth = 3.5; g.lineCap = 'round';
        const ph = (now * 0.8) % 1;
        g.globalAlpha = 0.5 * (1 - ph);
        g.beginPath();
        g.moveTo(cx - 8, cy - R - 2 - ph * 12);
        g.quadraticCurveTo(cx - 14, cy - R - 14 - ph * 12, cx - 4, cy - R - 26 - ph * 10);
        g.stroke();
        g.restore();
      }
    }
    if (!state.plate.length && !target) text(g, 'PLATE', 850, 548, 13, '#868e96', 'center', true);
  }

  function drawPass(g, state, now) {
    // serving window in the back wall with waiting customers. Each
    // customer carries a speech bubble with the mini icon of the dish
    // they ordered, so the bowl at the pass visibly belongs to a person;
    // the customer whose ticket is nearly out of patience frowns with an
    // anger mark while the rest smile.
    UR.rrect(g, 978, 268, 250, 168, 10, '#0f0b1e');
    UR.rrect(g, 978, 268, 250, 34, 10, '#7f1d2d');
    text(g, 'PASS — SERVE HERE', 1103, 286, 14, '#ffffff', 'center', true);
    state.tickets.forEach((t, i) => {
      if (i > 2) return;
      const cx = 1024 + i * 56, cy = 368;
      const impatient = (t.patience / t.patienceMax) < 0.25;
      const receiving = !!state.passDish && state.passDish.dishId === t.dishId && state.passDish.slide >= 1;
      drawCustomer(g, CUSTOMERS[i % 3], cx, cy, 26, receiving && !impatient, impatient);
      // bubble shows the dish THIS customer ordered — for the receiving
      // customer it is the very dish sitting READY at the pass
      drawOrderBubble(g, t.dishId, cx + 4, 322, 19);
    });
    if (!state.tickets.length) text(g, 'no orders… yet', 1103, 380, 14, '#868e96', 'center', true);
  }

  // Trash bin at the right end of the counter, drawn AFTER the counter
  // (drawPass runs before it and the counter would paint the bin away).
  // A burnt item sits visibly inside it — charred egg silhouette poking
  // over the rim — so the burnt -> trash route reads at a glance.
  function drawTrashBin(g, state, now) {
    // high on the counter front, right end: low enough to sit on the
    // counter, high enough that no street customer's order bubble
    // (drawn later, lower) can ever cover the bin or its label
    UR.drawItemIcon(g, 'egg-grilled', 1217, 482, 15);
    g.save();
    g.beginPath(); g.arc(1217, 482, 19, 0, Math.PI * 2); g.clip();
    g.fillStyle = 'rgba(10,6,6,0.62)'; g.fillRect(1198, 463, 38, 38);
    g.strokeStyle = '#8f2d23'; g.lineWidth = 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(1206, 470); g.lineTo(1216, 482); g.lineTo(1210, 494); g.stroke();
    g.beginPath(); g.moveTo(1228, 472); g.lineTo(1220, 484); g.stroke();
    g.restore();
    UR.rrect(g, 1186, 494, 62, 66, 6, '#495057');
    UR.rrect(g, 1180, 484, 74, 14, 6, '#343a40');
    text(g, 'TRASH', 1217, 522, 12, '#ffffff', 'center', true);
    text(g, 'T = bin it', 1217, 544, 10, '#ced4da', 'center', true);
  }

  // The finished dish on the counter at the pass, drawn after the counter
  // so the counter never paints over it.
  function drawPassDish(g, state, now) {
    if (!state.passDish) return;
    const pd = state.passDish;
    const x = 850 + (1090 - 850) * Math.min(1, pd.slide);
    // the PASS dish sits on a small wooden tray in a deep-BLUE bowl, so
    // READY at the pass never blurs into the red PLATING bowl beside it
    g.beginPath(); g.ellipse(x, 522 + 52, 74, 13, 0, 0, Math.PI * 2);
    g.fillStyle = '#6f4525'; g.fill();
    g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#8a5a33'; g.fillRect(x - 58, 522 + 44, 116, 7);
    // drawn BIG: broth, noodle swirls, egg half and onion must read as a
    // ramen bowl even at thumbnail size
    UR.drawDish(g, pd.dishId, x, 522, 48, '#1d4ed8');
    // steam wisps over the finished bowl
    g.save();
    g.strokeStyle = 'rgba(248,249,250,0.55)'; g.lineWidth = 3.5; g.lineCap = 'round';
    for (let wI = 0; wI < 2; wI++) {
      const ph = (now * 0.85 + wI * 0.5) % 1;
      g.globalAlpha = 0.55 * (1 - ph);
      g.beginPath();
      g.moveTo(x - 14 + wI * 28, 478 - ph * 14);
      g.quadraticCurveTo(x - 20 + wI * 28, 466 - ph * 14, x - 10 + wI * 28, 454 - ph * 12);
      g.stroke();
    }
    g.restore();
    if (pd.slide >= 1) {
      // READY flag, planted beside the bowl (never inside the food)
      g.strokeStyle = INK; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + 52, 506); g.lineTo(x + 52, 462); g.stroke();
      g.fillStyle = '#51cf66';
      g.beginPath(); g.moveTo(x + 52, 462); g.lineTo(x + 84, 470); g.lineTo(x + 52, 480); g.closePath(); g.fill();
      g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      text(g, 'READY!', x + 2, 628, 18, '#51cf66', 'center', true);
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
    g.strokeStyle = INK; g.lineWidth = 12; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 9, 672); g.lineTo(x - 11 + stride, feet); g.stroke();
    g.beginPath(); g.moveTo(x + 9, 672); g.lineTo(x + 11 - stride, feet); g.stroke();
    // round body: indigo happi coat + big white apron
    UR.rrect(g, x - 31, 592, 62, 84, 22, '#3d5a80');
    UR.rrect(g, x - 21, 604, 42, 66, 12, '#f8f9fa');
    g.strokeStyle = '#e63946'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - 21, 622); g.lineTo(x + 21, 622); g.stroke();
    // head with a face
    UR.circle(g, x, 560, 27, '#ffcf9e');
    // ears + rosy cheeks
    g.fillStyle = 'rgba(255,120,140,0.55)';
    g.beginPath(); g.arc(x - 17, 568, 5.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + 17, 568, 5.5, 0, Math.PI * 2); g.fill();
    // eyes (look toward facing) + determined brows + smile
    g.fillStyle = INK;
    g.beginPath(); g.arc(x - 9 + 3 * chef.facing, 560, 3.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + 9 + 3 * chef.facing, 560, 3.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 14 + 3 * chef.facing, 551); g.lineTo(x - 5 + 3 * chef.facing, 549); g.stroke();
    g.beginPath(); g.moveTo(x + 5 + 3 * chef.facing, 549); g.lineTo(x + 14 + 3 * chef.facing, 551); g.stroke();
    g.beginPath(); g.arc(x + 2 * chef.facing, 567, 8, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    // hachimaki headband with a knot and fluttering tails
    UR.rrect(g, x - 28, 534, 56, 14, 6, '#e63946');
    UR.circle(g, x, 541, 6, '#ffffff');
    g.strokeStyle = '#e63946'; g.lineWidth = 5;
    const flutter = Math.sin(now * 6) * 3;
    g.beginPath(); g.moveTo(x + 26, 540); g.quadraticCurveTo(x + 40, 544 + flutter, x + 44, 558 + flutter); g.stroke();
    g.beginPath(); g.moveTo(x + 26, 546); g.quadraticCurveTo(x + 36, 554 + flutter, x + 38, 566 + flutter); g.stroke();
    // arms raised, carrying items overhead
    g.strokeStyle = '#ffcf9e'; g.lineWidth = 10;
    g.beginPath(); g.moveTo(x - 24, 612); g.lineTo(x - 17, 538); g.stroke();
    g.beginPath(); g.moveTo(x + 24, 612); g.lineTo(x + 17, 538); g.stroke();
    chef.hands.forEach((item, i) => {
      const ix = x + (i - (chef.hands.length - 1) / 2) * 42;
      if (item.kind === 'grilled' && item.quality === 'burnt') {
        UR.drawItemIcon(g, item.ing, ix, 512, 16);
        g.fillStyle = 'rgba(10,10,10,0.7)';
        g.beginPath(); g.arc(ix, 512, 22, 0, Math.PI * 2); g.fill();
      } else {
        UR.drawItemIcon(g, UR.preparedId(item), ix, 512, 16);
      }
    });
    if (chef.action && chef.action.type === 'chop') {
      text(g, 'CHOP!', x, 482, 15, '#95d5b2', 'center', true);
    }
  }

  function drawStall(g, state, now) {
    drawBackground(g, state, now);
    drawPass(g, state, now);
    drawCounter(g, state, now);
    drawFridge(g, state);
    drawChopBoard(g, state, now);
    drawGrill(g, state, now);
    drawPlating(g, state, now);
    drawTrashBin(g, state, now);
    drawPassDish(g, state, now);
    drawChef(g, state, now);
    drawStreetCustomers(g, state, now);
    drawSteam(g, state);
  }

  window.UR = window.UR || {};
  window.UR.drawStall = drawStall;
  window.UR.plateTarget = plateTarget;
  window.UR.stallText = text;
})();

