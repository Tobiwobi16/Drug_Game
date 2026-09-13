// Lightweight Web Audio synthesizer for retro sound effects
let audioCtx: AudioContext | null = null;
let currentVolume = 0.7;

export function setSoundVolume(volume: number) {
  currentVolume = Math.max(0, Math.min(1, volume));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDoorSound(open: boolean) {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  if (open) {
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
  } else {
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
  }

  gain.gain.setValueAtTime(currentVolume * 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

export function playSitSound(sitting: boolean) {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(sitting ? 160 : 240, now);
  osc.frequency.exponentialRampToValueAtTime(sitting ? 90 : 180, now + 0.18);

  gain.gain.setValueAtTime(currentVolume * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

export function playPhoneBeep() {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.setValueAtTime(950, now + 0.05);

  gain.gain.setValueAtTime(currentVolume * 0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

export function playMessageSentSound() {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(1040, now + 0.09);

  gain.gain.setValueAtTime(currentVolume * 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.18);
}

export function playClickSound() {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now);

  gain.gain.setValueAtTime(currentVolume * 0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

export function playMessageReceivedSound() {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Two-tone pleasant retro chime: 880Hz then 1320Hz
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(880, now);
  osc2.frequency.setValueAtTime(1320, now + 0.09);

  gain.gain.setValueAtTime(currentVolume * 0.12, now);
  gain.gain.setValueAtTime(currentVolume * 0.12, now + 0.09);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.09);
  osc2.start(now + 0.09);
  osc2.stop(now + 0.28);
}

export function playCatMeowSound(type: 'happy' | 'weak' | 'purr' = 'happy') {
  if (currentVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'purr') {
    // Low frequency purring rumble with amplitude modulation
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, now); // ~24 Hz purr flutter

    lfoGain.gain.setValueAtTime(25, now);
    lfo.connect(osc.frequency);

    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(currentVolume * 0.18, now + 0.2);
    mainGain.gain.linearRampToValueAtTime(currentVolume * 0.14, now + 0.8);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(mainGain);
    mainGain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.2);
    osc.stop(now + 1.2);
    return;
  }

  // Retro stylized synth meow
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  filter.type = 'bandpass';
  filter.Q.setValueAtTime(2.5, now);

  if (type === 'weak') {
    // Slower, tired, lower-pitched soft whimper/meow
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.5);

    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(currentVolume * 0.09, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } else {
    // Happy, bright little meow
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.38);

    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + 0.38);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(currentVolume * 0.14, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }
}

/**
 * Procedural Apartment Ambience Generator
 * Provides:
 * - Constant quiet room tone and subtle refrigerator / electrical hum
 * - Randomized occasional ambient events: pipes/water sound, distant footsteps, building creaks, outside traffic
 */
export class ApartmentAmbienceManager {
  private isPlaying = false;
  private fridgeOsc: OscillatorNode | null = null;
  private fridgeGain: GainNode | null = null;
  private roomGain: GainNode | null = null;
  private roomNoiseNode: AudioBufferSourceNode | null = null;
  private timerId: number | null = null;

  public start() {
    if (this.isPlaying) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    this.isPlaying = true;
    const now = ctx.currentTime;

    try {
      // 1. Refrigerator / Transformer 60Hz hum with low-pass
      this.fridgeOsc = ctx.createOscillator();
      this.fridgeOsc.type = 'sawtooth';
      this.fridgeOsc.frequency.setValueAtTime(60, now);

      const fridgeFilter = ctx.createBiquadFilter();
      fridgeFilter.type = 'lowpass';
      fridgeFilter.frequency.setValueAtTime(180, now);

      this.fridgeGain = ctx.createGain();
      this.fridgeGain.gain.setValueAtTime(currentVolume * 0.045, now);

      this.fridgeOsc.connect(fridgeFilter);
      fridgeFilter.connect(this.fridgeGain);
      this.fridgeGain.connect(ctx.destination);

      this.fridgeOsc.start(now);

      // 2. Room Presence (Subtle filtered noise floor)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter for soft warm rumble
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.15;
      }

      this.roomNoiseNode = ctx.createBufferSource();
      this.roomNoiseNode.buffer = buffer;
      this.roomNoiseNode.loop = true;

      const roomFilter = ctx.createBiquadFilter();
      roomFilter.type = 'lowpass';
      roomFilter.frequency.setValueAtTime(240, now);

      this.roomGain = ctx.createGain();
      this.roomGain.gain.setValueAtTime(currentVolume * 0.04, now);

      this.roomNoiseNode.connect(roomFilter);
      roomFilter.connect(this.roomGain);
      this.roomGain.connect(ctx.destination);

      this.roomNoiseNode.start(now);

      // 3. Schedule periodic subtle ambient apartment events
      this.scheduleRandomEvent();
    } catch {
      // Audio context might be waiting for user gesture
    }
  }

  public updateVolume() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (this.fridgeGain) {
      this.fridgeGain.gain.setTargetAtTime(currentVolume * 0.045, now, 0.1);
    }
    if (this.roomGain) {
      this.roomGain.gain.setTargetAtTime(currentVolume * 0.04, now, 0.1);
    }
  }

  private scheduleRandomEvent = () => {
    if (!this.isPlaying) return;
    // Schedule next sound in 12 to 25 seconds
    const delay = 12000 + Math.random() * 13000;
    this.timerId = window.setTimeout(() => {
      this.triggerRandomApartmentEvent();
      this.scheduleRandomEvent();
    }, delay);
  };

  private triggerRandomApartmentEvent() {
    if (!this.isPlaying || currentVolume <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const eventTypes = ['pipe', 'creak', 'footsteps', 'traffic'];
    const selected = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const now = ctx.currentTime;

    if (selected === 'pipe') {
      // Water pipe clink/groan
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(currentVolume * 0.035, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (selected === 'creak') {
      // Wood floor settling creak
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.linearRampToValueAtTime(105, now + 0.18);
      osc.frequency.linearRampToValueAtTime(70, now + 0.35);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(currentVolume * 0.025, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (selected === 'footsteps') {
      // Muffled distant upstairs footsteps (2 soft thumps)
      for (let i = 0; i < 2; i++) {
        const stepTime = now + i * 0.45;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, stepTime);
        osc.frequency.exponentialRampToValueAtTime(40, stepTime + 0.15);

        gain.gain.setValueAtTime(0.001, stepTime);
        gain.gain.linearRampToValueAtTime(currentVolume * 0.03, stepTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, stepTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(stepTime);
        osc.stop(stepTime + 0.25);
      }
    } else if (selected === 'traffic') {
      // Faint distant outside traffic / wind gust
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.linearRampToValueAtTime(220, now + 1.2);
      filter.frequency.linearRampToValueAtTime(140, now + 2.5);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(currentVolume * 0.025, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 2.6);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    try {
      if (this.fridgeOsc) {
        this.fridgeOsc.stop();
        this.fridgeOsc.disconnect();
        this.fridgeOsc = null;
      }
      if (this.roomNoiseNode) {
        this.roomNoiseNode.stop();
        this.roomNoiseNode.disconnect();
        this.roomNoiseNode = null;
      }
    } catch {
      // Ignore cleanup error
    }
  }
}

export const apartmentAmbience = new ApartmentAmbienceManager();

