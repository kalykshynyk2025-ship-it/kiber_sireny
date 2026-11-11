/**
 * Web Audio API synthesizer for theater sirens and cyber alerts
 * Designed specifically for live stage cues and zero-latency triggers.
 */

export interface SirenDefinition {
  id: string;
  name: string;
  subtitle: string;
  category: 'siren' | 'cyber' | 'alarm' | 'cinematic';
  accentColor: 'lime' | 'violet' | 'cyan' | 'amber' | 'red';
  hotkey: string;
  description: string;
  recommendedForCue?: boolean;
}

export const SIREN_LIST: SirenDefinition[] = [
  {
    id: 'blade_runner_drone',
    name: 'Бегущий по лезвию',
    subtitle: 'Vangelis / Zimmer Synth Braam',
    category: 'cinematic',
    accentColor: 'lime',
    hotkey: '1',
    description: 'Зловещий низкий синтезаторный ревун браам с аналоговым фильтром. Идеально под реплику Прис.',
    recommendedForCue: true,
  },
  {
    id: 'air_raid',
    name: 'Воздушная тревога',
    subtitle: 'Mechanical Air Raid Siren',
    category: 'siren',
    accentColor: 'amber',
    hotkey: '2',
    description: 'Классическая механическая сирена ГО с плавным нарастанием и спадом высоты тона.',
  },
  {
    id: 'red_alert',
    name: 'Красная тревога',
    subtitle: 'Reactor Breach / Klaxon',
    category: 'alarm',
    accentColor: 'red',
    hotkey: '3',
    description: 'Резкий пульсирующий корабельный ревун аварии реактора и эвакуации.',
    recommendedForCue: true,
  },
  {
    id: 'cyber_police',
    name: 'Кибер-полиция Yelp',
    subtitle: 'High-Speed Patrol Siren',
    category: 'siren',
    accentColor: 'cyan',
    hotkey: '4',
    description: 'Ультразвуковой скоростной вой полицейского перехватчика Лос-Анджелеса 2019/2049.',
  },
  {
    id: 'replicant_glitch',
    name: 'Сбой репликанта',
    subtitle: 'Nexus-6 Neural Panic',
    category: 'cyber',
    accentColor: 'violet',
    hotkey: '5',
    description: 'Ритмичный модулированный цифровой сигнал сбоя био-электроники и паники.',
    recommendedForCue: true,
  },
  {
    id: 'deep_foghorn',
    name: 'Оцепление сектора',
    subtitle: 'Sector Lockdown Foghorn',
    category: 'cinematic',
    accentColor: 'violet',
    hotkey: '6',
    description: 'Глубокий урбанистический туманный горн мегаполиса сквозь кислотный дождь.',
  },
  {
    id: 'quarantine_hilo',
    name: 'Карантин / Hi-Lo',
    subtitle: 'Two-Tone Biohazard',
    category: 'siren',
    accentColor: 'lime',
    hotkey: '7',
    description: 'Двухтональная тревога биологического заражения и оцепления карантинной зоны.',
  },
  {
    id: 'fire_alarm',
    name: 'Пожарный строб-зуммер',
    subtitle: 'Industrial Evac Strobe',
    category: 'alarm',
    accentColor: 'red',
    hotkey: '8',
    description: 'Пронзительный прерывистый сигнал тревоги пожарной автоматики (3 импульса).',
  },
  {
    id: 'phaser_sweep',
    name: 'Штурмовой фазер',
    subtitle: 'Fast Piercing Sweep',
    category: 'cyber',
    accentColor: 'cyan',
    hotkey: '9',
    description: 'Высокочастотный свистящий сканирующий импульс защиты периметра.',
  },
  {
    id: 'sonar_ping',
    name: 'Глубокий сонар',
    subtitle: 'Sub-City Echo Radar',
    category: 'cyber',
    accentColor: 'violet',
    hotkey: '0',
    description: 'Холодный гидроакустический импульс сканирования нижних уровней города.',
  },
  {
    id: 'perimeter_alarm',
    name: 'Прорыв периметра',
    subtitle: 'Breach Sweep & Noise',
    category: 'siren',
    accentColor: 'amber',
    hotkey: '-',
    description: 'Нарастающая тревога с резкими шумовыми выбросами и всплесками давления.',
  },
  {
    id: 'lockdown_siren',
    name: 'Полная изоляция',
    subtitle: 'Dissonant Cyber Siren',
    category: 'alarm',
    accentColor: 'lime',
    hotkey: '=',
    description: 'Диссонирующая сдвоенная тревога о немедленном запечатывании гермоворот.',
  },
];

interface ActiveVoice {
  id: string;
  stop: () => void;
  gainNode: GainNode;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private activeVoices: Map<string, ActiveVoice> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.85;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public isMute(): boolean {
    return this.isMuted;
  }

  public isPlaying(id: string): boolean {
    return this.activeVoices.has(id);
  }

  public getPlayingIds(): string[] {
    return Array.from(this.activeVoices.keys());
  }

  /**
   * CRITICAL THEATER FEATURE:
   * Instant panic cutoff for all voices immediately.
   */
  public stopAll() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Smooth micro-fade to avoid popping, then full stop
    for (const [id, voice] of this.activeVoices.entries()) {
      try {
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
        voice.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.04);
        setTimeout(() => {
          voice.stop();
        }, 50);
      } catch {
        voice.stop();
      }
      this.activeVoices.delete(id);
    }
    this.activeVoices.clear();
  }

  public stopSound(id: string) {
    const voice = this.activeVoices.get(id);
    if (!voice || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      voice.gainNode.gain.cancelScheduledValues(now);
      voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
      voice.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      setTimeout(() => {
        voice.stop();
      }, 60);
    } catch {
      voice.stop();
    }
    this.activeVoices.delete(id);
  }

  public playSound(id: string, loop: boolean = true) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // If already playing, stop it (toggle off)
    if (this.activeVoices.has(id)) {
      this.stopSound(id);
      return;
    }

    // USER REQUIREMENT: Only one sound plays at a time.
    // Stop all other running sounds immediately before starting the new one.
    this.stopAll();

    const now = this.ctx.currentTime;
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(1.0, now + 0.08);
    voiceGain.connect(this.masterGain);

    const cleanupFns: Array<() => void> = [];

    // Synthesize based on ID
    switch (id) {
      case 'blade_runner_drone': {
        // Apocalyptic synth braam / brass horn from 2049
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const oscSub = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const dist = this.ctx.createWaveShaper();

        // Distortion curve
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = ((Math.PI + 4) * x) / (Math.PI + 4 * Math.abs(x));
        }
        dist.curve = curve;
        dist.oversample = '2x';

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        oscSub.type = 'sawtooth';

        const baseFreq = 55; // Deep A1
        osc1.frequency.setValueAtTime(baseFreq * 2, now); // 110Hz
        osc2.frequency.setValueAtTime(baseFreq * 2 + 1.2, now); // Slight chorus detune
        oscSub.frequency.setValueAtTime(baseFreq, now); // Sub-bass 55Hz

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(5.5, now);
        filter.frequency.setValueAtTime(220, now);

        if (loop) {
          // Slow pulsing filter sweep like a breathing dark siren
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.frequency.setValueAtTime(0.25, now); // 4-second period
          lfoGain.gain.setValueAtTime(1400, now);
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          lfo.start(now);
          cleanupFns.push(() => lfo.stop());
        } else {
          // Powerful braam hit
          filter.frequency.exponentialRampToValueAtTime(2800, now + 0.35);
          filter.frequency.exponentialRampToValueAtTime(250, now + 3.8);
          voiceGain.gain.setValueAtTime(1.0, now + 3.0);
          voiceGain.gain.linearRampToValueAtTime(0.0001, now + 4.2);
          setTimeout(() => this.stopSound(id), 4300);
        }

        osc1.connect(filter);
        osc2.connect(filter);
        oscSub.connect(filter);
        filter.connect(dist);
        dist.connect(voiceGain);

        osc1.start(now);
        osc2.start(now);
        oscSub.start(now);

        cleanupFns.push(() => {
          try {
            osc1.stop();
            osc2.stop();
            oscSub.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'air_raid': {
        // WW2 mechanical siren: slow rising/falling frequency between 280Hz and 680Hz
        const osc = this.ctx.createOscillator();
        const oscDetune = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        oscDetune.type = 'triangle';
        oscDetune.detune.setValueAtTime(12, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'triangle';
        lfo.frequency.setValueAtTime(0.22, now); // ~4.5s cycle
        lfoGain.gain.setValueAtTime(220, now);

        osc.frequency.setValueAtTime(450, now);
        oscDetune.frequency.setValueAtTime(450, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfoGain.connect(oscDetune.frequency);

        osc.connect(filter);
        oscDetune.connect(filter);
        filter.connect(voiceGain);

        lfo.start(now);
        osc.start(now);
        oscDetune.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc.stop();
            oscDetune.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'red_alert': {
        // Red alert klaxon: Repeating "BRAAAP" pulses
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(445, now);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(880, now);
        filter.Q.setValueAtTime(3.0, now);

        // Pulse LFO: 1 second on/off
        const lfo = this.ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(1.2, now); // 1.2 Hz pulses

        // Modulate frequency slightly up on each blast
        const modOsc = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        modOsc.type = 'sawtooth';
        modOsc.frequency.setValueAtTime(1.2, now);
        modGain.gain.setValueAtTime(80, now);
        modOsc.connect(modGain);
        modGain.connect(osc1.frequency);
        modGain.connect(osc2.frequency);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(pulseGain);
        pulseGain.connect(voiceGain);

        // Gain pulses
        const pulseLFO = this.ctx.createOscillator();
        pulseLFO.type = 'square';
        pulseLFO.frequency.setValueAtTime(1.2, now);
        const pGain = this.ctx.createGain();
        pGain.gain.setValueAtTime(0.5, now);
        pulseLFO.connect(pGain);
        pGain.connect(pulseGain.gain);

        osc1.start(now);
        osc2.start(now);
        modOsc.start(now);
        pulseLFO.start(now);

        cleanupFns.push(() => {
          try {
            osc1.stop();
            osc2.stop();
            modOsc.stop();
            pulseLFO.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'cyber_police': {
        // Rapid futuristic patrol vehicle yelp: 750Hz to 1450Hz at 2.4Hz speed
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        subOsc.type = 'square';
        subOsc.frequency.setValueAtTime(500, now);

        osc.frequency.setValueAtTime(1050, now);
        lfo.type = 'sawtooth';
        lfo.frequency.setValueAtTime(2.2, now); // Fast yelp
        lfoGain.gain.setValueAtTime(450, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.2, now);
        subOsc.connect(subGain);

        osc.connect(voiceGain);
        subGain.connect(voiceGain);

        lfo.start(now);
        osc.start(now);
        subOsc.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc.stop();
            subOsc.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'replicant_glitch': {
        // Ring-modulated glitch siren with erratic harmonic shifts
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(780, now);

        modulator.type = 'square';
        modulator.frequency.setValueAtTime(28, now); // Ring-mod buzz
        modGain.gain.setValueAtTime(350, now);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(400, now);

        // Stutter rhythm
        const stutterLfo = this.ctx.createOscillator();
        stutterLfo.type = 'square';
        stutterLfo.frequency.setValueAtTime(8, now); // 8Hz glitch chop
        const stutterGain = this.ctx.createGain();
        stutterGain.gain.setValueAtTime(0.5, now);
        stutterLfo.connect(stutterGain);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        carrier.connect(filter);
        filter.connect(voiceGain);

        carrier.start(now);
        modulator.start(now);
        stutterLfo.start(now);

        cleanupFns.push(() => {
          try {
            carrier.stop();
            modulator.stop();
            stutterLfo.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'deep_foghorn': {
        // Monolithic sector lockdown horn
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc2.type = 'sawtooth';

        osc.frequency.setValueAtTime(65.4, now); // C2
        osc2.frequency.setValueAtTime(65.4 * 1.5, now); // Perfect fifth G2 (98.1Hz)
        osc2.detune.setValueAtTime(-14, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.Q.setValueAtTime(4, now);

        // Periodic swell
        const swellLfo = this.ctx.createOscillator();
        const swellGain = this.ctx.createGain();
        swellLfo.type = 'sine';
        swellLfo.frequency.setValueAtTime(0.18, now); // Slow 5.5s pulse
        swellGain.gain.setValueAtTime(450, now);
        swellLfo.connect(swellGain);
        swellGain.connect(filter.frequency);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(voiceGain);

        swellLfo.start(now);
        osc.start(now);
        osc2.start(now);

        cleanupFns.push(() => {
          try {
            swellLfo.stop();
            osc.stop();
            osc2.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'quarantine_hilo': {
        // High-low 2-tone alarm (European/biochemical style)
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(560, now);

        lfo.type = 'square';
        lfo.frequency.setValueAtTime(1.4, now); // Toggle between two notes
        lfoGain.gain.setValueAtTime(180, now); // Jump +/- 180Hz (380Hz and 740Hz)

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);

        osc.connect(filter);
        filter.connect(voiceGain);

        lfo.start(now);
        osc.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'fire_alarm': {
        // Triple-pulse fire buzzer
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();

        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(2400, now);
        osc2.frequency.setValueAtTime(2900, now);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(3.5, now);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(pulseGain.gain);

        osc1.connect(pulseGain);
        osc2.connect(pulseGain);
        pulseGain.connect(voiceGain);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc1.stop();
            osc2.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'phaser_sweep': {
        // Rapid rising chirp/phaser alarm
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);

        lfo.type = 'sawtooth';
        lfo.frequency.setValueAtTime(6.0, now); // 6 sweeps per sec
        lfoGain.gain.setValueAtTime(800, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(voiceGain);

        lfo.start(now);
        osc.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'sonar_ping': {
        // Sub-city sonar radar ping with Doppler echo
        const osc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        const delay = this.ctx.createDelay();
        const delayFeedback = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1450, now);

        delay.delayTime.setValueAtTime(0.35, now);
        delayFeedback.gain.setValueAtTime(0.45, now);

        // Ping envelope
        pingGain.gain.setValueAtTime(0.8, now);

        const pingLfo = this.ctx.createOscillator();
        pingLfo.type = 'sawtooth';
        pingLfo.frequency.setValueAtTime(0.5, now); // Ping every 2s
        const pLfoGain = this.ctx.createGain();
        pLfoGain.gain.setValueAtTime(0.5, now);
        pingLfo.connect(pLfoGain);
        pLfoGain.connect(pingGain.gain);

        osc.connect(pingGain);
        pingGain.connect(voiceGain);
        pingGain.connect(delay);
        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        delay.connect(voiceGain);

        pingLfo.start(now);
        osc.start(now);

        cleanupFns.push(() => {
          try {
            pingLfo.stop();
            osc.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'perimeter_alarm': {
        // Perimeter alarm with filtered sweep and noise
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        lfo.type = 'triangle';
        lfo.frequency.setValueAtTime(1.1, now);
        lfoGain.gain.setValueAtTime(320, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // Add periodic noise burst
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1100, now);
        noiseFilter.Q.setValueAtTime(5, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(voiceGain);

        osc.connect(voiceGain);

        lfo.start(now);
        osc.start(now);
        whiteNoise.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc.stop();
            whiteNoise.stop();
          } catch {
            // ignore
          }
        });
        break;
      }

      case 'lockdown_siren':
      default: {
        // Dissonant dual detuned siren
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        osc1.frequency.setValueAtTime(620, now);
        osc2.frequency.setValueAtTime(638, now); // Dissonant tritone/minor 2nd beat

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.65, now);
        lfoGain.gain.setValueAtTime(240, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        cleanupFns.push(() => {
          try {
            lfo.stop();
            osc1.stop();
            osc2.stop();
          } catch {
            // ignore
          }
        });
        break;
      }
    }

    const voice: ActiveVoice = {
      id,
      gainNode: voiceGain,
      stop: () => {
        cleanupFns.forEach((fn) => {
          try {
            fn();
          } catch {
            // ignore
          }
        });
      },
    };

    this.activeVoices.set(id, voice);
  }
}

export const soundEngine = new SoundEngine();
