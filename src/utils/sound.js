// Original two-layer synthesis, 3× amplitude with bounded headroom.
// At max volume: .105 + .033 = .138 peak. One replacing release tail
// can briefly overlap: <= .276 combined (< -11 dBFS); no limiter needed.
// Slider stays linear; no music, samples or automatic motion audio.
let enabled = false,
  context,
  last = 0,
  lastHover = 0,
  voice,
  volume = 0.55;
export function soundEnabled() {
  return enabled;
}
export function soundVolume() {
  return volume;
}
export function restoreSound() {
  try {
    enabled = localStorage.getItem("portfolio-sound") === "on";
    const saved = localStorage.getItem("portfolio-volume");
    if (saved !== null && Number.isFinite(Number(saved)))
      volume = Math.max(0, Math.min(1, Number(saved)));
  } catch {}
  return enabled;
}
export function setVolume(value) {
  if (!Number.isFinite(value)) return volume;
  volume = Math.max(0, Math.min(1, value));
  try {
    localStorage.setItem("portfolio-volume", String(volume));
  } catch {}
  voice?.stop();
  voice = undefined;
  return volume;
}
export function setSound(value) {
  enabled = value;
  try {
    localStorage.setItem("portfolio-sound", value ? "on" : "off");
  } catch {}
  if (!value) {
    voice?.stop();
    voice = undefined;
  }
  return enabled;
}
export function playSound(kind = "select") {
  if (
    !enabled ||
    volume === 0 ||
    typeof window === "undefined" ||
    document.hidden ||
    performance.now() - last < 140
  )
    return;
  // Hover may reuse an unlocked context, but must never unlock audio or interrupt a cue.
  if (kind === "hover" && (!context || context.state !== "running" || voice || performance.now() - lastHover < 600)) return;
  if (kind === "hover") lastHover = performance.now();
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    if (context.state === "suspended") void context.resume().catch(() => {});
    if (context.state === "closed") return;
    last = performance.now();
    voice?.stop();
    const tones = {
      hover: [146.83, 130.81, 0.08],
      select: [180, 156, 0.16],
      project: [132, 98, 0.26],
      open: [164.81, 220, 0.22],
      close: [174.61, 130.81, 0.2],
      success: [196, 293.66, 0.26],
      secret: [110, 220, 0.3],
    };
    const [from, to, duration] = tones[kind] || tones.select,
      now = context.currentTime;
    let remaining = 2;
    let currentVoice;
    const layers = [1, 2].map((multiple, index) => {
      const osc = context.createOscillator(),
        gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(from * multiple, now);
      osc.frequency.exponentialRampToValueAtTime(
        to * multiple,
        now + duration * 0.65,
      );
      gain.gain.setValueAtTime(0.00001, now);
      gain.gain.exponentialRampToValueAtTime(
        (index ? 0.011 : 0.035) * 3 * volume * (kind === "hover" ? .28 : 1),
        now + 0.018,
      );
      gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        if (--remaining === 0 && voice === currentVoice) voice = undefined;
      };
      return { osc, gain };
    });
    // Short release avoids clicks on replacement/mute. At most a 24ms quiet tail.
    currentVoice = {
      stop() {
        for (const { osc, gain } of layers) {
          try {
            const at = context.currentTime;
            if (gain.gain.cancelAndHoldAtTime)
              gain.gain.cancelAndHoldAtTime(at);
            else {
              gain.gain.cancelScheduledValues(at);
              gain.gain.setValueAtTime(Math.max(0.00001, gain.gain.value), at);
            }
            gain.gain.exponentialRampToValueAtTime(0.00001, at + 0.018);
            osc.stop(at + 0.024);
          } catch {
            /* An already-ended voice is harmless. */
          }
        }
      },
    };
    voice = currentVoice;
  } catch {
    /* Optional audio never interrupts interaction. */
  }
}
export function pauseSound() {
  try {
    voice?.stop();
    voice = undefined;
    void context?.suspend();
  } catch {}
}
