
// A procedural audio engine for "Stardew Valley" style cozy vibes
// Uses Pentatonic scales and simple waveforms to mimic pixel-art game music

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private melodyInterval: any = null;
  private droneNodes: AudioNode[] = [];

  // Pentatonic Scale (C Major Pentatonic: C, D, E, G, A)
  // Frequencies for C4 - C6 range
  private scale = [
    261.63, 293.66, 329.63, 392.00, 440.00, // Octave 4
    523.25, 587.33, 659.25, 783.99, 880.00  // Octave 5
  ];

  init() {
    if (this.ctx) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx!.createGain();
    this.masterGain.connect(this.ctx!.destination);
    this.masterGain.gain.value = 0.4;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const target = this.isMuted ? 0 : 0.4;
      this.masterGain.gain.setTargetAtTime(target, this.ctx!.currentTime, 0.5);
    }
    return this.isMuted;
  }

  // --- COZY BGM GENERATOR ---
  async startAmbient() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') await this.ctx.resume();

    this.stopAmbient();

    // 1. Warm Background Pad (The "Forest" ambience)
    this.createDrone(130.81, 0.05); // C3
    this.createDrone(196.00, 0.03); // G3

    // 2. Procedural Melody (The "Village" tune)
    // Plays a random note from the scale every 400-800ms
    const playNextNote = () => {
      if (this.isMuted) return;
      
      // 30% chance to pause (rest)
      if (Math.random() > 0.3) {
        const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
        const duration = 0.5 + Math.random() * 1.0;
        this.playInstrument(freq, duration);
      }

      const nextTime = 400 + Math.random() * 800;
      this.melodyInterval = setTimeout(playNextNote, nextTime);
    };

    playNextNote();
  }

  stopAmbient() {
    this.droneNodes.forEach((node) => {
      try {
        (node as any).stop && (node as any).stop();
        node.disconnect();
      } catch (e) {}
    });
    this.droneNodes = [];
    if (this.melodyInterval) clearTimeout(this.melodyInterval);
  }

  // Drone/Pad Sound
  private createDrone(freq: number, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    filter.type = 'lowpass';
    filter.frequency.value = 300; // Muffled, warm sound

    gain.gain.value = vol;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();
    this.droneNodes.push(osc, gain, filter);
  }

  // Main Instrument (Harp/Marimba hybrid)
  private playInstrument(freq: number, duration: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine'; // Pure tone, very Stardew-like
    osc.frequency.setValueAtTime(freq, t);

    // Envelope: Pluck sound (Fast attack, decay)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + duration);
  }

  // --- SFX ---
  playSFX(type: 'type_bubble' | 'click' | 'glass_clink' | 'success' | 'liquid_hover' | 'stir') {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;

    switch (type) {
      case 'type_bubble':
        // A cute, short "bloop" for typing
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        
        bOsc.type = 'sine';
        // Random pitch for variety
        const pitch = 600 + Math.random() * 400;
        bOsc.frequency.setValueAtTime(pitch, t);
        bOsc.frequency.exponentialRampToValueAtTime(pitch - 200, t + 0.1);

        bGain.gain.setValueAtTime(0.05, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        bOsc.connect(bGain);
        bGain.connect(this.masterGain!);
        bOsc.start(t);
        bOsc.stop(t + 0.1);
        break;

      case 'glass_clink':
        // High pitched sparkle
        const cOsc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        cOsc.type = 'triangle';
        cOsc.frequency.setValueAtTime(2000, t);
        cGain.gain.setValueAtTime(0, t);
        cGain.gain.linearRampToValueAtTime(0.1, t + 0.01);
        cGain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        cOsc.connect(cGain);
        cGain.connect(this.masterGain!);
        cOsc.start(t);
        cOsc.stop(t + 1);
        break;
        
      case 'click':
        // Wood block click
        const wOsc = this.ctx.createOscillator();
        const wGain = this.ctx.createGain();
        wOsc.type = 'square';
        wOsc.frequency.setValueAtTime(400, t);
        wGain.gain.setValueAtTime(0.05, t);
        wGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        wOsc.connect(wGain);
        wGain.connect(this.masterGain!);
        wOsc.start(t);
        wOsc.stop(t + 0.05);
        break;

      case 'success':
        // Harplike glissando
        const scale = [523.25, 659.25, 783.99, 1046.50];
        scale.forEach((f, i) => {
            setTimeout(() => this.playInstrument(f, 2), i * 100);
        });
        break;

      case 'liquid_hover':
        // Soft watery blip
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = 'sine';
        lOsc.frequency.setValueAtTime(300, t);
        lOsc.frequency.linearRampToValueAtTime(450, t + 0.15); // Slide up
        lGain.gain.setValueAtTime(0.05, t);
        lGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        lOsc.connect(lGain);
        lGain.connect(this.masterGain!);
        lOsc.start(t);
        lOsc.stop(t + 0.15);
        break;

      case 'stir':
        // Simulated ice rattling (series of high-passed noise bursts or high clicks)
        const createIceSound = (delay: number) => {
            const iOsc = this.ctx!.createOscillator();
            const iGain = this.ctx!.createGain();
            iOsc.type = 'triangle';
            iOsc.frequency.setValueAtTime(2000 + Math.random() * 1000, t + delay);
            iGain.gain.setValueAtTime(0.04, t + delay);
            iGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);
            iOsc.connect(iGain);
            iGain.connect(this.masterGain!);
            iOsc.start(t + delay);
            iOsc.stop(t + delay + 0.05);
        };
        for(let i=0; i<5; i++) {
            createIceSound(i * 0.08);
        }
        break;
    }
  }
}

export const audioEngine = new AudioEngine();
