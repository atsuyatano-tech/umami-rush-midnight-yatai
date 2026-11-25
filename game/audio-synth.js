// audio-synth.js — tiny WebAudio synth: chop tok, grill sizzle, serve bell,
// burn buzz. No audio files; everything is oscillators and filtered noise.
(function () {
  'use strict';

  let ctx = null;

  function ac(state) {
    if (state.muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function blip(state, freq, dur, type, gain) {
    const a = ac(state); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  }

  function noise(state, dur, freq, gain) {
    const a = ac(state); if (!a) return;
    const len = Math.max(1, (a.sampleRate * dur) | 0);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = a.createGain();
    g.gain.setValueAtTime(gain, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start();
  }

  const sfx = {
    chop(state) { blip(state, 190, 0.07, 'square', 0.16); noise(state, 0.05, 900, 0.1); },
    sizzle(state) { noise(state, 0.35, 3200, 0.06); },
    pickup(state) { blip(state, 520, 0.06, 'triangle', 0.12); },
    plate(state) { blip(state, 740, 0.08, 'triangle', 0.14); },
    bell(state) { blip(state, 1320, 0.4, 'sine', 0.2); blip(state, 1760, 0.3, 'sine', 0.1); },
    buzz(state) { blip(state, 130, 0.3, 'sawtooth', 0.16); },
    coin(state) { blip(state, 990, 0.09, 'square', 0.1); blip(state, 1480, 0.14, 'square', 0.08); }
  };

  window.UR = window.UR || {};
  window.UR.sfx = sfx;
})();
