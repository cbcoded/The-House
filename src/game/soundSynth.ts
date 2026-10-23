/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Procedural Simlish/Murmur vocalization:
   * Generates short formant-filtered frequency-modulated vocal chirp based on character pitch & mood
   */
  public playMurmur(pitchMultiplier: number = 1.0, isDark: boolean = false) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Murmur formant filter
      filter.type = isDark ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(isDark ? 300 : 800, now);
      filter.Q.setValueAtTime(isDark ? 4.0 : 1.5, now);

      const baseFreq = (isDark ? 110 : 220) * pitchMultiplier;
      osc.type = isDark ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      // Frequency inflection (mimicking natural syllable rise/fall)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(isDark ? 0.06 : 0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // AudioContext policy safe guard
    }
  }

  /**
   * UI Click / Object select sound
   */
  public playClick(freq = 480) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Appliance / Action completed sound
   */
  public playChime(success = true) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = success ? [523.25, 659.25, 783.99] : [349.23, 311.13, 261.63];
      notes.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch {}
  }

  /**
   * Browser Speech Synthesis for Clear English self-talk and The House answers
   */
  public speakEnglish(text: string, pitch = 1.0, rate = 1.05) {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const sound = new SoundSynthesizer();
