// Original, opt-in sonic identity. All sounds are synthesized locally through Web Audio.
// No downloaded assets, background music, autoplay, or sound tied to continuous motion.
const SILENCE = 0.00001;
const ACTION_GAP_MS = 115;
const HOVER_GAP_MS = 650;

let enabled = false;
let volume = 0.55;
let context;
let noiseBuffer;
let echoNode;
let voice;
let lastAction = -Infinity;
let lastHover = -Infinity;

// Notes: [startHz, endHz, delaySeconds, durationSeconds, peakGain, waveform].
// Delays and different timbres give each action its own recognizable character.
const CUES = {
  hover: {
    notes: [[370, 330, 0, 0.065, 0.017, 'sine']],
  },
  select: {
    notes: [
      [240, 195, 0, 0.135, 0.052, 'sine'],
      [480, 390, 0.006, 0.085, 0.014, 'triangle'],
    ],
  },
  project: {
    notes: [
      [146.83, 110, 0, 0.27, 0.060, 'sine'],
      [293.66, 329.63, 0.080, 0.20, 0.024, 'triangle'],
      [440, 493.88, 0.138, 0.165, 0.013, 'sine'],
    ],
    air: [0.045, 0.165, 0.009, 1100],
    echo: true,
  },
  open: {
    notes: [
      [196, 246.94, 0, 0.205, 0.047, 'sine'],
      [392, 493.88, 0.046, 0.155, 0.015, 'triangle'],
    ],
    air: [0.020, 0.130, 0.006, 1500],
    echo: true,
  },
  close: {
    notes: [
      [246.94, 185, 0, 0.165, 0.046, 'sine'],
      [493.88, 370, 0, 0.105, 0.012, 'triangle'],
    ],
  },
  success: {
    notes: [
      [329.63, 329.63, 0, 0.150, 0.032, 'sine'],
      [440, 440, 0.080, 0.160, 0.034, 'sine'],
      [554.37, 554.37, 0.155, 0.170, 0.028, 'triangle'],
    ],
  },
  secret: {
    notes: [
      [110, 164.81, 0, 0.285, 0.065, 'sine'],
      [440, 660, 0.100, 0.240, 0.016, 'triangle'],
    ],
    air: [0.030, 0.170, 0.008, 930],
    echo: true,
  },
  themeLight: {
    notes: [
      [261.63, 329.63, 0, 0.150, 0.044, 'sine'],
      [523.25, 659.25, 0.060, 0.150, 0.016, 'triangle'],
    ],
  },
  themeDark: {
    notes: [
      [329.63, 261.63, 0, 0.165, 0.048, 'sine'],
      [659.25, 523.25, 0.040, 0.125, 0.014, 'triangle'],
    ],
  },
};

export function soundEnabled() {
  return enabled;
}
export function soundVolume() {
  return volume;
}
export function restoreSound() {
  try {
    enabled = localStorage.getItem('portfolio-sound') === 'on';
    const saved = localStorage.getItem('portfolio-volume');
    if (saved !== null && Number.isFinite(Number(saved)))
      volume = Math.max(0, Math.min(1, Number(saved)));
  } catch {
    // Local storage can be blocked; sound remains optional.
  }
  return enabled;
}
export function setVolume(value) {
  if (!Number.isFinite(value)) return volume;
  volume = Math.max(0, Math.min(1, value));
  try {
    localStorage.setItem('portfolio-volume', String(volume));
  } catch {}
  voice?.stop();
  voice = undefined;
  return volume;
}
export function setSound(value) {
  enabled = Boolean(value);
  try {
    localStorage.setItem('portfolio-sound', enabled ? 'on' : 'off');
  } catch {}
  if (!enabled) {
    voice?.stop();
    voice = undefined;
  }
  return enabled;
}

// The buffer is generated once per AudioContext, not allocated per interaction.
function filteredNoiseBuffer(audio) {
  if (noiseBuffer) return noiseBuffer;
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.35), audio.sampleRate);
  const samples = buffer.getChannelData(0);
  let state = 0x9e3779b9;
  for (let i = 0; i < samples.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    samples[i] = (state / 4294967295) * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

function envelope(audio, target, start, duration, peak) {
  const gain = audio.createGain();
  const attack = Math.min(0.014, duration * 0.22);
  const release = duration * 0.42;
  gain.gain.setValueAtTime(SILENCE, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.setTargetAtTime(Math.max(SILENCE, peak * 0.60), start + attack, release * 0.24);
  gain.gain.exponentialRampToValueAtTime(SILENCE, start + duration);
  gain.connect(target);
  return gain;
}

function startVoice(audio, cue, name) {
  const now = audio.currentTime;
  const bus = audio.createGain();
  // Perceptual volume taper makes 20–50% settings easier to control.
  bus.gain.setValueAtTime(Math.pow(volume, 1.5), now);
  bus.connect(audio.destination);
  const sources = [];
  let active = 0;
  let currentVoice;
  const attach = (source, endTime) => {
    active++;
    sources.push(source);
    source.onended = () => {
      try { source.disconnect(); } catch {}
      if (--active === 0) {
        try { bus.disconnect(); } catch {}
        if (voice === currentVoice) voice = undefined;
      }
    };
    source.stop(endTime + 0.015);
  };

  if (cue.echo && typeof audio.createDelay === 'function') {
    // A shared, quiet early reflection; never accumulate echo nodes per cue.
    if (!echoNode) {
      const wet = audio.createGain();
      echoNode = audio.createDelay(0.2);
      echoNode.delayTime.value = 0.065;
      wet.gain.value = 0.105;
      echoNode.connect(wet);
      wet.connect(audio.destination);
    }
    bus.connect(echoNode);
  }

  for (const [from, to, delay, duration, peak, type] of cue.notes) {
    const start = now + delay;
    const osc = audio.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, start + duration * 0.70);
    const gain = envelope(audio, bus, start, duration, peak);
    osc.connect(gain);
    osc.start(start);
    attach(osc, start + duration);
  }

  // Soft, filtered breath is used only on dimensional transitions, never hover.
  if (cue.air && typeof audio.createBuffer === 'function' && typeof audio.createBufferSource === 'function'
      && typeof audio.createBiquadFilter === 'function') {
    const [delay, duration, peak, cutoff] = cue.air;
    const start = now + delay;
    const source = audio.createBufferSource();
    source.buffer = filteredNoiseBuffer(audio);
    const bandpass = audio.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = cutoff;
    bandpass.Q.value = 0.75;
    source.connect(bandpass);
    bandpass.connect(envelope(audio, bus, start, duration, peak));
    source.start(start);
    attach(source, start + duration);
  }

  currentVoice = {
    kind: name,
    stop() {
      const at = audio.currentTime;
      try {
        if (bus.gain.cancelAndHoldAtTime) bus.gain.cancelAndHoldAtTime(at);
        else {
          bus.gain.cancelScheduledValues(at);
          bus.gain.setValueAtTime(Math.max(SILENCE, bus.gain.value), at);
        }
        bus.gain.exponentialRampToValueAtTime(SILENCE, at + 0.020);
      } catch {}
      for (const source of sources) {
        try { source.stop(at + 0.025); } catch {}
      }
    },
  };
  return currentVoice;
}

export function playSound(kind = 'select') {
  if (!enabled || volume === 0 || typeof window === 'undefined' || document.hidden) return;
  const isHover = kind === 'hover';
  const timestamp = performance.now();
  if (isHover) {
    // Pointer movement must not unlock audio, interrupt a cue, or become a sound stream.
    if (!context || context.state !== 'running' || voice || timestamp - lastHover < HOVER_GAP_MS)
      return;
  } else if (timestamp - lastAction < ACTION_GAP_MS) return;

  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (context?.state === 'closed') {
      context = undefined;
      noiseBuffer = undefined;
      echoNode = undefined;
    }
    context ||= new Audio();
    if (context.state === 'suspended') void context.resume().catch(() => {});
    if (isHover) lastHover = timestamp;
    else lastAction = timestamp;
    voice?.stop();
    voice = startVoice(context, CUES[kind] || CUES.select, kind);
  } catch {
    // Audio never blocks navigation, forms, or project interactions.
  }
}

export function pauseSound() {
  try {
    voice?.stop();
    voice = undefined;
    void context?.suspend();
  } catch {}
}
