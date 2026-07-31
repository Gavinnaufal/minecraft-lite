export class AudioManager {
  private static instance: AudioManager;
  private audioCtx: AudioContext | null = null;
  private _sfxVolume = 1.0;
  private _musicVolume = 0.5;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }

  private initCtx(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playSFX(name: string): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.value = this._sfxVolume * 0.4;
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (name === 'break') {
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(2, now);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
    } else if (name === 'place') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (name === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (name.startsWith('footstep')) {
      const surface = name.split('_')[1] || 'dirt';
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (surface === 'grass') {
        // Soft muffled thud with light rustle
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        // Add soft noise rustle
        const bufSize = Math.floor(ctx.sampleRate * 0.04);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(now);
      } else if (surface === 'stone') {
        // Sharp metallic/stone tap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      } else if (surface === 'sand') {
        // Crunchy granular crunch
        const bufSize = Math.floor(ctx.sampleRate * 0.06);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2));
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.setValueAtTime(3, now);
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(now);
        return;
      } else if (surface === 'wood') {
        // Hollow wood knock
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      } else if (surface === 'water') {
        // Liquid splash
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      } else {
        // Default dirt step
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.04);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      }

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (name === 'hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (name === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (name === 'eat') {
      // Crunchy Munching Sound Effect
      for (let b = 0; b < 3; b++) {
        const offset = b * 0.08;
        const bufSize = Math.floor(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
        const noise = ctx.createBufferSource();
        noise.buffer = buf;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 + b * 200, now + offset);
        filter.Q.setValueAtTime(4, now + offset);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(now + offset);
      }
    } else if (name === 'cow_moo') {
      // Deep Cow Mooing Vibrato
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.75);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.75);
    } else if (name === 'zombie_groan') {
      // Creepy Low Zombie Groan
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.9);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.9);
    }
  }

  private ambientGain: GainNode | null = null;
  private ambientNoise: AudioBufferSourceNode | null = null;
  private cricketTimer = 0;

  updateAmbience(timeOfDay: number, deltaTime = 0.016): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;
    const targetGain = isNight ? 0.08 : 0.04;

    if (!this.ambientGain) {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.value = targetGain;
      this.ambientGain.connect(ctx.destination);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      this.ambientNoise = ctx.createBufferSource();
      this.ambientNoise.buffer = buffer;
      this.ambientNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      this.ambientNoise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientNoise.start();
    } else {
      this.ambientGain.gain.setTargetAtTime(targetGain * this._sfxVolume, ctx.currentTime, 1.0);
    }

    if (isNight) {
      this.cricketTimer += deltaTime;
      if (this.cricketTimer >= 3.5) {
        this.cricketTimer = 0;
        this.playCricketChirp(ctx);
      }
    }
  }

  private playCricketChirp(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(4500, now);
    osc.frequency.setValueAtTime(4700, now + 0.03);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.04 * this._sfxVolume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private isMusicPlaying = false;

  startMusic(): void {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const notes = [261.63, 329.63, 392.00, 493.88, 392.00, 329.63, 261.63, 196.00];
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || this._musicVolume <= 0.01) return;
      const ctx = this.initCtx();
      if (!ctx) return;

      const freq = notes[noteIdx % notes.length];
      noteIdx++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08 * this._musicVolume, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.5);
    }, 4000);
  }

  stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playMusic(name: string, _loop = true): void {
    if (name === 'stop') {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  get sfxVolume(): number {
    return this._sfxVolume;
  }

  setSFXVolume(v: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, v));
  }

  get musicVolume(): number {
    return this._musicVolume;
  }

  setMusicVolume(v: number): void {
    this._musicVolume = Math.max(0, Math.min(1, v));
  }
}
