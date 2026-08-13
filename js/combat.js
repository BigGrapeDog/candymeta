/* ═══════ combat.js · 卡牌战斗引擎 ═══════ */
let CB = null; // 当前战斗状态

function hasRelic(id) { return run && run.relics.includes(id); }
/* 卡牌等级：lv0 普通 / lv1 强化(+) / lv2 二度强化(++)
   lv2 = 升级效果再叠加一次（up2 可单独指定，为未来的差异化升级预留端口） */
function cardLv(inst) { return inst.lv != null ? inst.lv : (inst.up ? 1 : 0); }
function cardFx(card, lv) {
  if (!lv) return card.fx;
  let fx = Object.assign({}, card.fx, card.up);
  if (lv >= 2) {
    if (card.up2) {
      fx = Object.assign(fx, card.up2); // 显式二段强化（差异化升级端口）
    } else if (card.up) {
      // 通用二段强化：lv0→lv1 的数值增量再叠加一次
      for (const [k, v] of Object.entries(card.up)) {
        if (typeof v === 'number' && typeof card.fx[k] === 'number') fx[k] = v + (v - card.fx[k]);
      }
      // 召唤物：攻/血同步再强化一次
      if (card.up.summon && card.fx.summon) {
        fx.summon = Object.assign({}, fx.summon, {
          atk: fx.summon.atk + (fx.summon.atk - card.fx.summon.atk),
          hp: fx.summon.hp + (fx.summon.hp - card.fx.summon.hp),
        });
      }
    }
  }
  return fx;
}
function effSanCost(card, inst) {
  let s = (card.san || 0);
  const fx = cardFx(card, cardLv(inst));
  s += fx.sanCost || 0;
  if (card.type === 'corrupt' && hasRelic('deadpixel')) s = Math.max(1, s - 2);
  return s;
}

/* ─── 卡牌元素（战斗/商店/奖励共用） ─── */
function makeCardEl(inst, opts = {}) {
  const def = CARDS[inst.cid];
  const lv = cardLv(inst);
  const el = document.createElement('div');
  el.className = 'card' + (lv >= 2 ? ' upgraded2' : lv >= 1 ? ' upgraded' : '') + (def.type === 'corrupt' ? ' corrupt' : '') + (inst.fake ? ' fake-card' : '');
  const san = effSanCost(def, inst);
  let name = def.name + (lv >= 2 ? '++' : lv >= 1 ? '+' : '');
  let desc = def.desc(lv >= 1);
  if (lv >= 2) desc += '<br><span class="lv2note">⬆⬆ 二度强化：全部数值再度提升</span>';
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
  if (opts.onHover) el.addEventListener('mouseenter', () => opts.onHover(inst, el));
  return el;
}

/* ─── 开始战斗 ─── */
function startCombat(enemyIds, opts) {
  const b = getBonuses();
  // 轮回越久，世界越凶：敌人生命随轮回数成长（封顶 +60%）
  const hpMul = 1 + Math.min(0.6, SAVE.loops * 0.08);
  CB = {
    opts,
    enemies: enemyIds.map(id => {
      const def = ENEMIES[id];
      const hp = Math.round(def.hp * hpMul);
      return { id, def, hp, maxHp: hp, block: 0, armor: def.armor || 0, poison: 0, weak: 0, vuln: 0, str: 0, stun: false, moveIdx: Math.floor(Math.random() * 2), alive: true };
    }),
    heroBlock: 0, heroStr: hasRelic('badge') ? 1 : 0,
    heroWeak: 0, heroVuln: 0, invuln: false, mirrorUsed: false,
    minions: [],
    energyMax: 3 + b.energy,
    energy: 0, turn: 0,
    drawPile: shuffle(run.deck.map(c => ({ ...c }))),
    discard: [], hand: [],
    selected: null, over: false,
    phantom: null, lastCard: null,
  };
  // 低理智幻觉：幻影敌人
  if (run.san < 30 && !opts.boss) {
    const pool = FLOORS[run.floor].pool;
    CB.phantom = ENEMIES[pool[Math.floor(Math.random() * pool.length)]] || null;
  }
  if (hasRelic('sanitymask')) changeSan(5, true);
  // 环境理智侵蚀：第 3 层起，空气里开始有低语
  const drain = FLOORS[run.floor].sanDrain || 0;
  if (drain > 0) {
    changeSan(-drain, true);
    const whispers = ['这里的空气在低语……', '墙壁的缝隙里有视线。', '你听见翻页声，但这里没有书。', '「别看。」你想。'];
    clog(`${whispers[Math.floor(Math.random() * whispers.length)]}（理智 -${drain}）`, 'log-meta');
  }
  showScreen('screen-combat');
  AudioSys.sfx('event');
  AudioSys.refreshMode(); // v2.5.0：Boss 战切换激战 BGM
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
  // 叙述者的篡改（真最终 Boss 机制）
  CB.intentScramble = false;
  const nar = CB.enemies.find(e => e.def.final && e.alive);
  if (nar && (CB.phase2 || CB.turn % 4 === 0)) narratorTamper(!!CB.phase2);
  renderCombat();
}

/* 叙述者回合篡改：涂白手牌 / 搅乱意图 / 撕掉卡牌 */
function narratorTamper(phase2) {
  const mode = phase2 ? CB.turn % 3 : 0;
  if (mode === 0) {
    const real = CB.hand.filter(c => !c.fake);
    if (real.length) {
      const c = real[Math.floor(Math.random() * real.length)];
      c.fake = true;
      clog(`叙述者把「${CARDS[c.cid].name}」涂成了空白。`, 'log-meta');
    }
  } else if (mode === 1) {
    CB.intentScramble = true;
    clog('叙述者搅乱了剧本——你读不懂敌人的意图了！', 'log-meta');
  } else {
    const pile = CB.drawPile.length ? CB.drawPile : CB.discard;
    if (pile.length) {
      const i = Math.floor(Math.random() * pile.length);
      const c = pile.splice(i, 1)[0];
      clog(`叙述者从剧本里撕掉了「${CARDS[c.cid].name}」！（本场战斗移除）`, 'log-meta');
    }
  }
  glitchFlash(0.5);
  AudioSys.sfx('glitch');
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
  const fx = cardFx(def, cardLv(inst));
  applyCardFx(def, fx, target);
  CB.hand = CB.hand.filter(c => c !== inst);
  if (fx.exhaust) clog(`「${def.name}」化作光点消散了。（本场战斗消耗）`, 'log-meta');
  else CB.discard.push(inst);
  if (!fx.mirror) CB.lastCard = { def, fx }; // v2.7.0 镜面糖纸记录上一张牌（防止套娃）
  AudioSys.sfx(def.type === 'corrupt' ? 'glitch' : 'card');
  if (def.type === 'corrupt') glitchFlash(0.3);
  checkEnd();
  renderCombat();
}

function applyCardFx(def, fx, target) {
  const b = getBonuses();
  if (fx.selfHp) { run.hp = Math.max(1, run.hp - fx.selfHp); clog(`失去 ${fx.selfHp} 点生命`, 'log-dmg'); }
  const targets = fx.all ? CB.enemies.filter(e => e.alive) : (target ? [target] : []);
  let dealtDmg = false;
  for (const t of targets) {
    if (fx.dmg) {
      const hits = fx.hits || 1;
      for (let i = 0; i < hits; i++) {
        let dmg = fx.dmg + CB.heroStr;
        if (fx.bonusIfPoison && t.poison > 0) dmg += fx.bonusIfPoison;
        if (fx.msd) dmg += Math.floor((run.maxSan - run.san) / 10) * fx.msd; // v2.7.0 理智缺口加伤
        if (CB.heroWeak > 0) dmg = Math.floor(dmg * 0.75);
        damageEnemy(t, dmg);
        dealtDmg = true;
      }
    }
    if (fx.armorDmg) { // v2.7.0 护甲转伤害
      const dmg = Math.max(0, CB.heroBlock * fx.armorDmg);
      if (dmg > 0) { clog(`盾牌砸出 ${dmg} 点伤害！`, 'log-dmg'); damageEnemy(t, dmg); dealtDmg = true; }
      else clog('没有护甲可砸……', 'log-meta');
    }
    if (fx.sacMinion) { // v2.7.0 献祭随从
      if (!CB.minions.length) clog('没有随从可以献祭……', 'log-meta');
      else {
        const m = [...CB.minions].sort((a, c) => (a.hp + a.atk) - (c.hp + c.atk))[0];
        const dmg = (m.atk + m.hp) * fx.sacMinion;
        clog(`${m.name} 化作了一团光。`, 'log-meta');
        minionDie(m, true);
        damageEnemy(t, dmg);
        dealtDmg = true;
      }
    }
    if (fx.pct) {
      const p = t.def.boss ? fx.pct / 2 : fx.pct;
      const dmg = Math.max(1, Math.floor(t.hp * p / 100));
      clog(`「存在」被抹去了 ${dmg} 点`, 'log-meta');
      damageEnemy(t, dmg, true);
      dealtDmg = true;
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
  if (fx.lifeDrain && dealtDmg) healHero(fx.lifeDrain); // v2.7.0 吸血
  if (fx.gold) { run.gold += fx.gold; clog(`金币 +${fx.gold}`, 'log-heal'); AudioSys.sfx('coin'); } // v2.7.0 淘金
  if (fx.minionBuff && CB.minions.length) { // v2.7.0 随从强化
    CB.minions.forEach(m => { m.hp += fx.minionBuff.hp; m.maxHp += fx.minionBuff.hp; m.atk += fx.minionBuff.atk; });
    clog(`随从们生命 +${fx.minionBuff.hp}、攻击 +${fx.minionBuff.atk}！`);
  }
  if (fx.mirror) { // v2.7.0 镜面：重打出上一张牌
    const last = CB.lastCard;
    if (!last || last.def === def) clog('镜面里空空如也……（本回合还没打出过其他牌）', 'log-meta');
    else {
      clog(`镜面糖纸映出了「${last.def.name}」！`, 'log-meta');
      applyCardFx(last.def, last.fx, target);
    }
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
  // 装甲：每次攻击固定减伤（装甲流端口）
  if (!pierce && (e.armor || 0) > 0 && rem > 0) {
    const before = rem;
    rem = Math.max(1, rem - e.armor);
    if (before !== rem) clog(`${nameOf(e)} 的装甲抵消了 ${before - rem} 点伤害`, 'log-meta');
  }
  e.hp -= rem;
  clog(`${nameOf(e)} 受到 ${rem} 点伤害`, 'log-dmg');
  AudioSys.sfx('attack');
  if (e.hp <= 0) {
    e.alive = false; e.hp = 0;
    clog(`${nameOf(e)} 倒下了！`);
    AudioSys.sfx('die');
    // 图鉴 & 战绩
    if (typeof cxEnemy === 'function') cxEnemy(e.id);
    if (SAVE && SAVE.stats) SAVE.stats.totalKills++;
    // 分裂机制（棉花糖巨像）
    if (e.def.splitInto && !e.splitDone) {
      e.splitDone = true;
      clog('巨像裂开了——里面滚出了两个小家伙！', 'log-meta');
      glitchFlash(0.3);
      for (const id of e.def.splitInto) {
        const def = ENEMIES[id];
        CB.enemies.push({ id, def, hp: def.hp, maxHp: def.hp, block: 0, armor: def.armor || 0, poison: 0, weak: 0, vuln: 0, str: 0, stun: false, moveIdx: 0, alive: true });
      }
    }
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

/* 随从消散：召唤物的代价——失去它们会磨损理智 */
function minionDie(m, silent) {
  CB.minions = CB.minions.filter(x => x !== m);
  if (run.stats) run.stats.minionDeaths++;
  clog(`${m.name} 消散了……它最后看了你一眼。`, 'log-dmg');
  changeSan(-3);
  clog('理智 -3（失去随从的悲伤，是召唤术的代价）', 'log-meta');
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
        if (m.hp <= 0) minionDie(m);
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
  } else if (mv.t === 'heal') {
    e.hp = Math.min(e.maxHp, e.hp + mv.n);
    clog(`${nameOf(e)} 回复了 ${mv.n} 点生命！`, 'log-heal');
  } else if (mv.t === 'armor') {
    e.armor = (e.armor || 0) + mv.n;
    clog(`${nameOf(e)} 的装甲强化到 ${e.armor} 点！（每次受击固定减伤）`, 'log-meta');
  } else if (mv.t === 'summon') {
    if (CB.enemies.filter(x => x.alive).length < 4) {
      const def = ENEMIES[mv.id];
      CB.enemies.push({ id: mv.id, def, hp: def.hp, maxHp: def.hp, block: 0, armor: def.armor || 0, poison: 0, weak: 0, vuln: 0, str: 0, stun: false, moveIdx: 0, alive: true });
      clog(`${nameOf(e)} 召来了 ${def.name}！`, 'log-meta');
      AudioSys.sfx('event');
    } else {
      clog(`${nameOf(e)} 想召唤援军，但战场太挤了……`, 'log-meta');
    }
  } else if (mv.t === 'charm') {
    // 策反：夺走你最强的随从，让它调转枪口
    if (CB.minions.length > 0) {
      const m = CB.minions.reduce((a, b) => (a.atk >= b.atk ? a : b));
      CB.minions = CB.minions.filter(x => x !== m);
      if (run.stats) run.stats.minionDeaths++;
      const def = { name: '被策反的' + m.name, hp: Math.max(1, m.hp), color: m.color || '#b06cff', shape: m.shape || 'blob', seed: m.seed || 7, gold: [0, 0], boss: false, moves: [{ t: 'atk', dmg: Math.max(2, m.atk) }] };
      CB.enemies.push({ id: 'charmed', def, hp: Math.max(1, m.hp), maxHp: m.maxHp || m.hp, block: 0, armor: 0, poison: 0, weak: 0, vuln: 0, str: 0, stun: false, moveIdx: 0, alive: true });
      clog(`${m.name} 的眼神变了——它不再认识你了！`, 'log-meta');
      glitchFlash(0.5); AudioSys.sfx('glitch');
      changeSan(-3);
      clog('理智 -3（被背叛的心痛）', 'log-meta');
    } else {
      clog(`${nameOf(e)} 挥舞提线……但你没有随从。它愣了一下。`, 'log-meta');
    }
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
    if (CB.intentScramble) intent = scramble(intent);
    else if (run.san < 30 && Math.random() < 0.35) intent = scramble(intent);
    unit.innerHTML = `
      <div class="intent" ${e.alive ? `data-tip="${e.stun ? '它被「叙述篡改」眩晕了，下回合不行动' : intentTip(e, mv)}"` : ''}>${e.alive ? (e.stun ? '💤 发呆' : intent) : ''}</div>
      <div class="enemy-canvas-box"><canvas width="${size}" height="${size}"></canvas>
        <div class="enemy-name">${run.san < 30 ? scramble(e.def.name) : e.def.name}${e.block > 0 ? ` 🛡${e.block}` : ''}</div></div>
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
      <div class="enemy-canvas-box"><canvas width="76" height="76"></canvas>
        <div class="enemy-name">${scramble(CB.phantom.name)}</div></div>
      <div class="bar hp-bar"><div class="bar-fill" style="width:100%"></div><span class="bar-text">??/??</span></div>`;
    Art.enemy(unit.querySelector('canvas'), CB.phantom, 0.8);
    row.appendChild(unit);
  }
  // 主角
  const heroCanvas = document.getElementById('hero-art');
  // v2.4.2 褪色机制发扬：理智越低，糖糖越苍白、越透明，崩坏感逐级加深
  const heroGlitch = run.san < 30 ? 0.7 : run.san < 60 ? 0.35 : 0;
  Art.hero(heroCanvas, heroGlitch);
  heroCanvas.style.transition = 'filter .6s';
  heroCanvas.style.filter =
    run.san < 10 ? 'saturate(.12) brightness(.8) opacity(.62)' :
    run.san < 30 ? 'saturate(.38) brightness(.87) opacity(.85)' :
    run.san < 60 ? 'saturate(.68) brightness(.93)' : '';
  document.getElementById('hero-hp-fill').style.width = (run.hp / run.maxHp * 100) + '%';
  document.getElementById('hero-hp-text').textContent = `${run.hp}/${run.maxHp}${CB.heroBlock > 0 ? ` 🛡${CB.heroBlock}` : ''}`;
  document.getElementById('hero-san-fill').style.width = (run.san / run.maxSan * 100) + '%';
  document.getElementById('hero-san-text').textContent = `理智 ${run.san}/${run.maxSan}`;
  const hs = [];
  if (CB.heroStr > 0) hs.push(statusChip('str', CB.heroStr));
  if (CB.heroWeak > 0) hs.push(statusChip('weak', CB.heroWeak));
  if (CB.heroVuln > 0) hs.push(statusChip('vuln', CB.heroVuln));
  if (CB.invuln) hs.push(statusChip('invuln'));
  document.getElementById('hero-status').innerHTML = hs.join(' ');
  // 随从
  const mrow = document.getElementById('minion-row');
  mrow.innerHTML = '';
  for (const m of CB.minions) {
    const u = document.createElement('div');
    u.className = 'minion-unit';
    u.innerHTML = `<div class="minion-name">${m.name} <span data-tip="随从攻击：你的回合结束后，随从自动攻击敌人">⚔${m.atk}</span>${m.poison ? ` <span data-tip="随从带毒：每次攻击附加 ${m.poison} 层中毒">☠${m.poison}</span>` : ''}</div>
      <canvas width="52" height="52"></canvas>
      <div class="bar hp-bar" data-tip="随从会替你承受敌人的攻击；但随从消散时，你将失去 3 点理智"><div class="bar-fill" style="width:${m.hp / m.maxHp * 100}%"></div>
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
    case 'heal': return `💚 回复 ${mv.n}`;
    case 'armor': return `🔰 装甲 +${mv.n}`;
    case 'summon': return `📣 召唤援军`;
    case 'charm': return `🌀 策反随从`;
    default: return '？';
  }
}
function intentTip(e, mv) {
  const dmg = mv.dmg != null ? mv.dmg + e.str : 0;
  switch (mv.t) {
    case 'atk': return `下回合意图：攻击 ${dmg} 点${mv.hits > 1 ? `，共 ${mv.hits} 次` : ''}（已含力量/虚弱修正）`;
    case 'atk_san': return `下回合意图：攻击 ${dmg} 点，并侵蚀你的理智 ${mv.san} 点`;
    case 'block': return `下回合意图：获得 ${mv.n} 点护甲（护甲在其下回合行动前清空）`;
    case 'buff': return `下回合意图：力量 +${mv.str}（之后每次攻击都更痛）`;
    case 'debuff': return `下回合意图：对你施加${mv.weak ? '虚弱' : ''}${mv.weak && mv.vuln ? '与' : ''}${mv.vuln ? '易伤' : ''}`;
    case 'heal': return `下回合意图：回复自身 ${mv.n} 点生命——尽快集火它！`;
    case 'armor': return `下回合意图：装甲 +${mv.n}（装甲使每次受到的攻击固定减伤，用多段攻击或下毒克制）`;
    case 'summon': return `下回合意图：召唤援军加入战斗`;
    case 'charm': return `下回合意图：策反你最强的随从，让它调转枪口！没有随从则无效`;
    default: return '意图不明';
  }
}
const STATUS_TIPS = {
  poison: '☠ 中毒：其回合开始时受到等于层数的伤害，之后层数 -1',
  weak: '💔 虚弱：造成的攻击伤害降低 25%（数字为剩余回合）',
  vuln: '🎯 易伤：受到的伤害提高 50%（数字为剩余回合）',
  str: '💪 力量：每次攻击附加等量额外伤害',
  invuln: '✨ 无敌：本回合免疫一切伤害',
  armor: '🔰 装甲：每次受到攻击时固定减伤（中毒/百分比伤害无视装甲）',
};
function statusChip(kind, n) {
  const icons = { poison: '☠', weak: '💔', vuln: '🎯', str: '💪', invuln: '✨', armor: '🔰' };
  return `<span data-tip="${STATUS_TIPS[kind]}">${icons[kind]}${n != null ? n : ''}</span>`;
}
function statusText(e) {
  const s = [];
  if ((e.armor || 0) > 0) s.push(statusChip('armor', e.armor));
  if (e.poison > 0) s.push(statusChip('poison', e.poison));
  if (e.weak > 0) s.push(statusChip('weak', e.weak));
  if (e.vuln > 0) s.push(statusChip('vuln', e.vuln));
  if (e.str > 0) s.push(statusChip('str', e.str));
  return s.join(' ');
}
