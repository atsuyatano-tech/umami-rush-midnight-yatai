// render-food.js — every ingredient and dish, drawn as chunky flat shapes
// with thick dark outlines so they read at thumbnail size. No gradients.
(function () {
  'use strict';
  const UR = window.UR;
  const INK = '#171126';

  function circle(g, x, y, r, fill) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = fill; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
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

  function bowl(g, x, y, s, fill) {
    g.beginPath();
    g.arc(x, y, s * 0.52, 0.15 * Math.PI, 0.85 * Math.PI);
    g.closePath();
    g.fillStyle = fill; g.fill();
    g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    rrect(g, x - s * 0.6, y - s * 0.08, s * 1.2, s * 0.16, 4, fill);
  }

  // Draw one ingredient icon. id may be raw ('pork') or prepared
  // ('pork-grilled', 'onion-chopped'). s is the icon's half-size.
  function drawItemIcon(g, id, x, y, s) {
    const grilled = id.endsWith('-grilled');
    const chopped = id.endsWith('-chopped');
    const base = UR.rawOf(id);
    g.save();
    if (base === 'noodles') {
      bowl(g, x, y + s * 0.25, s, '#e63946');
      g.strokeStyle = '#ffd93d'; g.lineWidth = 4; g.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.moveTo(x - s * 0.45, y - s * 0.05 + i * s * 0.16);
        g.quadraticCurveTo(x, y - s * 0.3 + i * s * 0.16, x + s * 0.45, y - s * 0.05 + i * s * 0.16);
        g.stroke();
      }
    } else if (base === 'rice') {
      bowl(g, x, y + s * 0.25, s, '#4361ee');
      circle(g, x, y - s * 0.12, s * 0.42, '#f8f9fa');
      circle(g, x - s * 0.3, y + s * 0.02, s * 0.3, '#f8f9fa');
      circle(g, x + s * 0.3, y + s * 0.02, s * 0.3, '#f8f9fa');
    } else if (base === 'batter') {
      circle(g, x, y, s * 0.62, '#e9c46a');
      g.fillStyle = '#bc6c25';
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.arc(x + Math.cos(i * 2.4) * s * 0.32, y + Math.sin(i * 2.4) * s * 0.3, s * 0.09, 0, Math.PI * 2);
        g.fill();
      }
    } else if (base === 'pork') {
      for (let i = -1; i <= 1; i++) {
        rrect(g, x - s * 0.55 + i * s * 0.12, y - s * 0.34 + i * s * 0.3, s * 0.95, s * 0.3, s * 0.14, grilled ? '#cd7f5e' : '#ff8fa3');
      }
      g.strokeStyle = '#f8f9fa'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x - s * 0.4, y - s * 0.2); g.lineTo(x + s * 0.35, y - s * 0.2); g.stroke();
    } else if (base === 'egg') {
      g.beginPath();
      g.ellipse(x, y, s * 0.62, s * 0.48, 0, 0, Math.PI * 2);
      g.fillStyle = '#f8f9fa'; g.fill();
      g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
      circle(g, x + s * 0.08, y - s * 0.02, s * 0.27, '#ffb703');
    } else if (base === 'shrimp') {
      g.beginPath();
      g.arc(x, y, s * 0.5, Math.PI * 0.3, Math.PI * 1.75);
      g.strokeStyle = grilled ? '#e76f51' : '#ffa07a';
      g.lineWidth = s * 0.42; g.lineCap = 'round'; g.stroke();
      g.beginPath();
      g.arc(x, y, s * 0.5, Math.PI * 0.3, Math.PI * 1.75);
      g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#e76f51';
      g.beginPath();
      g.moveTo(x + s * 0.42, y - s * 0.42);
      g.lineTo(x + s * 0.78, y - s * 0.62);
      g.lineTo(x + s * 0.66, y - s * 0.18);
      g.closePath(); g.fill();
      g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    } else if (base === 'onion') {
      if (chopped) {
        g.fillStyle = '#51cf66';
        for (let i = 0; i < 7; i++) {
          const px = x + Math.cos(i * 2.2) * s * 0.34, py = y + Math.sin(i * 2.2) * s * 0.26;
          rrect(g, px - s * 0.13, py - s * 0.13, s * 0.26, s * 0.26, 3, i % 2 ? '#51cf66' : '#b2f2bb');
        }
      } else {
        g.strokeStyle = '#2f9e44'; g.lineWidth = s * 0.2; g.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
          g.beginPath();
          g.moveTo(x + i * s * 0.3, y + s * 0.5);
          g.quadraticCurveTo(x + i * s * 0.42, y, x + i * s * 0.22, y - s * 0.55);
          g.stroke();
        }
        circle(g, x, y + s * 0.48, s * 0.2, '#f8f9fa');
      }
    } else if (base === 'corn') {
      rrect(g, x - s * 0.3, y - s * 0.55, s * 0.6, s * 1.1, s * 0.28, '#ffd93d');
      g.fillStyle = '#f4a261';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
        g.beginPath();
        g.arc(x - s * 0.14 + c * s * 0.28, y - s * 0.3 + r * s * 0.3, s * 0.07, 0, Math.PI * 2);
        g.fill();
      }
    } else if (base === 'nori') {
      g.save();
      g.translate(x, y); g.rotate(-0.16);
      rrect(g, -s * 0.48, -s * 0.55, s * 0.96, s * 1.1, 4, '#1b4332');
      g.restore();
    }
    if (grilled && base !== 'pork' && base !== 'shrimp' && base !== 'egg') {
      g.strokeStyle = 'rgba(23,17,38,0.55)'; g.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.moveTo(x - s * 0.4, y + i * s * 0.28);
        g.lineTo(x + s * 0.4, y + i * s * 0.28 - s * 0.12);
        g.stroke();
      }
    }
    g.restore();
  }

  // A finished dish: a bowl/plate carrying its components, mini icons on top.
  function drawDish(g, dishId, x, y, s) {
    const dish = UR.dishById(dishId);
    if (!dish) return;
    const base = dish.components[0];
    if (base === 'batter') {
      circle(g, x, y + s * 0.18, s * 0.72, '#e9c46a');
    } else {
      bowl(g, x, y + s * 0.3, s * 1.05, base === 'rice' ? '#4361ee' : '#e63946');
      if (base === 'rice') {
        circle(g, x, y + s * 0.05, s * 0.45, '#f8f9fa');
      } else {
        g.strokeStyle = '#ffd93d'; g.lineWidth = 4; g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - s * 0.5, y + s * 0.05);
        g.quadraticCurveTo(x, y - s * 0.25, x + s * 0.5, y + s * 0.05);
        g.stroke();
      }
    }
    const rest = dish.components.slice(1);
    rest.forEach((c, i) => {
      const off = (i - (rest.length - 1) / 2) * s * 0.62;
      drawItemIcon(g, c, x + off, y - s * 0.12, s * 0.42);
    });
  }

  window.UR = window.UR || {};
  window.UR.drawItemIcon = drawItemIcon;
  window.UR.drawDish = drawDish;
  window.UR.rrect = rrect;
  window.UR.circle = circle;
})();
