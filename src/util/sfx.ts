/**
 * Tiny WebAudio SFX kit — zero asset files, lazy AudioContext (created on the
 * first user gesture so autoplay policies never block us).
 */
let ctx: AudioContext | undefined;

function audio(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return undefined;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  when: number,
  duration: number,
  gain = 0.08,
  type: OscillatorType = "sine"
) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + when);
  amp.gain.setValueAtTime(0.0001, ac.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + when + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + duration + 0.02);
}

/** Pitch slide helper for send/whoosh effects. */
function slide(from: number, to: number, when: number, duration: number, gain = 0.07) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(from, ac.currentTime + when);
  osc.frequency.exponentialRampToValueAtTime(to, ac.currentTime + when + duration);
  amp.gain.setValueAtTime(0.0001, ac.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + when + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + duration + 0.02);
}

export const sfx = {
  /** Message sent — quick bubbly pop up. */
  send() {
    slide(420, 880, 0, 0.09, 0.06);
  },
  /** Reaction tap — tiny tick. */
  react() {
    tone(660, 0, 0.05, 0.05, "triangle");
  },
  /** Incoming reply — soft double blip (skip for your own sends). */
  receive() {
    tone(520, 0, 0.07, 0.05);
    tone(780, 0.08, 0.09, 0.045);
  },
  /** Shop unlock — victory arpeggio. */
  success() {
    tone(523, 0, 0.09, 0.07);
    tone(659, 0.09, 0.09, 0.07);
    tone(784, 0.18, 0.16, 0.09);
  },
  /** Something failed — low buzz. */
  error() {
    tone(180, 0, 0.14, 0.07, "sawtooth");
    tone(140, 0.1, 0.16, 0.06, "sawtooth");
  },
  /** Tab/page click — subtle UI tick. */
  tick() {
    tone(880, 0, 0.03, 0.03, "square");
  },
};
