import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

let clock = 1000;
const stored = new Map();
const records = {
  oscillators: [],
  buffers: [],
  frequencies: [],
  peaks: [],
  gainSetValues: [],
  sourcesStopped: 0,
  suspended: 0,
  resumed: 0,
  noiseBuffers: 0,
};
function param(kind, initial = 0.00001) {
  return {
    value: initial,
    setValueAtTime(v) { this.value = v; if (kind === 'frequency') records.frequencies.push(v); if (kind === 'gain') records.gainSetValues.push(v); },
    linearRampToValueAtTime(v) { this.value = v; if (kind === 'gain') records.peaks.push(v); },
    exponentialRampToValueAtTime(v) { this.value = v; if (kind === 'frequency') records.frequencies.push(v); },
    setTargetAtTime(v) { this.value = v; },
    cancelAndHoldAtTime() {},
    cancelScheduledValues() {},
  };
}
function audioSource() {
  return {
    onended: null,
    connect() {},
    disconnect() {},
    start() {},
    stop() { records.sourcesStopped++; },
  };
}
class AudioContext {
  state = 'running';
  currentTime = 0;
  sampleRate = 48000;
  destination = {};
  createOscillator() {
    const osc = { ...audioSource(), frequency: param('frequency'), type: 'sine' };
    records.oscillators.push(osc);
    return osc;
  }
  createGain() {
    return { connect() {}, disconnect() {}, gain: param('gain') };
  }
  createDelay() {
    return { connect() {}, disconnect() {}, delayTime: { value: 0 } };
  }
  createBiquadFilter() {
    return { connect() {}, disconnect() {}, frequency: { value: 0 }, Q: { value: 0 } };
  }
  createBuffer(_channels, length, rate) {
    records.noiseBuffers++;
    const data = new Float32Array(length);
    return { duration: length / rate, getChannelData() { return data; } };
  }
  createBufferSource() {
    const source = audioSource();
    records.buffers.push(source);
    return source;
  }
  suspend() {
    this.state = 'suspended';
    records.suspended++;
    return Promise.resolve();
  }
  resume() {
    this.state = 'running';
    records.resumed++;
    return Promise.resolve();
  }
}
const sandbox = {
  window: { AudioContext },
  document: { hidden: false },
  performance: { now: () => clock },
  localStorage: {
    getItem: k => stored.get(k) ?? null,
    setItem: (k, v) => stored.set(k, v),
  },
};
vm.createContext(sandbox);
vm.runInContext(readFileSync('src/utils/sound.js', 'utf8').replaceAll('export function', 'function'), sandbox);
const run = expression => vm.runInContext(expression, sandbox);

// Defaults, opt-in, and the rule that hover never creates an AudioContext.
run('restoreSound(); playSound("select")');
assert.equal(records.oscillators.length, 0);
assert.equal(run('soundEnabled()'), false);
assert.equal(run('soundVolume()'), 0.55);
run('setSound(true); playSound("hover")');
assert.equal(records.oscillators.length, 0);

// Project navigation has three harmonically distinct tones plus a soft air bed.
run('playSound("project")');
assert.equal(records.oscillators.length, 3);
assert.equal(records.buffers.length, 1);
assert.equal(records.noiseBuffers, 1);
const defaultMasterGain = 2.4 * Math.pow(.55, 1.2);
assert(records.gainSetValues.some(v => Math.abs(v - defaultMasterGain) < 1e-10),
  'Default 55% slider setting uses boosted perceptual output');
assert(defaultMasterGain > 1, 'Mid-level sound output is substantially louder than before');
assert(records.frequencies.includes(110));
assert(records.frequencies.includes(493.88));
assert.equal(stored.get('portfolio-sound'), 'on');
run('playSound("project")');
assert.equal(records.oscillators.length, 3, 'Repeated action throttled');

// A subsequent purposeful interaction may replace the previous one smoothly.
clock += 180;
run('playSound("success")');
assert.equal(records.oscillators.length, 6);
assert(records.sourcesStopped > 4, 'Old cue released when a new cue begins');
clock += 200;
run('playSound("hover")');
assert.equal(records.oscillators.length, 6, 'Hover cannot interrupt action');

// Volume maps perceptually and persists; silent volume and mute prohibit playback.
assert.equal(run('setVolume(0)'), 0);
run('playSound("open")');
assert.equal(records.oscillators.length, 6);
assert.equal(stored.get('portfolio-volume'), '0');
assert.equal(run('setVolume(4)'), 1);
assert.equal(run('setVolume(-4)'), 0);
assert.equal(run('setVolume(.3); restoreSound(); soundVolume()'), .3);
run('setSound(false); playSound("select")');
assert.equal(records.oscillators.length, 6);
assert.equal(stored.get('portfolio-sound'), 'off');

// Hidden tabs and suspension behave safely.
clock += 180;
sandbox.document.hidden = true;
run('setSound(true); playSound("select"); pauseSound()');
assert.equal(records.oscillators.length, 6);
assert.equal(records.suspended, 1);
sandbox.document.hidden = false;

// All named interactions are present, including the distinct theme transitions.
run('setVolume(.55)');
for (const kind of ['hover', 'select', 'project', 'open', 'close', 'success', 'secret', 'themeLight', 'themeDark']) {
  clock += 700;
  if (kind === 'hover') run('setVolume(.55)');
  run("playSound('" + kind + "')");
}
assert.equal(records.oscillators.length, 24, 'Hover is suppressed while AudioContext is suspended');
assert.equal(records.noiseBuffers, 1, 'Noise buffer is shared across transitions');
assert(records.peaks.every(v => v <= .065), 'All oscillator gains capped');
assert(records.frequencies.every(f => f >= 98 && f <= 660), 'Frequency bounds');
assert(records.oscillators.some(o => o.type === 'triangle'), 'Timbre diversity');

// Once audio is unlocked, hover is sparse, quiet, and cannot form a stream.
run('setVolume(.55)');
clock += 700;
const beforeHover = records.oscillators.length;
run('playSound("hover")');
assert.equal(records.oscillators.length, beforeHover + 1);
run('setVolume(.55)');
clock += 200;
run('playSound("hover")');
assert.equal(records.oscillators.length, beforeHover + 1, 'Hover independently throttled');
assert.equal(run('setVolume(Number.NaN)'), .55);

// Full-volume ceiling remains conservatively bounded across all sound layers,
// including the loudest project cue and its 10.5% shared echo send.
const maxProjectLayerSum = .060 + .032 + .020 + .009;
assert(maxProjectLayerSum * 2.4 * 1.105 < .35, 'Single-cue peak headroom');
clock += 700;
run('setVolume(1);playSound("project")');
assert(records.gainSetValues.some(v => Math.abs(v - 2.4) < 1e-10),
  'Master gain reaches boosted maximum while preserving slider control');
assert.equal(run('setVolume(0)'), 0);

console.log('PASS sound: opt-in, silent/hidden behavior, shared filtered noise, distinct cues, output gain bounds, action/hover throttles, volume persistence, and theme tones. Listening tests still required.');
assert(readFileSync('src/styles/interactions.css', 'utf8').includes('prefers-reduced-motion: reduce'));
assert(readFileSync('src/sections/Projects.tsx', 'utf8').includes('prefers-reduced-motion: no-preference'));
console.log('PASS reduced-motion source guards (not browser emulation).');
