/* ═══════ audio.js · WebAudio 程序合成（八音盒 BGM + 音效 + 崩坏走调） ═══════ */
const AudioSys = {
  ctx: null, master: null, musicGain: null, sfxGain: null,
  detune: 0,            // 0=正常 1=完全崩坏
  musicTimer: null, step: 0,
  started: false,

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
    this.master.gain.value = 0.9;
    this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.connect(this.master);
    this.applyVolumes();
  },
  applyVolumes() {
    if (!this.ctx) return;
    const muted = SAVE?.settings.muted ?? false;
    this.master.gain.value = muted ? 0 : 0.9;
    this.musicGain.gain.value = (SAVE?.settings.music ?? 60) / 100 * 0.5;
    this.sfxGain.gain.value = (SAVE?.settings.sfx ?? 70) / 100 * 0.8;
  },
  resume() { this.init(); if (this.ctx.state === 'suspended') this.ctx.resume(); },

  /* ── BGM：八音盒琶音循环。detune 越高音越飘、节奏越散 ── */
  // C 大调童谣式进行（第5层会变成小调）
  MELODY: [523, 659, 784, 659, 880, 784, 659, 523, 587, 698, 880, 698, 784, 659, 587, 523],
  BASS:   [262, 0, 196, 0, 220, 0, 196, 0],
  MELODY_DARK: [440, 415, 440, 349, 440, 0, 311, 0, 440, 466, 440, 415, 349, 0, 0, 0],
  BASS_DARK:   [110, 0, 0, 110, 0, 104, 0, 0],
  dark: false,

  startMusic() {
    this.resume();
    if (this.musicTimer) return;
    this.step = 0;
    const tick = () => {
      const d = this.detune;
      const mel = this.dark ? this.MELODY_DARK : this.MELODY;
      const bass = this.dark ? this.BASS_DARK : this.BASS;
      const i = this.step % 16;
      // 高崩坏时随机丢音符/错音
      if (mel[i] && Math.random() > d * 0.45) {
        const wobble = (Math.random() - 0.5) * 120 * d; // 音分偏移
        this.tone(mel[i] * Math.pow(2, wobble / 1200), 0.22, 'sine', 0.16, this.musicGain);
        this.tone(mel[i] * 2 * Math.pow(2, wobble / 900), 0.18, 'triangle', 0.05, this.musicGain);
      }
      if (i % 2 === 0 && bass[i / 2] && Math.random() > d * 0.3) {
        this.tone(bass[i / 2] * (1 - d * 0.02 * Math.random()), 0.4, 'triangle', 0.1, this.musicGain);
      }
      // 崩坏噪音点缀
      if (d > 0.35 && Math.random() < d * 0.25) this.noise(0.08, 0.05 * d, this.musicGain);
      this.step++;
      // 节奏随崩坏漂移
      const interval = 210 * (1 + (Math.random() - 0.5) * 0.6 * d);
      this.musicTimer = setTimeout(tick, interval);
    };
    tick();
  },
  stopMusic() { if (this.musicTimer) { clearTimeout(this.musicTimer); this.musicTimer = null; } },
  setDetune(v) { this.detune = Math.max(0, Math.min(1, v)); },
  setDark(v) { this.dark = v; },

  tone(freq, dur, type, vol, dest) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(); o.stop(this.ctx.currentTime + dur);
  },
  noise(dur, vol, dest) {
    if (!this.ctx) return;
    const len = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    src.connect(g); g.connect(dest || this.sfxGain);
    src.start();
  },

  /* ── 音效 ── */
  sfx(name) {
    this.resume();
    const S = {
      card:    () => { this.tone(660, .08, 'square', .12); this.tone(880, .06, 'square', .08); },
      attack:  () => { this.noise(.09, .18); this.tone(180, .1, 'sawtooth', .15); },
      hurt:    () => { this.tone(140, .18, 'sawtooth', .2); this.noise(.12, .12); },
      block:   () => { this.tone(330, .1, 'triangle', .16); this.tone(440, .08, 'triangle', .1); },
      heal:    () => { [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, .12, 'sine', .12), i * 60)); },
      coin:    () => { this.tone(988, .06, 'square', .1); setTimeout(() => this.tone(1319, .1, 'square', .1), 50); },
      draw:    () => { this.tone(500, .04, 'square', .06); },
      die:     () => { this.tone(220, .3, 'sawtooth', .15); setTimeout(() => this.tone(110, .5, 'sawtooth', .12), 150); },
      victory: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, .18, 'triangle', .15), i * 110)); },
      glitch:  () => { this.noise(.2, .2); this.tone(50 + Math.random() * 90, .25, 'sawtooth', .14); },
      click:   () => { this.tone(700, .04, 'square', .07); },
      move:    () => { this.tone(392, .06, 'triangle', .09); },
      event:   () => { this.tone(587, .14, 'sine', .1); this.tone(440, .2, 'sine', .07); },
      san:     () => { this.tone(233, .3, 'sine', .12); this.tone(247, .3, 'sine', .1); },
      crash:   () => { this.noise(.5, .3); this.tone(60, .6, 'sawtooth', .2); },
    };
    if (S[name]) S[name]();
  },
};
