/* ═══════ combat.js · 卡牌战斗引擎 ═══════ */
let CB = null; // 当前战斗状态

function hasRelic(id) { return run && run.relics.includes(id); }
function effSanCost(card, inst) {
  let s = (card.san || 0);
  const fx = inst.up ? Object.assign({}, card.fx, card.up) : card.fx;
  s += fx.sanCost || 0;
  if (card.type === 'corrupt' && hasRelic('deadpixel')) s = Math.max(1, s - 2);
  return s;
}
function cardFx(card, up) { return up ? Object.assign({}, card.fx, card.up) : card.fx; }

/* ─── 卡牌元素（战斗/商店/奖励共用） ─── */
function makeCardEl(inst, opts = {}) {
  const def = CARDS[inst.cid];
  const el = document.createElement('div');
  el.className = 'card' + (inst.up ? ' upgraded' : '') + (def.type === 'corrupt' ? ' corrupt' : '') + (inst.fake ? ' fake-card' : '');
  const fx = cardFx(def, inst.up);
  const san = effSanCost(def, inst);
  let name = def.name + (inst.up ? '+' : '');
  let desc = def.desc(inst.up);
  if (inst.fake && run && run.san < 30) { name = scramble(name); }
  const typeNames = { attack:'攻击', skill:'技能', summon:'召唤', corrupt:'崩坏' };
  el.innerHTML = `
    <div class="c-cost">${def.cost}</div>
    ${san > 0 ? `<div class="c-san" title="消耗理智">${san}</div>` : ''}
    <div class="c-name">${name}</div>
    <div class="c-art">${def.icon}</div>
    <div class="c-type">${typeNames[def.type]}</div>
    <div class="c-desc">${desc}</div>`;
  if (opts.price != null) {
    const tag = document.createElement('div');
    tag.className = 'price-tag' + (run.gold < opts.price ? ' cant' : '');
    tag.textContent = opts.price + ' 金币';
    el.appendChild(tag);
  }
  if (opts.onClick) el.onclick = () => opts.onClick(inst, el);
  return el;
}

/* ─── 开始战斗 ─── */
function startCombat(enemyIds, opts) {
  const b = getBonuses();
  CB = {
    opts,
    enemies: enemyIds.map(id => {
      const def = ENEMIES[id];
      return { id, def, hp: def.hp, maxHp: def.hp, block: 0, poison: 0, weak: 0, vuln: 0, str: 0, stun: false, moveIdx: Math.floor(Math.random() * 2), alive: true };
    }),
    heroBlock: 0, heroStr: hasRelic('badge') ? 1 : 0,
    heroWeak: 0, heroVuln: 0, invuln: false, mirrorUsed: false,
    minions: [],
    energyMax: 3 + b.energy,
    energy: 0, turn: 0,
    drawPile: shuffle(run.deck.map(c => ({ ...c }))),
    discard: [], hand: [],
    selected: null, over: false,
    phantom: null,
  };
  // 低理智幻觉：幻影敌人
  if (run.san < 30 && !opts.boss) {
    const pool = FLOORS[run.floor].pool;
    CB.phantom = ENEMIES[pool[Math.floor(Math.random() * pool.length)]] || null;
  }
  if (hasRelic('sanitymask')) changeSan(5, true);
  showScreen('screen-combat');
  AudioSys.sfx('event');
  clog(opts.boss ? `强敌出现了：${CB.enemies.map(e => e.def.name).join('、')}！` : '战斗开始！', 'log-meta');
  startTurn();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clog(msg, cls = '') {
  const el = document.getElementById('combat-log');
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

/* ─── 回合流程 ─── */
function startTurn() {
  if (CB.over) return;
  CB.turn++;
  CB.energy = CB.energyMax;
  CB.heroBlock = 0;
  CB.invuln = false;
  if (CB.heroWeak > 0) CB.heroWeak--;
  if (CB.heroVuln > 0) CB.heroVuln--;
  // SAN=0 的精神反噬
  if (run.san <= 0) {
    damageHero(2, null, true);
    clog('理智归零：现实在剥落……受到 2 点精神伤害。', 'log-meta');
    glitchFlash(0.6);
    if (checkEnd()) return;
  }
  // 抽牌
  let n = 5;
  if (CB.turn === 1) {
    n += getBonuses().extraDraw + (hasRelic('oldpage') ? 2 : 0);
  }
  drawCards(n);
  // 假卡幻觉
  if (run.san < 60 && Math.random() < (run.san < 30 ? 0.45 : 0.25)) {
    const pool = Object.keys(CARDS).filter(id => CARDS[id].rarity !== 'start');
    CB.hand.push({ fake: true, cid: pool[Math.floor(Math.random() * pool.length)], up: false });
    clog('有什么东西混进了你的手牌……', 'log-meta');
  }
  renderCombat();
}

function drawCards(n) {
  for (let i = 0; i < n; i++) {
    if (CB.drawPile.length === 0) {
      if (CB.discard.length === 0) break;
      CB.drawPile = shuffle(CB.discard);
      CB.discard = [];
    }
    if (CB.hand.length >= 9) break;
    CB.hand.push(CB.drawPile.pop());
    AudioSys.sfx('draw');
  }
}

/* ─── 出牌 ─── */
function playCard(inst, target) {
  if (CB.over) return;
  // 假卡：点击即消散
  if (inst.fake) {
    CB.hand = CB.hand.filter(c => c !== inst);
    AudioSys.sfx('glitch'); glitchFlash(0.5);
    clog('「这张卡从未存在过。」它碎成了像素。', 'log-meta');
    changeSan(-1, true);
    renderCombat();
    return;
  }
  const def = CARDS[inst.cid];
  const san = effSanCost(def, inst);
  if (def.cost > CB.energy) { clog('能量不足！'); return; }
  if (san > run.san) { clog('理智不足，无法承受这张牌……', 'log-meta'); return; }
  if (def.target && !target) {
    // 需要选目标
    const alive = CB.enemies.filter(e => e.alive);
    if (alive.length === 0) return;
    if (alive.length === 1) target = alive[0];
    else { CB.selected = inst; renderCombat(); clog(`选择「${def.name}」的目标`); return; }
  }
  CB.selected = null;
  CB.energy -= def.cost;
  if (san > 0) { changeSan(-san); clog(`理智 -${san}`, 'log-meta'); }
  const fx = cardFx(def, inst.up);
  applyCardFx(def, fx, target);
  CB.hand = CB.hand.filter(c => c !== inst);
  CB.discard.push(inst);
  AudioSys.sfx(def.type === 'corrupt' ? 'glitch' : 'card');
  if (def.type === 'corrupt') glitchFlash(0.3);
  checkEnd();
  renderCombat();
}

function applyCardFx(def, fx, target) {
  const b = getBonuses();
  if (fx.selfHp) { run.hp = Math.max(1, run.hp - fx.selfHp); clog(`失去 ${fx.selfHp} 点生命`, 'log-dmg'); }
  const targets = fx.all ? CB.enemies.filter(e => e.alive) : (target ? [target] : []);
  for (const t of targets) {
    if (fx.dmg) {
      const hits = fx.hits || 1;
      for (let i = 0; i < hits; i++) {
        let dmg = fx.dmg + CB.heroStr;
        if (fx.bonusIfPoison && t.poison > 0) dmg += fx.bonusIfPoison;
        if (CB.heroWeak > 0) dmg = Math.floor(dmg * 0.75);
        damageEnemy(t, dmg);
      }
    }
    if (fx.pct) {
      const p = t.def.boss ? fx.pct / 2 : fx.pct;
      const dmg = Math.max(1, Math.floor(t.hp * p / 100));
      clog(`「存在」被抹去了 ${dmg} 点`, 'log-meta');
      damageEnemy(t, dmg, true);
    }
    if (fx.poison) {
      const n = fx.poison + (hasRelic('bloodcandy') ? 1 : 0);
      t.poison += n; clog(`${nameOf(t)} 中毒 +${n}（共 ${t.poison} 层）`);
    }
    if (fx.doublePoison && t.poison > 0) { t.poison *= 2; clog(`${nameOf(t)} 的毒爆发为 ${t.poison} 层！`, 'log-dmg'); }
    if (fx.weak) { t.weak += fx.weak; clog(`${nameOf(t)} 虚弱 ${t.weak} 回合`); }
    if (fx.vuln) { t.vuln += fx.vuln; clog(`${nameOf(t)} 易伤 ${t.vuln} 回合`); }
    if (fx.stun) { t.stun = true; clog(`${nameOf(t)} 的「攻击」被改成了「发呆」！`, 'log-meta'); }
  }
  if (fx.block) { CB.heroBlock += fx.block; AudioSys.sfx('block'); }
  if (fx.str) { CB.heroStr += fx.str; clog(`力量 +${fx.str}`); }
  if (fx.draw) drawCards(fx.draw);
  if (fx.heal) { healHero(fx.heal); }
  if (fx.energy) { CB.energy += fx.energy; clog(`能量 +${fx.energy}`); }
  if (fx.sanGain) { changeSan(fx.sanGain); clog(`理智 +${fx.sanGain}`, 'log-heal'); }
  if (fx.invuln) { CB.invuln = true; clog('本回合免疫一切伤害。像读档一样。', 'log-meta'); }
  if (fx.summon) {
    if (CB.minions.length >= 3) { clog('随从已满（最多 3 只）！'); }
    else {
      const m = { ...fx.summon, maxHp: fx.summon.hp, atk: fx.summon.atk + b.minionAtk + (hasRelic('whistle') ? 2 : 0) };
      CB.minions.push(m);
      clog(`${m.name} 加入了战斗！（${m.atk}攻/${m.hp}血）`);
    }
  }
}

/* ─── 伤害结算 ─── */
function damageEnemy(e, dmg, pierce = false) {
  if (!e.alive) return;
  if (e.vuln > 0 && !pierce) dmg = Math.floor(dmg * 1.5);
  let rem = dmg;
  if (!pierce && e.block > 0) {
    const absorbed = Math.min(e.block, rem);
    e.block -= absorbed; rem -= absorbed;
  }
  e.hp -= rem;
  clog(`${nameOf(e)} 受到 ${rem} 点伤害`, 'log-dmg');
  AudioSys.sfx('attack');
  if (e.hp <= 0) {
    e.alive = false; e.hp = 0;
    clog(`${nameOf(e)} 倒下了！`);
    AudioSys.sfx('die');
  }
}

function damageHero(dmg, source, psychic = false) {
  if (CB && CB.invuln && !psychic) { clog('无敌：伤害被「假死」吞掉了。', 'log-meta'); return; }
  if (CB && !CB.mirrorUsed && hasRelic('mirror') && !psychic) {
    CB.mirrorUsed = true;
    dmg = Math.max(0, dmg - 8);
    clog('碎裂的镜子替你挡下了一部分伤害（-8）');
  }
  if (CB && CB.heroVuln > 0 && !psychic) dmg = Math.floor(dmg * 1.5);
  let rem = dmg;
  if (CB && !psychic && CB.heroBlock > 0) {
    const absorbed = Math.min(CB.heroBlock, rem);
    CB.heroBlock -= absorbed; rem -= absorbed;
  }
  if (rem > 0) {
    run.hp -= rem;
    clog(`糖糖受到 ${rem} 点伤害${source ? `（来自${source}）` : ''}`, 'log-dmg');
    AudioSys.sfx('hurt'); shakeScreen();
  }
  if (run.hp < 0) run.hp = 0;
}

function healHero(n) {
  run.hp = Math.min(run.maxHp, run.hp + n);
  clog(`回复 ${n} 点生命`, 'log-heal');
  AudioSys.sfx('heal');
}

function nameOf(e) { return run.san < 30 && Math.random() < 0.3 ? scramble(e.def.name) : e.def.name; }

/* ─── 结束回合 ─── */
function endTurn() {
  if (CB.over) return;
  CB.selected = null;
  // 弃掉手牌
  CB.discard.push(...CB.hand.filter(c => !c.fake));
  CB.hand = [];
  // 随从行动
  for (const m of [...CB.minions]) {
    const alive = CB.enemies.filter(e => e.alive);
    if (alive.length === 0) break;
    const t = alive[0];
    damageEnemy(t, m.atk);
    clog(`${m.name} 撞向敌人！`);
    if (m.poison) { t.poison += m.poison; clog(`${nameOf(t)} 中毒 +${m.poison}`); }
    if (checkEnd()) { renderCombat(); return; }
  }
  // 敌人行动
  for (const e of CB.enemies) {
    if (!e.alive) continue;
    // 中毒结算
    if (e.poison > 0) {
      damageEnemy(e, e.poison, true);
      clog(`${nameOf(e)} 的毒发作（${e.poison} 层）`);
      e.poison = Math.max(0, e.poison - 1);
      if (!e.alive) { if (checkEnd()) { renderCombat(); return; } continue; }
    }
    if (e.stun) { e.stun = false; clog(`${nameOf(e)} 发了一回合的呆……`, 'log-meta'); e.moveIdx++; continue; }
    const mv = e.def.moves[e.moveIdx % e.def.moves.length];
    e.moveIdx++;
    enemyAct(e, mv);
    if (run.hp <= 0) break;
  }
  if (checkEnd()) { renderCombat(); return; }
  // 叙述者二阶段演出
  const boss = CB.enemies.find(e => e.def.final && e.alive);
  if (boss && boss.hp < boss.maxHp / 2 && !CB.phase2) {
    CB.phase2 = true;
    glitchFlash(1); AudioSys.setDetune(0.8);
    clog('「剧本……烧掉好了。」叙述者的声音开始失真。', 'log-meta');
    shakeScreen();
  }
  setTimeout(startTurn, 350);
}

function enemyAct(e, mv) {
  if (mv.t === 'atk' || mv.t === 'atk_san') {
    const hits = mv.hits || 1;
    for (let i = 0; i < hits; i++) {
      let dmg = mv.dmg + e.str;
      if (e.weak > 0) dmg = Math.floor(dmg * 0.75);
      // 随从优先挡刀
      if (CB.minions.length > 0) {
        const m = CB.minions[Math.floor(Math.random() * CB.minions.length)];
        m.hp -= dmg;
        clog(`${m.name} 替糖糖挡下了 ${dmg} 点伤害！`);
        if (m.hp <= 0) { CB.minions = CB.minions.filter(x => x !== m); clog(`${m.name} 消散了……`, 'log-dmg'); }
      } else {
        damageHero(dmg, nameOf(e));
      }
      if (run.hp <= 0) return;
    }
    if (mv.san) { changeSan(-mv.san); clog(`理智被侵蚀 -${mv.san}`, 'log-meta'); AudioSys.sfx('san'); }
  } else if (mv.t === 'block') {
    e.block += mv.n; clog(`${nameOf(e)} 获得了 ${mv.n} 点护甲`);
  } else if (mv.t === 'buff') {
    e.str += mv.str; clog(`${nameOf(e)} 的力量提升了 +${mv.str}`);
  } else if (mv.t === 'debuff') {
    if (mv.weak) { CB.heroWeak += mv.weak; clog(`糖糖陷入虚弱 ${CB.heroWeak} 回合`, 'log-dmg'); }
    if (mv.vuln) { CB.heroVuln += mv.vuln; clog(`糖糖陷入易伤 ${CB.heroVuln} 回合`, 'log-dmg'); }
  }
}

/* ─── 胜负判定 ─── */
function checkEnd() {
  if (CB.over) return true;
  // Boss 战理智归零 → 隐藏结局
  if (CB.opts.boss && run.san <= 0) {
    CB.over = true;
    setTimeout(() => CB.opts.onHiddenEnd(), 600);
    return true;
  }
  if (run.hp <= 0) {
    CB.over = true;
    setTimeout(() => CB.opts.onLose(), 800);
    return true;
  }
  if (CB.enemies.every(e => !e.alive)) {
    CB.over = true;
    setTimeout(() => CB.opts.onWin(), 700);
    return true;
  }
  return false;
}

/* ─── 渲染 ─── */
function renderCombat() {
  if (!CB) return;
  const glitch = run.san < 30 ? 0.7 : run.san < 60 ? 0.35 : (SAVE.loops > 2 ? 0.15 : 0);
  // 敌人
  const row = document.getElementById('enemy-row');
  row.innerHTML = '';
  for (const e of CB.enemies) {
    const unit = document.createElement('div');
    unit.className = 'enemy-unit' + (e.alive ? '' : ' dead');
    const size = e.def.boss ? 108 : 76;
    const mv = e.def.moves[e.moveIdx % e.def.moves.length];
    let intent = intentText(e, mv);
    if (run.san < 30 && Math.random() < 0.35) intent = scramble(intent);
    unit.innerHTML = `
      <div class="intent">${e.alive ? (e.stun ? '💤 发呆' : intent) : ''}</div>
      <div class="enemy-canvas-box"><canvas width="${size}" height="${size}"></canvas></div>
      <div class="enemy-name">${run.san < 30 ? scramble(e.def.name) : e.def.name}${e.block > 0 ? ` 🛡${e.block}` : ''}</div>
      <div class="bar hp-bar"><div class="bar-fill" style="width:${e.hp / e.maxHp * 100}%"></div>
        <span class="bar-text">${e.hp}/${e.maxHp}</span></div>
      <div class="status-row">${statusText(e)}</div>`;
    if (e.alive) {
      Art.enemy(unit.querySelector('canvas'), e.def, glitch);
      if (CB.selected && CARDS[CB.selected.cid].target) {
        unit.classList.add('targetable');
        unit.onclick = () => playCard(CB.selected, e);
      }
    }
    row.appendChild(unit);
  }
  // 幻影敌人（不可交互）
  if (CB.phantom) {
    const unit = document.createElement('div');
    unit.className = 'enemy-unit phantom';
    unit.innerHTML = `<div class="intent">攻击 99</div>
      <div class="enemy-canvas-box"><canvas width="76" height="76"></canvas></div>
      <div class="enemy-name">${scramble(CB.phantom.name)}</div>
      <div class="bar hp-bar"><div class="bar-fill" style="width:100%"></div><span class="bar-text">??/??</span></div>`;
    Art.enemy(unit.querySelector('canvas'), CB.phantom, 0.8);
    row.appendChild(unit);
  }
  // 主角
  const heroCanvas = document.getElementById('hero-art');
  Art.hero(heroCanvas, glitch);
  document.getElementById('hero-hp-fill').style.width = (run.hp / run.maxHp * 100) + '%';
  document.getElementById('hero-hp-text').textContent = `${run.hp}/${run.maxHp}${CB.heroBlock > 0 ? ` 🛡${CB.heroBlock}` : ''}`;
  document.getElementById('hero-san-fill').style.width = (run.san / run.maxSan * 100) + '%';
  document.getElementById('hero-san-text').textContent = `理智 ${run.san}/${run.maxSan}`;
  const hs = [];
  if (CB.heroStr > 0) hs.push(`💪${CB.heroStr}`);
  if (CB.heroWeak > 0) hs.push(`💔虚弱${CB.heroWeak}`);
  if (CB.heroVuln > 0) hs.push(`🎯易伤${CB.heroVuln}`);
  if (CB.invuln) hs.push('✨无敌');
  document.getElementById('hero-status').textContent = hs.join(' ');
  // 随从
  const mrow = document.getElementById('minion-row');
  mrow.innerHTML = '';
  for (const m of CB.minions) {
    const u = document.createElement('div');
    u.className = 'minion-unit';
    u.innerHTML = `<div class="minion-name">${m.name} ⚔${m.atk}${m.poison ? ` ☠${m.poison}` : ''}</div>
      <canvas width="52" height="52"></canvas>
      <div class="bar hp-bar"><div class="bar-fill" style="width:${m.hp / m.maxHp * 100}%"></div>
      <span class="bar-text">${m.hp}/${m.maxHp}</span></div>`;
    Art.minion(u.querySelector('canvas'), m, glitch);
    mrow.appendChild(u);
  }
  // 手牌
  const hand = document.getElementById('hand-row');
  hand.innerHTML = '';
  for (const inst of CB.hand) {
    const def = CARDS[inst.cid];
    const san = inst.fake ? 0 : effSanCost(def, inst);
    const playable = !inst.fake && def.cost <= CB.energy && san <= run.san && !CB.over;
    const el = makeCardEl(inst, { onClick: () => playable && playCard(inst) });
    if (!playable) el.classList.add('unplayable');
    if (CB.selected === inst) el.classList.add('selected');
    hand.appendChild(el);
  }
  // 资源
  document.getElementById('energy-text').textContent = `${CB.energy}/${CB.energyMax}`;
  document.getElementById('draw-count').textContent = CB.drawPile.length;
  document.getElementById('discard-count').textContent = CB.discard.length;
}

function intentText(e, mv) {
  const dmg = mv.dmg != null ? mv.dmg + e.str : 0;
  switch (mv.t) {
    case 'atk': return `⚔ 攻击 ${dmg}${mv.hits > 1 ? '×' + mv.hits : ''}`;
    case 'atk_san': return `⚔ ${dmg} + 🧠侵蚀${mv.san}`;
    case 'block': return `🛡 防御 ${mv.n}`;
    case 'buff': return `💪 强化 +${mv.str}`;
    case 'debuff': return `💔 削弱`;
    default: return '？';
  }
}
function statusText(e) {
  const s = [];
  if (e.poison > 0) s.push(`☠${e.poison}`);
  if (e.weak > 0) s.push(`💔${e.weak}`);
  if (e.vuln > 0) s.push(`🎯${e.vuln}`);
  if (e.str > 0) s.push(`💪${e.str}`);
  return s.join(' ');
}
