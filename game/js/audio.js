/**
 * Lightweight audio hooks for DS-feel feedback (Web Audio, no assets required).
 */
(function (global) {
  "use strict";
  let ctx = null;
  function ac() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function beep(freq, dur, type, vol) {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.value = vol == null ? 0.04 : vol;
    o.connect(g); g.connect(c.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.stop(c.currentTime + dur + 0.02);
  }
  function pad(freqs, dur, vol) {
    const c = ac();
    if (!c) return;
    freqs.forEach((f, i) => {
      setTimeout(() => beep(f, dur, "sine", vol || 0.02), i * 40);
    });
  }
  global.DstAudio = {
    unlock() { ac(); },
    craft() { beep(520, 0.08); setTimeout(() => beep(680, 0.1), 70); },
    eat() { beep(180, 0.12, "triangle", 0.05); },
    hit() { beep(120, 0.06, "sawtooth", 0.045); },
    night() { pad([90, 70, 55], 0.45, 0.025); },
    day() { pad([220, 280, 330], 0.2, 0.02); },
    cave() { pad([60, 48, 40, 55], 0.5, 0.028); },
    sail() { beep(260, 0.1, "triangle", 0.035); setTimeout(() => beep(200, 0.18, "sine", 0.03), 90); },
    hound() { beep(140, 0.15, "sawtooth", 0.05); setTimeout(() => beep(100, 0.2, "sawtooth", 0.04), 120); },
    cook() { beep(300, 0.1, "triangle"); beep(400, 0.12, "triangle", 0.03); },
    warn() { beep(220, 0.08); setTimeout(() => beep(180, 0.12), 90); },
  };
})(window);
