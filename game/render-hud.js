// render-hud.js — ticket rail, service timer, score/combo/tips, star
// progress, popups, and the title / end-of-service overlays.
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

  function fmtTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    return ((s / 60) | 0) + ':' + String(s % 60).padStart(2, '0');
  }

  function drawTickets(g, state, now) {
    const rush = UR.isRush(state);
    // rail backing; flashes during the rush
    g.fillStyle = rush && Math.sin(now * 10) > 0 ? '#5c1420' : '#171126';
    g.fillRect(0, 88, 1280, 152);
    if (rush) text(g, 'RUSH!', 1236, 110, 22, '#ffd93d', 'center', true);
    const shared = UR.sharedComponents(state);
    state.tickets.forEach((t, i) => {
      const dish = UR.dishById(t.dishId);
      const w = 292, h = 136;
      const x = 14 + i * 302 - (1 - t.slide) * 330;
      const y = 96;
      UR.rrect(g, x, y, w, h, 8, '#fff6db');
      // pin
      UR.circle(g, x + w / 2, y + 8, 6, '#e63946');
      text(g, dish.name, x + 14, y + 30, 17, INK, 'left', true);
      text(g, '¥' + dish.price, x + w - 30, y + 30, 15, '#7f1d2d', 'center', true);
      // pictorial ingredient sequence, in plate order
      dish.components.forEach((c, j) => {
        const cx = x + 48 + j * 62, cy = y + 72;
        if (shared.indexOf(c) >= 0) {
          g.beginPath(); g.arc(cx, cy, 27, 0, Math.PI * 2);
          g.strokeStyle = '#f08c00'; g.lineWidth = 5; g.stroke();
        }
        UR.drawItemIcon(g, c, cx, cy, 19);
        if (j < dish.components.length - 1) text(g, '+', cx + 31, cy, 20, INK, 'center', true);
      });
      if (shared.length) text(g, 'SHARED PREP!', x + 60, y + 106, 11, '#f08c00', 'center', true);
      // fat patience bar
      const frac = Math.max(0, t.patience / t.patienceMax);
      UR.rrect(g, x + 12, y + h - 24, w - 24, 15, 7, '#343a40');
      g.fillStyle = frac > 0.5 ? '#51cf66' : frac > 0.25 ? '#ffa94d' : '#ff6b6b';
      const bw = Math.max(0, (w - 28) * frac);
      if (bw > 2) g.fillRect(x + 14, y + h - 22, bw, 11);
    });
    if (!state.tickets.length && state.mode === 'play') {
      text(g, 'ORDERS INCOMING…', 300, 164, 22, '#868e96', 'center', true);
    }
  }

  function drawHud(g, state, now) {
    // big service timer, top right on the roof band
    const rush = UR.isRush(state);
    UR.rrect(g, 1052, 8, 216, 68, 10, rush && Math.sin(now * 10) > 0 ? '#e63946' : '#171126');
    text(g, 'SERVICE', 1160, 24, 12, '#ced4da', 'center', true);
    text(g, fmtTime(state.timeLeft), 1160, 52, 34, '#ffffff', 'center', true);
    // score strip under the rail
    g.fillStyle = '#171126';
    g.fillRect(0, 240, 1280, 34);
    text(g, 'SCORE ' + state.score, 90, 258, 20, '#ffd93d', 'left', true);
    const comboCol = state.combo >= 3 ? '#ff9f43' : '#ced4da';
    text(g, 'COMBO x' + Math.max(1, state.combo), 420, 258, 20, comboCol, 'center', true);
    text(g, 'TIPS ¥' + state.tips, 640, 258, 20, '#95d5b2', 'center', true);
    text(g, 'SERVED ' + state.servedCount, 830, 258, 20, '#ced4da', 'center', true);
    // star progress toward the next threshold
    const next = UR.nextStarAt(state.score);
    const stars = UR.starsFor(state.score);
    text(g, '★'.repeat(stars) + '☆'.repeat(3 - stars), 1010, 258, 20, '#ffd93d', 'center', true);
    if (next) text(g, 'next ★ at ' + next, 1170, 258, 14, '#868e96', 'center', true);
    else text(g, '3 STAR NIGHT!', 1170, 258, 14, '#ffd93d', 'center', true);
    // carried / hint line on the floor
    const st = UR.stationAt(state.chef.x);
    let hint = '←→ / AD move · SPACE: interact · 1-9: grab ingredient · click: walk & act · T: trash';
    if (st) hint = 'AT: ' + st.name + ' — ' + hint;
    text(g, hint, 640, 782, 15, '#5c5470', 'center', false);
    if (state.bellFlash > 0) {
      g.save();
      g.globalAlpha = state.bellFlash * 0.5;
      g.strokeStyle = '#ffd93d'; g.lineWidth = 6;
      g.strokeRect(4, 4, 1272, 792);
      g.restore();
    }
  }

  function drawPopups(g, state) {
    for (const p of state.popups) {
      g.save();
      g.globalAlpha = Math.max(0, 1 - p.t / p.life);
      text(g, p.text, p.x, p.y, p.big ? 30 : 19, p.color, 'center', true);
      g.restore();
    }
  }

  function drawTitle(g, state) {
    g.fillStyle = 'rgba(10,8,23,0.72)';
    g.fillRect(0, 0, 1280, 800);
    text(g, 'UMAMI RUSH', 640, 300, 84, '#ffd93d', 'center', true);
    text(g, '— Midnight Yatai —', 640, 362, 30, '#ff9f43', 'center', true);
    text(g, 'One stall. One chef. 150 seconds of dinner rush.', 640, 420, 22, '#f8f9fa', 'center', true);
    text(g, 'Read the ticket → grab → chop → grill to the GOLD zone → plate in order → serve at the PASS.', 640, 458, 19, '#ced4da', 'center', true);
    text(g, 'Burnt food and late tickets break your combo. Shared prep steps are ringed in orange — plan around them!', 640, 490, 19, '#ced4da', 'center', true);
    UR.rrect(g, 490, 530, 300, 58, 12, '#e63946');
    text(g, 'CLICK OR PRESS SPACE', 640, 560, 22, '#ffffff', 'center', true);
  }

  function drawOver(g, state) {
    g.fillStyle = 'rgba(10,8,23,0.78)';
    g.fillRect(0, 0, 1280, 800);
    text(g, 'SERVICE OVER!', 640, 250, 56, '#ffd93d', 'center', true);
    const stars = UR.starsFor(state.score);
    text(g, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 322, 54, '#ffd93d', 'center', true);
    text(g, 'SCORE  ' + state.score + '      TIPS  ¥' + state.tips, 640, 392, 28, '#f8f9fa', 'center', true);
    text(g, 'Served ' + state.servedCount + ' dishes · Best combo x' + Math.max(1, state.bestCombo) + ' · Lost ' + state.lostCount + ' tickets', 640, 436, 21, '#ced4da', 'center', true);
    UR.rrect(g, 490, 486, 300, 58, 12, '#e63946');
    text(g, 'SPACE — NEXT NIGHT', 640, 516, 22, '#ffffff', 'center', true);
  }

  function drawHudAll(g, state, now) {
    drawTickets(g, state, now);
    drawHud(g, state, now);
    drawPopups(g, state);
    if (state.mode === 'title') drawTitle(g, state);
    if (state.mode === 'over') drawOver(g, state);
  }

  window.UR = window.UR || {};
  window.UR.drawHudAll = drawHudAll;
  window.UR.fmtTime = fmtTime;
})();
