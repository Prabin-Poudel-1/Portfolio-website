// Original synthesized UI tones. No downloaded samples, music, or scroll audio.
let enabled = false,
  context,
  last = 0,
  voice;
export function soundEnabled() {
  return enabled;
}
export function restoreSound() {
  try {
    enabled = localStorage.getItem("portfolio-sound") === "on";
  } catch {}
  return enabled;
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
    typeof window === "undefined" ||
    document.hidden ||
    performance.now() - last < 110
  )
    return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    // Called only by user gestures (or their completed action), never on mount.
    if (context.state === "suspended") void context.resume().catch(() => {});
    if (context.state === "closed") return;
    last = performance.now();
    voice?.stop();
    const osc = context.createOscillator(),
      gain = context.createGain(),
      now = context.currentTime;
    const tones = {
      select: [440, 660],
      project: [220, 440],
      open: [330, 660],
      close: [440, 220],
      success: [660, 880],
      secret: [330, 990],
    };
    const [from, to] = tones[kind] || tones.select;
    osc.type = "sine";
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(to, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(now + 0.18);
    voice = osc;
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      if (voice === osc) voice = undefined;
    };
  } catch {
    /* Audio is optional; never interrupt navigation. */
  }
}
export function pauseSound() {
  try {
    voice?.stop();
    voice = undefined;
    void context?.suspend();
  } catch {}
}
