// render-food.js — every ingredient and dish, drawn BIG and appetising:
// a real ramen bowl with broth, noodle swirls, halved egg and narutomaki;
// a curved segmented shrimp; a fried egg with a wavy white; green onion
// rings; a kernel-cluster corn cob. Saturated fills, glossy highlights,
// thick dark outlines. The same sprites are used in the fridge bins, the
// ticket recipe strips, the grill pans, plating and the pass, so a player
// learns one picture per ingredient. Pan food is drawn by drawPanFood,
// which recolours the food itself through the doneness gradient.
(function () {
  'use strict';
  const UR = window.UR;
  const INK = '#171126';

  function circle(g, x, y, r, fill) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = fill; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  }

  function disc(g, x, y, r, fill) { // filled circle, no outline
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = fill; g.fill();
  }

  function rrect(g, x, y, w, h, r, fill) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.fillStyle = fill; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  }

  function shine(g, x, y, r) { // glossy highlight blob
    g.save();
    g.globalAlpha = 0.75;
    g.beginPath(); g.ellipse(x, y, r, r * 0.55, -0.6, 0, Math.PI * 2);
    g.fillStyle = '#ffffff'; g.fill();
    g.restore();
  }

  // An empty bowl seen from a three-quarter angle: foot, curved body, rim,
  // and a broth / rice surface ellipse at (x, y - R*0.18).
  function drawBowlBase(g, x, y, R, color) {
    // foot
    rrect(g, x - R * 0.34, y + R * 0.52, R * 0.68, R * 0.2, 4, INK);
    // body
    g.beginPath();
    g.moveTo(x - R, y - R * 0.18);
    g.quadraticCurveTo(x - R * 0.92, y + R * 0.5, x - R * 0.3, y + R * 0.6);
    g.quadraticCurveTo(x, y + R * 0.68, x + R * 0.3, y + R * 0.6);
    g.quadraticCurveTo(x + R * 0.92, y + R * 0.5, x + R, y - R * 0.18);
    g.closePath();
    g.fillStyle = color; g.fill();
    g.lineWidth = 4.5; g.strokeStyle = INK; g.stroke();
    // decorative stripe on the body
    g.beginPath();
    g.moveTo(x - R * 0.78, y + R * 0.28);
    g.quadraticCurveTo(x, y + R * 0.5, x + R * 0.78, y + R * 0.28);
    g.strokeStyle = 'rgba(255,255,255,0.65)'; g.lineWidth = 4; g.stroke();
    // rim
    g.beginPath(); g.ellipse(x, y - R * 0.18, R, R * 0.34, 0, 0, Math.PI * 2);
    g.fillStyle = color; g.fill();
    g.lineWidth = 4.5; g.strokeStyle = INK; g.stroke();
  }

  function brothSurface(g, x, y, R) {
    g.beginPath(); g.ellipse(x, y - R * 0.18, R * 0.86, R * 0.27, 0, 0, Math.PI * 2);
    g.fillStyle = '#e8892a'; g.fill();
    g.beginPath(); g.ellipse(x - R * 0.2, y - R * 0.24, R * 0.5, R * 0.14, 0, 0, Math.PI * 2);
    g.fillStyle = '#f5a83d'; g.fill();
  }

  function noodleSwirls(g, x, y, R) {
    g.strokeStyle = '#ffd93d'; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      g.lineWidth = 5;
      g.beginPath();
      const yy = y - R * 0.3 + i * R * 0.11;
      g.moveTo(x - R * 0.62, yy);
      g.quadraticCurveTo(x - R * 0.3, yy - R * 0.14, x, yy);
      g.quadraticCurveTo(x + R * 0.3, yy + R * 0.14, x + R * 0.62, yy);
      g.stroke();
    }
    g.strokeStyle = '#ffe873'; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x - R * 0.5, y - R * 0.34);
    g.quadraticCurveTo(x, y - R * 0.52, x + R * 0.5, y - R * 0.3);
    g.stroke();
  }

  function narutomaki(g, x, y, r) {
    circle(g, x, y, r, '#ffffff');
    g.strokeStyle = '#ff6b9d'; g.lineWidth = 3.5; g.lineCap = 'round';
    g.beginPath();
    g.arc(x, y, r * 0.55, 0.4, Math.PI * 1.7);
    g.arc(x + r * 0.18, y + r * 0.1, r * 0.3, Math.PI * 1.5, Math.PI * 0.4, true);
    g.stroke();
  }

  function halvedEgg(g, x, y, r) {
    circle(g, x, y, r, '#ffffff');
    disc(g, x, y, r * 0.58, '#ff9f1c');
    disc(g, x - r * 0.16, y - r * 0.16, r * 0.2, '#ffc65c');
  }

  function onionScatter(g, x, y, R, n) {
    for (let i = 0; i < (n || 6); i++) {
      const a = i * 2.39, d = R * (0.25 + (i % 3) * 0.22);
      const px = x + Math.cos(a) * d, py = y - R * 0.18 + Math.sin(a) * d * 0.4;
      g.beginPath(); g.arc(px, py, R * 0.11, 0, Math.PI * 2);
      g.strokeStyle = '#2f9e44'; g.lineWidth = 3; g.stroke();
      g.beginPath(); g.arc(px, py, R * 0.05, 0, Math.PI * 2);
      g.strokeStyle = '#8ce99a'; g.lineWidth = 2; g.stroke();
    }
  }

  // ---- individual ingredient sprites -------------------------------------
  // s is the caller's half-size; sprites are drawn at R = s * 1.5 so they
  // fill their slot and read at thumbnail size.

  function drawNoodles(g, x, y, s) {
    const R = s * 1.5;
    drawBowlBase(g, x, y, R, '#e63946');
    brothSurface(g, x, y, R);
    noodleSwirls(g, x, y, R);
    narutomaki(g, x - R * 0.52, y - R * 0.3, R * 0.2);
    halvedEgg(g, x + R * 0.55, y - R * 0.26, R * 0.24);
    onionScatter(g, x, y, R, 5);
  }

  function drawRice(g, x, y, s) {
    const R = s * 1.5;
    drawBowlBase(g, x, y, R, '#4361ee');
    // heaped white rice dome on the rim
    g.beginPath(); g.ellipse(x, y - R * 0.2, R * 0.84, R * 0.3, 0, Math.PI, Math.PI * 2);
    g.closePath();
    g.fillStyle = '#ffffff'; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    disc(g, x - R * 0.4, y - R * 0.34, R * 0.2, '#ffffff');
    disc(g, x + R * 0.05, y - R * 0.44, R * 0.24, '#ffffff');
    disc(g, x + R * 0.45, y - R * 0.32, R * 0.18, '#ffffff');
    // grains + sesame
    g.fillStyle = '#dee2e6';
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.ellipse(x - R * 0.5 + i * R * 0.19, y - R * (0.3 + (i % 2) * 0.1), R * 0.05, R * 0.025, 0.6, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = INK;
    for (let i = 0; i < 5; i++) disc(g, x - R * 0.36 + i * R * 0.18, y - R * 0.42 + (i % 2) * R * 0.08, R * 0.035);
    shine(g, x - R * 0.55, y + R * 0.25, R * 0.16);
  }

  function drawBatter(g, x, y, s) { // okonomiyaki disc
    const R = s * 1.5;
    disc(g, x, y + R * 0.1, R * 0.98, INK);
    disc(g, x, y, R * 0.95, '#e9a13b');
    disc(g, x, y, R * 0.8, '#f2b950');
    // dark sauce pool + spiral
    disc(g, x, y, R * 0.58, '#7a3b12');
    g.strokeStyle = '#8f4a18'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.arc(x, y, R * 0.34, 0.3, Math.PI * 1.6); g.stroke();
    // mayo drizzle zigzag
    g.strokeStyle = '#fff8e7'; g.lineWidth = 4.5;
    g.beginPath();
    for (let i = 0; i <= 4; i++) {
      const px = x - R * 0.66 + i * R * 0.33, py = y - R * 0.42 + (i % 2) * R * 0.3;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
    g.beginPath();
    for (let i = 0; i <= 4; i++) {
      const px = x - R * 0.66 + i * R * 0.33, py = y + R * 0.28 + (i % 2) * R * 0.3;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
    // aonori specks
    g.fillStyle = '#2f9e44';
    for (let i = 0; i < 7; i++) {
      disc(g, x + Math.cos(i * 2.2) * R * 0.5, y + Math.sin(i * 2.2) * R * 0.42, R * 0.05);
    }
    shine(g, x - R * 0.4, y - R * 0.45, R * 0.18);
  }

  function drawPork(g, x, y, s, grilled) {
    const R = s * 1.5;
    const meat = grilled ? '#d96f4e' : '#ff8fa3';
    const meatDark = grilled ? '#b34a2e' : '#f9758f';
    const fat = grilled ? '#ffd9c4' : '#ffe3ec';
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * R * 0.34, oy = (1 - Math.abs(i - 1)) * -R * 0.16 + i * R * 0.1;
      g.save();
      g.translate(x + ox, y + oy); g.rotate((i - 1) * 0.28);
      g.beginPath(); g.ellipse(0, 0, R * 0.52, R * 0.34, 0, 0, Math.PI * 2);
      g.fillStyle = meat; g.fill();
      g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.ellipse(0, -R * 0.05, R * 0.4, R * 0.2, 0, 0, Math.PI * 2);
      g.fillStyle = meatDark; g.fill();
      // fat stripe
      g.strokeStyle = fat; g.lineWidth = R * 0.13; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-R * 0.34, R * 0.08); g.quadraticCurveTo(0, -R * 0.06, R * 0.34, R * 0.08); g.stroke();
      if (grilled) { // sear marks
        g.strokeStyle = 'rgba(90,35,10,0.8)'; g.lineWidth = 3;
        for (let k = -1; k <= 1; k++) {
          g.beginPath(); g.moveTo(k * R * 0.18 - R * 0.08, -R * 0.18); g.lineTo(k * R * 0.18 + R * 0.08, R * 0.14); g.stroke();
        }
      }
      g.restore();
    }
    shine(g, x - R * 0.3, y - R * 0.3, R * 0.14);
  }

  function drawEgg(g, x, y, s, grilled) {
    const R = s * 1.5;
    // wavy fried-egg white: overlapping blobs merged under one outline pass
    g.beginPath();
    const pts = 9;
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const rr = R * (0.78 + ((i * 37) % 3) * 0.13);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.78;
      if (i === 0) g.moveTo(px, py);
      else {
        const pa = ((i - 0.5) / pts) * Math.PI * 2;
        const pr = R * 0.95;
        g.quadraticCurveTo(x + Math.cos(pa) * pr, y + Math.sin(pa) * pr * 0.78, px, py);
      }
    }
    g.closePath();
    g.fillStyle = '#ffffff'; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    if (grilled) { // lacy crisped edge
      g.strokeStyle = '#e9a13b'; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, R * 0.82, Math.PI * 0.9, Math.PI * 1.5); g.stroke();
      g.beginPath(); g.arc(x, y, R * 0.82, Math.PI * 0.05, Math.PI * 0.45); g.stroke();
    }
    // yolk: a proud orange dome, clearly a yolk and never an eye
    disc(g, x, y, R * 0.44, INK);
    disc(g, x, y - R * 0.03, R * 0.42, grilled ? '#ff8c1a' : '#ffb703');
    disc(g, x, y - R * 0.08, R * 0.3, grilled ? '#ffa02e' : '#ffc93d');
    shine(g, x - R * 0.14, y - R * 0.2, R * 0.13);
  }

  function drawShrimp(g, x, y, s, grilled) {
    const R = s * 1.5;
    const body = grilled ? '#ff7b54' : '#ffa07a';
    const band = grilled ? '#ffd9c4' : '#ffe8d6';
    g.save();
    g.translate(x, y); g.rotate(-0.5);
    // tail fan
    g.beginPath();
    g.moveTo(R * 0.55, -R * 0.1);
    g.lineTo(R * 1.0, -R * 0.5); g.lineTo(R * 0.92, -R * 0.02);
    g.lineTo(R * 1.02, R * 0.34); g.lineTo(R * 0.52, R * 0.3);
    g.closePath();
    g.fillStyle = grilled ? '#e85d3d' : '#ff8fa3'; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    // curved segmented body: stacked arcs from tail to head
    const segs = 5;
    for (let i = segs - 1; i >= 0; i--) {
      const a = -0.4 + i * 0.52;
      const px = Math.sin(a) * R * 0.62, py = -Math.cos(a) * R * 0.62 + R * 0.28;
      const r = R * (0.42 - i * 0.035);
      circle(g, px, py, r, i % 2 ? band : body);
      disc(g, px, py, r * 0.72, body);
    }
    // head with eye + antennae
    const hx = Math.sin(-0.4) * R * 0.62, hy = -Math.cos(-0.4) * R * 0.62 + R * 0.28;
    disc(g, hx + R * 0.1, hy - R * 0.08, R * 0.07, INK);
    g.strokeStyle = INK; g.lineWidth = 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(hx - R * 0.1, hy - R * 0.2);
    g.quadraticCurveTo(hx - R * 0.5, hy - R * 0.55, hx - R * 0.85, hy - R * 0.45); g.stroke();
    g.beginPath(); g.moveTo(hx - R * 0.05, hy - R * 0.24);
    g.quadraticCurveTo(hx - R * 0.3, hy - R * 0.7, hx - R * 0.62, hy - R * 0.72); g.stroke();
    if (grilled) {
      g.strokeStyle = 'rgba(90,35,10,0.75)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-R * 0.2, -R * 0.5); g.lineTo(R * 0.1, -R * 0.2); g.stroke();
    }
    g.restore();
    shine(g, x - R * 0.34, y - R * 0.5, R * 0.12);
  }

  function drawOnion(g, x, y, s, chopped) {
    const R = s * 1.5;
    if (chopped) {
      // a scatter of bright green rings — unmistakably chopped spring onion
      const offs = [[0, -0.1], [-0.45, 0.18], [0.42, 0.22], [-0.2, -0.42], [0.3, -0.38], [0.02, 0.42], [-0.52, -0.2], [0.55, -0.05]];
      for (const o of offs) {
        const px = x + o[0] * R, py = y + o[1] * R;
        g.beginPath(); g.arc(px, py, R * 0.21, 0, Math.PI * 2);
        g.fillStyle = '#d3f9d8'; g.fill();
        g.lineWidth = 4.5; g.strokeStyle = '#2f9e44'; g.stroke();
        g.beginPath(); g.arc(px, py, R * 0.09, 0, Math.PI * 2);
        g.strokeStyle = '#51cf66'; g.lineWidth = 2.5; g.stroke();
      }
    } else {
      // a bunch of spring onions: white bulbs, long green blades, cut rings
      g.strokeStyle = '#37b24d'; g.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        g.lineWidth = R * 0.17;
        g.beginPath();
        g.moveTo(x + i * R * 0.2, y + R * 0.42);
        g.quadraticCurveTo(x + i * R * 0.3, y - R * 0.1, x + i * R * 0.16, y - R * 0.78);
        g.stroke();
      }
      for (let i = -1; i <= 1; i++) {
        g.beginPath(); g.ellipse(x + i * R * 0.24, y + R * 0.52, R * 0.15, R * 0.26, 0, 0, Math.PI * 2);
        g.fillStyle = '#f1fcf3'; g.fill();
        g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
      }
      g.beginPath(); g.arc(x + R * 0.62, y + R * 0.5, R * 0.17, 0, Math.PI * 2);
      g.fillStyle = '#d3f9d8'; g.fill();
      g.lineWidth = 4; g.strokeStyle = '#2f9e44'; g.stroke();
    }
  }

  function drawCorn(g, x, y, s) {
    const R = s * 1.5;
    // cob body
    g.beginPath(); g.ellipse(x, y, R * 0.52, R * 0.88, 0, 0, Math.PI * 2);
    g.fillStyle = '#ffd93d'; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    // kernel grid: plump dots in offset rows
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        const px = x - R * 0.3 + c * R * 0.3 + (r % 2) * R * 0.07;
        const py = y - R * 0.62 + r * R * 0.3;
        disc(g, px, py, R * 0.115, r % 2 ? '#ffcf3f' : '#ffe873');
        disc(g, px - R * 0.035, py - R * 0.035, R * 0.04, '#fff3bf');
      }
    }
    // husk leaves at the base
    g.beginPath();
    g.moveTo(x - R * 0.5, y + R * 0.45);
    g.quadraticCurveTo(x - R * 0.85, y + R * 0.95, x - R * 0.1, y + R * 0.82);
    g.quadraticCurveTo(x - R * 0.3, y + R * 0.55, x - R * 0.5, y + R * 0.45);
    g.closePath();
    g.fillStyle = '#51cf66'; g.fill();
    g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
    g.beginPath();
    g.moveTo(x + R * 0.5, y + R * 0.45);
    g.quadraticCurveTo(x + R * 0.85, y + R * 0.95, x + R * 0.1, y + R * 0.82);
    g.quadraticCurveTo(x + R * 0.3, y + R * 0.55, x + R * 0.5, y + R * 0.45);
    g.closePath();
    g.fillStyle = '#37b24d'; g.fill();
    g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
  }

  function drawNori(g, x, y, s) {
    const R = s * 1.5;
    g.save();
    g.translate(x, y); g.rotate(-0.14);
    rrect(g, -R * 0.72, -R * 0.82, R * 1.44, R * 1.64, 6, '#14532d');
    // sheen + inner sheet line
    g.beginPath();
    g.moveTo(-R * 0.55, R * 0.7); g.lineTo(R * 0.2, -R * 0.7); g.lineTo(R * 0.5, -R * 0.7); g.lineTo(-R * 0.25, R * 0.7);
    g.closePath();
    g.fillStyle = 'rgba(134,239,172,0.28)'; g.fill();
    g.strokeStyle = 'rgba(220,252,231,0.5)'; g.lineWidth = 2.5;
    g.strokeRect(-R * 0.55, -R * 0.65, R * 1.1, R * 1.3);
    g.restore();
  }

  // Draw one ingredient icon. id may be raw ('pork') or prepared
  // ('pork-grilled', 'onion-chopped'). s is the icon's half-size slot.
  function drawItemIcon(g, id, x, y, s) {
    const grilled = id.endsWith('-grilled');
    const chopped = id.endsWith('-chopped');
    const base = UR.rawOf(id);
    g.save();
    if (base === 'noodles') drawNoodles(g, x, y, s);
    else if (base === 'rice') drawRice(g, x, y, s);
    else if (base === 'batter') drawBatter(g, x, y, s);
    else if (base === 'pork') drawPork(g, x, y, s, grilled);
    else if (base === 'egg') drawEgg(g, x, y, s, grilled);
    else if (base === 'shrimp') drawShrimp(g, x, y, s, grilled);
    else if (base === 'onion') drawOnion(g, x, y, s, chopped);
    else if (base === 'corn') drawCorn(g, x, y, s);
    else if (base === 'nori') drawNori(g, x, y, s);
    g.restore();
  }

  // Food in a grill pan, recoloured by doneness stage so the FOOD ITSELF
  // tells the state: pale and matte when raw, rich and glossy at PERFECT,
  // darkening when overdone, blackened with smoke when burnt.
  function drawPanFood(g, ing, stage, x, y, now) {
    const s = 26;
    if (stage === 'perfect') { // golden halo behind perfect food
      g.save();
      g.globalAlpha = 0.5 + 0.25 * Math.sin(now * 8);
      disc(g, x, y, 37, '#ffd93d');
      g.restore();
    }
    drawItemIcon(g, ing + '-grilled', x, y, s);
    g.save();
    g.beginPath(); g.arc(x, y, 33, 0, Math.PI * 2); g.clip();
    if (stage === 'raw') {
      g.fillStyle = 'rgba(196,214,240,0.42)'; g.fillRect(x - 34, y - 34, 68, 68);
    } else if (stage === 'cooking') {
      g.fillStyle = 'rgba(255,190,90,0.16)'; g.fillRect(x - 34, y - 34, 68, 68);
    } else if (stage === 'overdone') {
      g.fillStyle = 'rgba(122,58,10,0.42)'; g.fillRect(x - 34, y - 34, 68, 68);
    } else if (stage === 'burnt') {
      // fully blackened: a near-opaque char layer, cracked char marks and
      // ash spots, so BURNT reads from the food alone, never from a label
      g.fillStyle = 'rgba(3,3,5,0.9)'; g.fillRect(x - 34, y - 34, 68, 68);
      g.fillStyle = 'rgba(38,38,44,0.95)';
      disc(g, x - 12, y - 6, 10); disc(g, x + 10, y + 8, 12); disc(g, x + 2, y - 14, 8); disc(g, x - 4, y + 16, 7);
      g.strokeStyle = 'rgba(120,120,130,0.85)'; g.lineWidth = 2.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - 22, y - 18); g.lineTo(x - 6, y - 2); g.lineTo(x - 14, y + 14); g.stroke();
      g.beginPath(); g.moveTo(x + 20, y - 20); g.lineTo(x + 8, y - 4); g.lineTo(x + 18, y + 10); g.stroke();
      g.beginPath(); g.moveTo(x - 24, y + 4); g.lineTo(x - 8, y + 6); g.stroke();
      g.fillStyle = 'rgba(190,190,200,0.5)';
      disc(g, x - 18, y + 20, 3); disc(g, x + 16, y - 24, 3); disc(g, x + 24, y + 18, 2.5);
    }
    g.restore();
    if (stage === 'perfect') { // shine sparkles
      g.fillStyle = '#ffffff';
      const tw = 3 + Math.sin(now * 10) * 1.5;
      for (const o of [[-20, -18], [22, -10], [4, -26]]) {
        g.save(); g.translate(x + o[0], y + o[1]);
        g.beginPath();
        g.moveTo(0, -tw * 2); g.lineTo(tw, 0); g.lineTo(0, tw * 2); g.lineTo(-tw, 0);
        g.closePath(); g.fill(); g.restore();
      }
    }
    if (stage === 'burnt' || stage === 'overdone') {
      // black smoke puffs curling up, denser when burnt
      const n = stage === 'burnt' ? 4 : 2;
      for (let i = 0; i < n; i++) {
        const ph = (now * 0.7 + i * 0.27) % 1;
        const px = x + Math.sin((ph * 5) + i * 2.1) * 9 + (i - 1.5) * 8;
        const py = y - 26 - ph * 42;
        g.save();
        g.globalAlpha = (stage === 'burnt' ? 0.75 : 0.45) * (1 - ph);
        disc(g, px, py, 6 + ph * 9, '#26222e');
        g.restore();
      }
    }
  }

  // Nori as it is actually served on a bowl: a small dark sheet laid FLAT
  // across the rim, never a big upright rectangle sticking out of the food.
  function drawNoriFlat(g, x, y, s) {
    g.save();
    g.translate(x, y); g.rotate(-0.1); g.scale(1, 0.52);
    rrect(g, -s * 0.95, -s * 0.62, s * 1.9, s * 1.24, 5, '#14532d');
    g.fillStyle = 'rgba(134,239,172,0.3)';
    g.fillRect(-s * 0.7, -s * 0.4, s * 1.4, s * 0.34);
    g.restore();
  }

  // A finished dish: the real bowl, filled component by component.
  function drawDish(g, dishId, x, y, s) {
    const dish = UR.dishById(dishId);
    if (!dish) return;
    const base = dish.components[0];
    const rest = dish.components.slice(1);
    const R = s * 1.35;
    if (base === 'batter') {
      drawItemIcon(g, 'batter', x, y, s * 1.15);
      rest.forEach((c, i) => {
        const off = (i - (rest.length - 1) / 2) * s * 0.78;
        if (c === 'nori') drawNoriFlat(g, x + off, y - s * 0.3, s * 0.45);
        else drawItemIcon(g, c, x + off, y - s * 0.18, s * 0.5);
      });
      return;
    }
    drawBowlBase(g, x, y, R, base === 'rice' ? '#4361ee' : '#e63946');
    if (base === 'rice') {
      g.beginPath(); g.ellipse(x, y - R * 0.2, R * 0.84, R * 0.3, 0, Math.PI, Math.PI * 2);
      g.closePath();
      g.fillStyle = '#ffffff'; g.fill();
      g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
      disc(g, x, y - R * 0.42, R * 0.22, '#ffffff');
    } else {
      brothSurface(g, x, y, R);
      noodleSwirls(g, x, y, R);
      narutomaki(g, x - R * 0.55, y - R * 0.3, R * 0.17);
    }
    // components sit IN the bowl, fanned across the surface; nori lies
    // flat on the rim instead of standing up out of the bowl
    rest.forEach((c, i) => {
      const off = (i - (rest.length - 1) / 2) * R * 0.62;
      if (c === 'nori') drawNoriFlat(g, x + off, y - R * 0.34, s * 0.42);
      else drawItemIcon(g, c, x + off, y - R * 0.22, s * 0.52);
    });
    if (dish.components.indexOf('onion-chopped') >= 0) onionScatter(g, x, y, R, 5);
    shine(g, x - R * 0.6, y + R * 0.3, R * 0.13);
  }

  window.UR = window.UR || {};
  window.UR.drawItemIcon = drawItemIcon;
  window.UR.drawDish = drawDish;
  window.UR.drawNoriFlat = drawNoriFlat;
  window.UR.drawPanFood = drawPanFood;
  window.UR.drawBowlBase = drawBowlBase;
  window.UR.rrect = rrect;
  window.UR.circle = circle;
})();

