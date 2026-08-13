/* ═══════ art.js · Canvas 程序化像素画 ═══════ */
/* 所有精灵绘制在 24×24 的逻辑网格上，再放大到画布，天然像素风 */

const Art = {
  cell(canvas) { return canvas.width / 24; },
  px(ctx, s, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x * s), Math.round(y * s), Math.ceil(w * s), Math.ceil(h * s));
  },

  /* 简单可复现随机数 */
  seeded(seed) {
    let t = seed + 0x6D2B79F5;
    return () => {
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  clear(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return ctx;
  },

  /* ── 主角 糖糖：粉白勇者 ── */
  hero(canvas, glitch = 0) {
    const ctx = this.clear(canvas), s = this.cell(canvas);
    const R = this.seeded(42 + glitch * 97);
    const skin = glitch > 0.5 ? '#c8ffd8' : '#ffe0d0';
    const hair = glitch > 0.3 ? this.corrupt('#ff8fab', R) : '#ff8fab';
    const cloth = glitch > 0.3 ? this.corrupt('#ffd166', R) : '#ffd166';
    // 头发
    this.px(ctx, s, 7, 4, 10, 5, hair);
    this.px(ctx, s, 6, 6, 2, 6, hair); this.px(ctx, s, 16, 6, 2, 6, hair);
    // 脸
    this.px(ctx, s, 8, 8, 8, 6, skin);
    // 眼睛（崩坏时变红/乱位）
    const eyeC = glitch > 0.6 ? '#ff2020' : '#3a2a48';
    const eyeOff = glitch > 0.4 && R() > 0.5 ? 1 : 0;
    this.px(ctx, s, 10 + eyeOff, 10, 1, 2, eyeC);
    this.px(ctx, s, 13 - eyeOff, 10, 1, 2, eyeC);
    // 嘴
    this.px(ctx, s, 11, 13, 2, 1, glitch > 0.5 ? '#8a1040' : '#d98a8a');
    // 身体（勇者裙甲）
    this.px(ctx, s, 8, 14, 8, 4, cloth);
    this.px(ctx, s, 7, 15, 1, 3, '#fff'); this.px(ctx, s, 16, 15, 1, 3, '#fff');
    this.px(ctx, s, 9, 18, 6, 2, '#ff8fab');
    // 腿
    this.px(ctx, s, 9, 20, 2, 2, '#8a5aa8'); this.px(ctx, s, 13, 20, 2, 2, '#8a5aa8');
    // 棒棒糖剑
    this.px(ctx, s, 18, 8, 1, 9, '#c98f4a');
    this.px(ctx, s, 17, 5, 3, 3, glitch > 0.4 ? '#0ff' : '#ff5d73');
    this.px(ctx, s, 18, 6, 1, 1, '#fff');
    if (glitch > 0) this.glitchPass(canvas, glitch);
  },

  /* ── 敌人：按定义程序化生成糖果怪物 ── */
  enemy(canvas, def, glitch = 0) {
    const ctx = this.clear(canvas), s = this.cell(canvas);
    const R = this.seeded(def.seed || 7);
    let body = def.color, belly = def.color2 || '#ffffff';
    if (glitch > 0.4) { body = this.corrupt(body, R); belly = this.corrupt(belly, R); }
    const shape = def.shape || 'round';
    // 身体
    if (shape === 'round') {
      this.px(ctx, s, 6, 8, 12, 12, body);
      this.px(ctx, s, 7, 7, 10, 1, body); this.px(ctx, s, 7, 20, 10, 1, body);
      this.px(ctx, s, 8, 14, 8, 5, belly);
    } else if (shape === 'tall') {
      this.px(ctx, s, 8, 4, 8, 17, body);
      this.px(ctx, s, 9, 12, 6, 7, belly);
    } else if (shape === 'blob') {
      this.px(ctx, s, 5, 12, 14, 9, body);
      this.px(ctx, s, 7, 9, 10, 4, body);
      this.px(ctx, s, 8, 15, 8, 4, belly);
    } else { // sharp 尖塔型
      this.px(ctx, s, 10, 3, 4, 3, body);
      this.px(ctx, s, 8, 6, 8, 4, body);
      this.px(ctx, s, 6, 10, 12, 11, body);
      this.px(ctx, s, 9, 14, 6, 5, belly);
    }
    // 角/耳朵
    if (def.horns) {
      this.px(ctx, s, 6, shape === 'round' ? 4 : 2, 2, 3, def.hornColor || '#fff');
      this.px(ctx, s, 16, shape === 'round' ? 4 : 2, 2, 3, def.hornColor || '#fff');
    }
    // 眼睛
    const eyeY = shape === 'round' ? 11 : (shape === 'tall' ? 8 : 13);
    const eyeC = glitch > 0.6 ? '#ff2020' : (def.eyeColor || '#2a1a38');
    const n = def.eyes || 2;
    if (n === 1) { this.px(ctx, s, 11, eyeY, 2, 3, eyeC); this.px(ctx, s, 12, eyeY + 1, 1, 1, '#fff'); }
    else if (n === 3) {
      this.px(ctx, s, 7, eyeY, 2, 2, eyeC); this.px(ctx, s, 11, eyeY - 1, 2, 2, eyeC); this.px(ctx, s, 15, eyeY, 2, 2, eyeC);
    } else {
      this.px(ctx, s, 9, eyeY, 2, 2, eyeC); this.px(ctx, s, 13, eyeY, 2, 2, eyeC);
      this.px(ctx, s, 10, eyeY, 1, 1, '#fff'); this.px(ctx, s, 14, eyeY, 1, 1, '#fff');
    }
    // 嘴
    if (def.mouth !== 'none') {
      this.px(ctx, s, 10, eyeY + 4, 4, 1, glitch > 0.5 ? '#000' : (def.mouthColor || '#a04a6a'));
      if (def.teeth) { this.px(ctx, s, 10, eyeY + 4, 1, 2, '#fff'); this.px(ctx, s, 13, eyeY + 4, 1, 2, '#fff'); }
    }
    // 手
    this.px(ctx, s, 4, eyeY + 3, 2, 2, body); this.px(ctx, s, 18, eyeY + 3, 2, 2, body);
    if (glitch > 0) this.glitchPass(canvas, glitch);
  },

  /* ── 随从 ── */
  minion(canvas, m, glitch = 0) {
    this.enemy(canvas, {
      seed: m.seed || 99, color: m.color, color2: '#fff', shape: m.shape || 'blob',
      eyes: 2, horns: !!m.horns, hornColor: '#ffd166',
    }, glitch);
  },

  /* 调色板腐化 */
  corrupt(hex, R) {
    const bad = ['#ff0033', '#00ffcc', '#660066', '#003300', '#ff00ff', '#001122', '#cc3300'];
    return bad[Math.floor(R() * bad.length)];
  },

  /* 崩坏噪点+切片错位 */
  glitchPass(canvas, amount) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const R = Math.random;
    const slices = Math.floor(amount * 5);
    for (let i = 0; i < slices; i++) {
      const y = Math.floor(R() * h), sh = 2 + R() * 6, dx = (R() - 0.5) * amount * 30;
      try { ctx.drawImage(canvas, 0, y, w, sh, dx, y, w, sh); } catch (e) {}
    }
    const dots = Math.floor(amount * 60);
    for (let i = 0; i < dots; i++) {
      ctx.fillStyle = ['#f0f', '#0ff', '#ff0', '#000'][Math.floor(R() * 4)];
      ctx.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3);
    }
  },

  /* 标题大头像 */
  titleArt(canvas, glitch = 0) {
    canvas.width = 128; canvas.height = 128;
    this.hero(canvas, glitch);
  },
};
