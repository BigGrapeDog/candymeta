/* ═══════ story.js · 旁白对话 + 崩坏演出 ═══════ */

/* 乱码化文本 */
const GLITCH_CHARS = '■▓▒░█◆◇╳※◢◣▶◀灬乄卍ꙮ';
function scramble(str) {
  return str.split('').map(ch =>
    (ch !== ' ' && ch !== '\n' && Math.random() < 0.35)
      ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch
  ).join('');
}

/* 对话队列：lines = [{who, text, glitch}], cb 结束后回调 */
let DLG = null;
function say(lines, cb) {
  if (!lines || lines.length === 0) { if (cb) cb(); return; }
  if (DLG) { // 不打断进行中的对话：排在其后
    const prev = DLG;
    DLG = { lines: [...prev.lines.slice(prev.idx), ...lines], idx: 0, cb: () => { if (prev.cb) prev.cb(); if (cb) cb(); }, typing: false, full: '' };
  } else {
    DLG = { lines: [...lines], idx: 0, cb, typing: false, full: '' };
  }
  const ov = document.getElementById('dlg-overlay');
  ov.style.display = 'flex';
  ov.onclick = advanceDlg;
  showDlgLine();
}
function showDlgLine() {
  if (!DLG || DLG.idx >= DLG.lines.length) {
    document.getElementById('dlg-overlay').style.display = 'none';
    const cb = DLG ? DLG.cb : null; DLG = null;
    if (cb) cb();
    return;
  }
  const line = DLG.lines[DLG.idx];
  const box = document.getElementById('dlg-box');
  box.className = '';
  if (line.who === '糖糖') box.classList.add('sugar');
  if ((line.glitch || 0) > 0.3) box.classList.add('narrator-corrupt');
  document.getElementById('dlg-who').textContent =
    (line.glitch || 0) > 0.5 && line.who === '旁白君' ? scramble('旁白君') : line.who;
  const target = (line.glitch || 0) > 0 ? scrambleLine(line.text, line.glitch) : line.text;
  DLG.full = target;
  // 打字机
  const el = document.getElementById('dlg-text');
  el.textContent = '';
  DLG.typing = true;
  let i = 0;
  clearInterval(DLG.timer);
  DLG.timer = setInterval(() => {
    if (i >= target.length) { clearInterval(DLG.timer); DLG.typing = false; return; }
    el.textContent += target[i++];
    if (i % 3 === 0) AudioSys.sfx('click');
    if ((line.glitch || 0) > 0.4 && Math.random() < 0.1) AudioSys.sfx('glitch');
  }, 28);
}
function scrambleLine(text, level) {
  return text.split('').map(ch =>
    (ch !== ' ' && ch !== '\n' && Math.random() < level * 0.5)
      ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch
  ).join('');
}
function advanceDlg() {
  if (!DLG) return;
  if (DLG.typing) {
    clearInterval(DLG.timer);
    document.getElementById('dlg-text').textContent = DLG.full;
    DLG.typing = false;
    return;
  }
  DLG.idx++;
  if (DLG.idx >= DLG.lines.length) {
    document.getElementById('dlg-overlay').style.display = 'none';
    const cb = DLG.cb; DLG = null;
    if (cb) cb();
  } else showDlgLine();
}

/* ─── 崩坏演出 ─── */
function glitchFlash(intensity = 0.5) {
  const layer = document.getElementById('glitch-layer');
  layer.classList.add('on');
  layer.style.opacity = intensity;
  AudioSys.sfx('glitch');
  setTimeout(() => { layer.classList.remove('on'); layer.style.opacity = 0; }, 180 + intensity * 300);
}
function shakeScreen() {
  document.body.classList.remove('shake');
  void document.body.offsetWidth;
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 350);
}
function fadeTo(cb, dur = 600) {
  const f = document.getElementById('fade-layer');
  f.classList.add('on');
  setTimeout(() => { cb(); setTimeout(() => f.classList.remove('on'), 100); }, dur);
}

/* 理智驱动的全局氛围（音乐走调+画面低语） */
function updateSanFX() {
  if (!run) { AudioSys.setDetune(0); AudioSys.setMode('normal'); document.body.classList.remove('san-low'); return; }
  const sanRatio = run.san / run.maxSan;
  const loopFactor = Math.min(0.25, SAVE.loops * 0.05);
  const detune = Math.max(0, (0.75 - sanRatio)) + loopFactor + (run.floor === 4 ? 0.25 : 0);
  AudioSys.setDetune(Math.min(1, detune));
  AudioSys.refreshMode(); // v2.5.0：BGM 随 战斗/分支/楼层 自动切换
  document.body.classList.toggle('san-low', run.san < 30);
}

/* 假死机演出：progress → 黑屏 → 回调 */
function fakeCrash(cb) {
  AudioSys.sfx('crash');
  AudioSys.setDetune(1);
  const fc = document.getElementById('fakecrash');
  fc.style.display = 'flex';
  document.getElementById('crash-title').textContent = '⚠ CandyBrave.exe 已停止响应';
  document.getElementById('crash-body').style.display = 'block';
  const pctEl = document.getElementById('crash-pct');
  const fill = document.getElementById('crash-bar-fill');
  let pct = 0;
  const t = setInterval(() => {
    pct += Math.random() * 9;
    if (pct >= 100) {
      pct = 100;
      clearInterval(t);
      setTimeout(() => {
        // 黑屏
        document.getElementById('crash-box').style.display = 'none';
        glitchFlash(1);
        setTimeout(() => {
          fc.style.display = 'none';
          document.getElementById('crash-box').style.display = 'block';
          AudioSys.setDetune(0.3);
          cb();
        }, 2600);
      }, 800);
    }
    pctEl.textContent = Math.floor(pct) + '%';
    fill.style.width = pct + '%';
    if (Math.random() < 0.3) AudioSys.sfx('glitch');
  }, 120);
}
