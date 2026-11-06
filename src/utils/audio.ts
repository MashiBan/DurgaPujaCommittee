/**
 * Pure Web Audio API synthesizer for traditional Bengali Dhaak drum rhythm & Conch Shell drone.
 * Guaranteed to work offline with zero external audio assets or network requests.
 */

class PujoAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;
  private conchOsc: OscillatorNode | null = null;
  private conchGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays a rich Dhaak drum stroke (low resonant skin body + higher rim strike)
  private playDhaakStroke(time: number, isAccent = false) {
    if (!this.ctx) return;

    // 1. Bass drum boom (Kanshor/Dhaak body)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isAccent ? 350 : 220, time);

    osc.type = 'sine';
    const startFreq = isAccent ? 140 : 95;
    const endFreq = isAccent ? 60 : 45;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.18);

    const volume = isAccent ? 0.35 : 0.2;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.26);

    // 2. High snappy rim sound (Kathi - curved stick slap)
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isAccent ? 1800 : 1200, time);
    noiseFilter.Q.setValueAtTime(3, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isAccent ? 0.18 : 0.08, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  // Gentle blowing of the sacred Shankha (conch shell drone)
  private playShankhaChant(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    // Shankha natural fundamental (~430Hz to 445Hz swell)
    osc.frequency.setValueAtTime(425, time);
    osc.frequency.linearRampToValueAtTime(442, time + 1.2);
    osc.frequency.linearRampToValueAtTime(435, time + 2.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(880, time);
    filter.Q.setValueAtTime(4, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.8);
    gain.gain.linearRampToValueAtTime(0.08, time + 2.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 3.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 3.3);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx) return;
    this.isPlaying = true;

    // Traditional Bengali Dhaak 6-beat / 8-beat syncopation:
    // "Dha - - Gur Gur Dha - Tintin Dha"
    let beat = 0;
    const tempoMs = 180; // Festive brisk tempo

    // Play initial shankha welcome
    this.playShankhaChant(this.ctx.currentTime + 0.1);

    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;

      // Traditional festive cycle (16 subdivisions)
      const isAccent = beat === 0 || beat === 6 || beat === 12;
      const isGhost = beat === 2 || beat === 3 || beat === 8 || beat === 10 || beat === 14;

      if (isAccent) {
        this.playDhaakStroke(now, true);
      } else if (isGhost) {
        this.playDhaakStroke(now, false);
      }

      // Every 32 beats, play a peaceful shankha blow
      if (beat % 32 === 0 && beat !== 0) {
        this.playShankhaChant(now);
      }

      beat = (beat + 1) % 32;
    }, tempoMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.conchOsc) {
      try {
        this.conchOsc.stop();
      } catch {
        // ignore
      }
      this.conchOsc = null;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const pujoAudio = new PujoAudioManager();
