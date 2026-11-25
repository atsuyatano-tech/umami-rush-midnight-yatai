// render-hud.js — ticket rail under a noren curtain, service timer with
// a depleting bar, score/combo/tips, star progress, popups, and the
// title / end-of-service overlays.
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

  // Each dish family gets its own ticket colour, so two ramen tickets
  // (red) never blur into a rice ticket (blue) or okonomiyaki (orange).
  const FAMILY_COLOR = { noodles: '#e63946', rice: '#4361ee', batter: '#f08c00' };
  function familyColor(dish) {
    return FAMILY_COLOR[dish.components[0]] || '#7f1d2d';
  }

  // The noren curtain across the stall top: indigo panels with white
  // crests, hanging over the ticket rail.
  function drawNoren(g, now) {
    const panelW = 118, gap = 10, top = 84, h = 34;
    for (let x = 6, i = 0; x < 1280; x += panelW + gap, i++) {
      const sway = Math.sin(now * 1.4 + i * 0.9) * 2;
      g.fillStyle = i % 2 ? '#2b3a67' : '#33477d';
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x + panelW, top);
      g.lineTo(x + panelW + sway, top + h);
      g.quadraticCurveTo(x + panelW / 2, top + h + 7, x + sway, top + h);
      g.closePath(); g.fill();
      g.lineWidth = 2.5; g.strokeStyle = '#1a2440'; g.stroke();
      // plain panels only — no crest circles (a row of empty rings above
      // the rail read as broken UI dots, not as a curtain)
    }
    g.fillStyle = '#171126';
    g.fillRect(0, top, 1280, 3);
  }

  function drawTickets(g, state, now) {
    const rush = UR.isRush(state);
    // rail backing; flashes during the rush
    g.fillStyle = rush && Math.sin(now * 10) > 0 ? '#5c1420' : '#171126';
    g.fillRect(0, 84, 1280, 156);
    drawNoren(g, now);
    if (rush) text(g, 'RUSH!', 1236, 138, 22, '#ffd93d', 'center', true);
    const shared = UR.sharedComponents(state);
    // live tickets spread across the whole rail (no row of empty slots)
    const n = state.tickets.length;
    const ticketX = (i) => n > 1 ? 14 + i * (1280 - 28 - 292) / (n - 1) : 14;
    // SHARED PREP connector, drawn FIRST — behind the ticket cards and
    // dipping BELOW them: the dashed arc leaves each shared icon, passes
    // behind both cards (so it can never strike through a title or a
    // price) and bows out under the cards along the rail before rising
    // to the matching icon. The orange rings on the icons themselves
    // (drawn with the cards, above this arc) carry the match.
    if (n >= 2) {
      outer:
      for (let i = 0; i < n; i++) {
        for (let k = i + 1; k < n; k++) {
          const di = UR.dishById(state.tickets[i].dishId);
          const dk = UR.dishById(state.tickets[k].dishId);
          for (const c of di.components) {
            if (dk.components.indexOf(c) < 0) continue;
            const xi = ticketX(i) - (1 - state.tickets[i].slide) * 330 + 44 + di.components.indexOf(c) * 58;
            const xk = ticketX(k) - (1 - state.tickets[k].slide) * 330 + 44 + dk.components.indexOf(c) * 58;
            g.save();
            g.setLineDash([7, 5]);
            g.strokeStyle = '#f08c00'; g.lineWidth = 3.5;
            g.beginPath();
            g.moveTo(xi, 184);
            g.quadraticCurveTo((xi + xk) / 2, 330, xk, 184);
            g.stroke();
            g.setLineDash([]);
            g.restore();
            break outer;
          }
        }
      }
    }
    state.tickets.forEach((t, i) => {
      const dish = UR.dishById(t.dishId);
      const w = 292, h = 112;
      const x = ticketX(i) - (1 - t.slide) * 330;
      const y = 124;
      UR.rrect(g, x, y, w, h, 8, '#fff6db');
      // colour-coded family band across the ticket top
      g.save();
      g.beginPath();
      g.moveTo(x + 8, y); g.lineTo(x + w - 8, y);
      g.quadraticCurveTo(x + w, y, x + w, y + 8);
      g.lineTo(x + w, y + 13); g.lineTo(x, y + 13); g.lineTo(x, y + 8);
      g.quadraticCurveTo(x, y, x + 8, y);
      g.closePath();
      g.fillStyle = familyColor(dish); g.fill();
      g.restore();
      // pin
      UR.circle(g, x + w / 2, y + 7, 5, '#171126');
      text(g, dish.name, x + 14, y + 32, 16, INK, 'left', true);
      text(g, '¥' + dish.price, x + w - 28, y + 32, 15, '#7f1d2d', 'center', true);
      // pictorial ingredient sequence, in plate order
      dish.components.forEach((c, j) => {
        const cx = x + 44 + j * 58, cy = y + 60;
        if (shared.indexOf(c) >= 0) {
          g.beginPath(); g.arc(cx, cy, 24, 0, Math.PI * 2);
          g.strokeStyle = '#f08c00'; g.lineWidth = 5; g.stroke();
        }
        UR.drawItemIcon(g, c, cx, cy, 15);
        if (j < dish.components.length - 1) text(g, '+', cx + 29, cy, 20, INK, 'center', true);
      });
      // SHARED PREP stamp ONLY on tickets that actually share a prep step
      const mine = dish.components.some((c) => shared.indexOf(c) >= 0);
      if (mine) {
        g.save();
        g.translate(x + w - 58, y + 90); g.rotate(-0.06);
        g.fillStyle = '#fff6db'; g.fillRect(-54, -8, 108, 16);
        g.strokeStyle = '#f08c00'; g.lineWidth = 2;
        g.strokeRect(-54, -8, 108, 16);
        text(g, 'SHARED PREP', 0, 0, 10.5, '#d9480f', 'center', true);
        g.restore();
      }
      // fat patience bar
      const frac = Math.max(0, t.patience / t.patienceMax);
      UR.rrect(g, x + 12, y + h - 12, w - 24, 10, 5, '#343a40');
      g.fillStyle = frac > 0.5 ? '#51cf66' : frac > 0.25 ? '#ffa94d' : '#ff6b6b';
      const bw = Math.max(0, (w - 28) * frac);
      if (bw > 2) g.fillRect(x + 14, y + h - 10, bw, 6);
    });
    if (!state.tickets.length && state.mode === 'play') {
      text(g, 'ORDERS INCOMING…', 300, 178, 22, '#868e96', 'center', true);
    }
  }

  function drawHud(g, state, now) {
    // big service timer, top right on the roof band, with a thick
    // depleting bar beneath the digits
    const rush = UR.isRush(state);
    UR.rrect(g, 1052, 6, 216, 72, 10, rush && Math.sin(now * 10) > 0 ? '#e63946' : '#171126');
    text(g, 'SERVICE', 1160, 20, 11, '#ced4da', 'center', true);
    text(g, fmtTime(state.timeLeft), 1160, 44, 32, '#ffffff', 'center', true);
    const tFrac = Math.max(0, state.timeLeft / UR.SERVICE_SECONDS);
    UR.rrect(g, 1066, 62, 188, 10, 5, '#343a40');
    g.fillStyle = tFrac > 0.5 ? '#51cf66' : tFrac > 0.25 ? '#ffa94d' : '#ff6b6b';
    if (tFrac > 0.01) g.fillRect(1068, 64, 184 * tFrac, 6);
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
    // controls footer: short, large, high contrast, never truncated
    text(g, '←→ move · SPACE interact · 1–9 grab', 640, 784, 18, '#cfc6e8', 'center', true);
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

  // End-of-service results: a panel over the still-visible stall — the
  // served bowl at the pass, the customers, the lanterns all stay in
  // frame around it, so the night visibly closes its loop.
  function drawOver(g, state) {
    g.fillStyle = 'rgba(10,8,23,0.45)';
    g.fillRect(0, 0, 1280, 800);
    // panel scaled ~1.4x about the screen centre, so SERVICE COMPLETE,
    // the stars, SCORE / SERVED / TIPS stay legible even when the shot
    // is shrunk into a contact-sheet strip; the stall and customers
    // stay visible in the margins around it
    g.save();
    g.translate(640, 400); g.scale(1.4, 1.4); g.translate(-640, -400);
    // panel with a warm paper body and a red header band
    UR.rrect(g, 330, 196, 620, 408, 16, '#fff6db');
    g.save();
    g.beginPath();
    g.moveTo(346, 196); g.lineTo(934, 196);
    g.quadraticCurveTo(950, 196, 950, 212);
    g.lineTo(950, 262); g.lineTo(330, 262); g.lineTo(330, 212);
    g.quadraticCurveTo(330, 196, 346, 196);
    g.closePath();
    g.fillStyle = '#7f1d2d'; g.fill();
    g.restore();
    text(g, 'SERVICE COMPLETE', 640, 230, 40, '#ffffff', 'center', true);
    // big earned stars
    const stars = UR.starsFor(state.score);
    text(g, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 308, 64, '#f08c00', 'center', true);
    // the night's numbers, one per line, large and high contrast
    text(g, 'SCORE', 470, 372, 20, '#7f1d2d', 'left', true);
    text(g, String(state.score), 810, 372, 34, INK, 'right', true);
    text(g, 'SERVED', 470, 422, 20, '#7f1d2d', 'left', true);
    text(g, state.servedCount + ' dishes', 810, 422, 30, INK, 'right', true);
    text(g, 'TIPS', 470, 470, 20, '#7f1d2d', 'left', true);
    text(g, '¥' + state.tips, 810, 470, 30, INK, 'right', true);
    text(g, 'BEST COMBO', 470, 518, 20, '#7f1d2d', 'left', true);
    text(g, 'x' + Math.max(1, state.bestCombo), 810, 518, 30, INK, 'right', true);
    UR.rrect(g, 455, 548, 370, 44, 10, '#e63946');
    text(g, 'press SPACE for next service', 640, 571, 19, '#ffffff', 'center', true);
    g.restore();
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

