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

  /* ── BGM：程序化循环。mode 决定曲风；detune 越高音越飘、节奏越散 ── */
  // C 大调童谣式进行
  MELODY: [523, 659, 784, 659, 880, 784, 659, 523, 587, 698, 880, 698, 784, 659, 587, 523],
  BASS:   [262, 0, 196, 0, 220, 0, 196, 0],
  MELODY_DARK: [440, 415, 440, 349, 440, 0, 311, 0, 440, 466, 440, 415, 349, 0, 0, 0],
  BASS_DARK:   [110, 0, 0, 110, 0, 104, 0, 0],

  /* v2.5.0 音乐模式：normal 童谣 / dark 小调(深层) / boss 激战 / final 叙述者决战 / fallen 堕落线 / swarm 兽群线 */
  mode: 'normal',
  getModes() {
    return {
      normal: { mel: this.MELODY, bass: this.BASS, interval: 210, wave: 'sine', melVol: 0.16, bassVol: 0.1, bassEvery: 2 },
      dark:   { mel: this.MELODY_DARK, bass: this.BASS_DARK, interval: 240, wave: 'sine', melVol: 0.15, bassVol: 0.1, bassEvery: 2 },
      boss: { // 激流般的小调 riff + 战鼓
        mel: [660, 0, 784, 660, 880, 784, 660, 588, 660, 0, 784, 660, 1047, 880, 784, 660],
        bass: [110, 110, 131, 110, 110, 110, 98, 131],
        interval: 132, wave: 'square', melVol: 0.1, bassVol: 0.13, bassEvery: 1, perc: true,
      },
      final: { // 叙述者：崩坏八音盒 + 更凶的鼓
        mel: [466, 440, 466, 622, 466, 0, 415, 440, 466, 0, 622, 699, 622, 466, 440, 0],
        bass: [55, 55, 58, 55, 55, 62, 58, 55],
        interval: 118, wave: 'sawtooth', melVol: 0.07, bassVol: 0.14, bassEvery: 1, perc: true, extraNoise: true,
      },
      fallen: { // 黑糖糖：半音下行的不祥挽歌
        mel: [466, 440, 415, 392, 0, 370, 0, 0, 349, 0, 330, 311, 0, 0, 0, 0],
        bass: [58, 0, 0, 0, 62, 0, 55, 0],
        interval: 265, wave: 'triangle', melVol: 0.13, bassVol: 0.16, bassEvery: 2, drone: true,
      },
      swarm: { // 万灵：五声音阶 + 铃鼓
        mel: [523, 587, 659, 784, 880, 784, 659, 587, 523, 587, 659, 587, 440, 0, 392, 0],
        bass: [98, 0, 98, 0, 87, 0, 98, 0],
        interval: 168, wave: 'triangle', melVol: 0.13, bassVol: 0.12, bassEvery: 2, perc: true, bell: true,
      },
      perfect: { // 完美结局：温暖大调终曲 + 金钟
        mel: [523, 659, 784, 1047, 880, 784, 659, 523, 587, 698, 880, 1047, 784, 659, 587, 523],
        bass: [131, 0, 196, 0, 175, 0, 196, 0],
        interval: 255, wave: 'sine', melVol: 0.15, bassVol: 0.1, bassEvery: 2, bell: true,
      },
    };
  },
  modeLock: false, // 完美结局等演出期间锁定 BGM，不被场景切换覆盖
  setMode(m) { if (this.mode !== m) { this.mode = m; this.step = 0; } },
  /* 根据当前游戏状态计算该有的 BGM */
  refreshMode() {
    if (this.modeLock) return;
    let m = 'normal';
    if (typeof CB !== 'undefined' && CB && !CB.over && CB.opts && CB.opts.boss) {
      m = (CB.enemies[0] && CB.enemies[0].id === 'narrator') ? 'final' : 'boss';
    } else if (typeof run !== 'undefined' && run) {
      if (run.branch === 'fallen') m = 'fallen';
      else if (run.branch === 'swarm') m = 'swarm';
      else if (run.floor >= 4) m = 'dark';
    }
    this.setMode(m);
  },

  startMusic() {
    this.resume();
    if (this.musicTimer) return;
    this.step = 0;
    const tick = () => {
      const d = this.detune;
      const M = this.getModes()[this.mode] || this.getModes().normal;
      const mel = M.mel, bass = M.bass;
      const i = this.step % 16;
      // 高崩坏时随机丢音符/错音
      if (mel[i] && Math.random() > d * 0.45) {
        const wobble = (Math.random() - 0.5) * 120 * d; // 音分偏移
        this.tone(mel[i] * Math.pow(2, wobble / 1200), 0.22, M.wave, M.melVol, this.musicGain);
        this.tone(mel[i] * 2 * Math.pow(2, wobble / 900), 0.18, 'triangle', 0.05, this.musicGain);
      }
      if (i % M.bassEvery === 0 && bass[(i / M.bassEvery) % 8] && Math.random() > d * 0.3) {
        this.tone(bass[(i / M.bassEvery) % 8] * (1 - d * 0.02 * Math.random()), 0.4, 'triangle', M.bassVol, this.musicGain);
      }
      // 战鼓：底鼓 + 军鼓噪声 + 踩镲
      if (M.perc && Math.random() > d * 0.2) {
        if (i % 4 === 0) this.kick();
        if (i % 8 === 4) this.noise(0.09, 0.09, this.musicGain);
        if (i % 2 === 1) this.noise(0.025, 0.03, this.musicGain);
      }
      // 兽群铃音（叮铃）
      if (M.bell && i % 8 === 7) { this.tone(1568, 0.3, 'sine', 0.06, this.musicGain); this.tone(2093, 0.2, 'sine', 0.03, this.musicGain); }
      // 堕落线低鸣 drone
      if (M.drone && i % 16 === 0) this.tone(55, 1.6, 'sawtooth', 0.05, this.musicGain);
      // 崩坏噪音点缀
      if ((d > 0.35 && Math.random() < d * 0.25) || (M.extraNoise && Math.random() < 0.12)) this.noise(0.08, 0.05 * Math.max(d, 0.4), this.musicGain);
      this.step++;
      // 节奏随崩坏漂移
      const interval = M.interval * (1 + (Math.random() - 0.5) * 0.6 * d);
      this.musicTimer = setTimeout(tick, interval);
    };
    tick();
  },
  stopMusic() { if (this.musicTimer) { clearTimeout(this.musicTimer); this.musicTimer = null; } },
  setDetune(v) { this.detune = Math.max(0, Math.min(1, v)); },
  kick() { // 底鼓：快速下滑的低频
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.28, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    o.connect(g); g.connect(this.musicGain);
    o.start(); o.stop(this.ctx.currentTime + 0.13);
  },

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
