/* ═══════ main.js · 主流程状态机 ═══════ */
let run = null;

/* ─── 界面切换 ─── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ─── 理智变动（带全局演出） ─── */
function changeSan(n, silent = false) {
  if (!run) return;
  const before = run.san;
  run.san = Math.max(0, Math.min(run.maxSan, run.san + n));
  if (n < 0 && !silent && Math.abs(n) >= 3) glitchFlash(0.35);
  if (before >= 30 && run.san < 30) {
    clog?.('周围的颜色开始不对劲了……', 'log-meta');
    glitchFlash(0.7);
  }
  updateSanFX();
  if (document.getElementById('screen-combat').classList.contains('active')) renderCombat();
  else renderSidePanel();
}

/* ─── 开局 ─── */
function newRun() {
  const b = getBonuses();
  run = {
    floor: 0,
    hp: 60 + b.startHp, maxHp: 60 + b.startHp,
    san: 80 + b.startSan, maxSan: 80 + b.startSan + (hasRelic('sanitymask') ? 15 : 0),
    gold: 30 + b.startGold,
    deck: STARTER_DECK.map(cid => ({ cid, up: false })),
    relics: [],
    map: null,
    shards: 0, kills: 0, turns: 0,
    usedEvents: [],
    startTime: Date.now(),
  };
  SAVE.runs++;
  enterFloor(0, true);
}

function enterFloor(idx, first = false) {
  run.floor = idx;
  run.map = GameMap.generate(idx);
  document.body.dataset.theme = FLOORS[idx].theme;
  updateSanFX();
  const show = () => {
    showMapScreen();
    persistRun();
    say(STORY.floorIntro(idx));
  };
  if (first) {
    showMapScreen();
    say(STORY.intro(), () => say(STORY.floorIntro(0)));
    persistRun();
  } else {
    fadeTo(show);
  }
}

function persistRun() { SAVE.run = run; persistSave(); }

/* ─── 地图界面 ─── */
function showMapScreen() {
  showScreen('screen-map');
  renderHUD();
  renderSidePanel();
  GameMap.render(run.map);
  updateSanFX();
}

function renderHUD() {
  document.getElementById('map-hud').innerHTML =
    `<span>❤ <b>${run.hp}/${run.maxHp}</b></span>
     <span>🧠 <b>${run.san}/${run.maxSan}</b></span>
     <span>💰 <b>${run.gold}</b></span>
     <span>✦ <b>${run.shards}</b> 记忆碎片</span>
     <span>🃏 ${run.deck.length} 张牌</span>
     <span>🔁 第 ${SAVE.loops + 1} 次轮回</span>
     <button class="btn btn-small" id="btn-pause">⚙ 菜单</button>`;
  document.getElementById('btn-pause').onclick = openPause;
}

/* ─── 局内暂停菜单 ─── */
function syncMuteButtons() {
  const label = SAVE.settings.muted ? '🔇 已静音' : '🔊 声音开启中';
  document.getElementById('set-mute').textContent = label;
  document.getElementById('pause-mute').textContent = label;
}
function toggleMute() {
  SAVE.settings.muted = !SAVE.settings.muted;
  persistSave();
  AudioSys.applyVolumes();
  syncMuteButtons();
}
function openPause() {
  AudioSys.sfx('click');
  document.getElementById('pause-music').value = SAVE.settings.music;
  document.getElementById('pause-sfx').value = SAVE.settings.sfx;
  syncMuteButtons();
  document.getElementById('pause-overlay').style.display = 'flex';
}
function closePause() { document.getElementById('pause-overlay').style.display = 'none'; }

function abandonRun(backToTitle = true) {
  const earned = run ? run.shards : 0;
  SAVE.shards += earned;
  SAVE.loops++;
  SAVE.run = null;
  persistSave();
  CB = null;
  closePause();
  if (!backToTitle) { newRun(); return; }
  run = null;
  fadeTo(() => {
    showScreen('screen-ending');
    document.getElementById('ending-title').textContent = '—— 冒险中断 ——';
    document.getElementById('ending-text').textContent =
      '糖糖朝你挥了挥手，走进了书页的边缘。\n\n旁白君松了口气："今天也辛苦啦。下次……还要继续哦。"';
    document.getElementById('ending-stats').textContent =
      `带回 ${earned} 枚记忆碎片（累计 ${SAVE.shards}）。`;
    document.body.dataset.theme = 'f1';
    run = null;
    updateSanFX();
  });
}

function renderSidePanel() {
  document.getElementById('side-stats').innerHTML =
    `攻击卡组 ${run.deck.length} 张<br>遗物 ${run.relics.length} 件<br>本局碎片 ✦${run.shards}`;
  const el = document.getElementById('side-relics');
  el.innerHTML = run.relics.length === 0 ? '<span style="opacity:.5">空空如也</span>' : '';
  for (const id of run.relics) {
    const r = RELICS[id];
    const chip = document.createElement('span');
    chip.className = 'relic-chip';
    chip.textContent = r.icon + ' ' + r.name;
    chip.title = r.desc;
    el.appendChild(chip);
  }
}

/* ─── 房间移动 ─── */
function moveToRoom(room) {
  run.map.pos = { x: room.x, y: room.y };
  room.visited = true;
  AudioSys.sfx('move');
  if (room.cleared) { showMapScreen(); persistRun(); return; }
  enterRoomContent(room);
}

function enterRoomContent(room) {
  switch (room.type) {
    case 'battle': startRoomCombat(room, false); break;
    case 'elite':  startRoomCombat(room, true); break;
    case 'boss':   enterBossRoom(room); break;
    case 'event':  openEvent(room); break;
    case 'shop':   openShop(room); break;
    case 'rest':   openRest(room); break;
  }
  renderHUD(); renderSidePanel();
}

/* ─── 战斗房间 ─── */
function pickEnemies(elite) {
  const cfg = FLOORS[run.floor];
  if (elite) return [cfg.elite];
  const twoChance = run.floor === 0 ? 0.35 : run.floor === 1 ? 0.45 : 0.5;
  const pick = () => cfg.pool[Math.floor(Math.random() * cfg.pool.length)];
  const list = [pick()];
  if (Math.random() < twoChance) list.push(pick());
  return list;
}

function startRoomCombat(room, elite) {
  const ids = elite ? [FLOORS[run.floor].elite] : pickEnemies(false);
  startCombat(ids, {
    elite, boss: false,
    onWin: () => combatReward(room, elite, false),
    onLose: () => gameOver(),
    onHiddenEnd: () => {}, // 普通战斗不会触发
  });
}

function enterBossRoom(room) {
  const floor = run.floor;
  // 第4层且有裂缝感知：给"不进去"的选项
  if (floor === 3 && trueEndingReady()) {
    say(STORY.bossDoor(), () => {
      openChoiceScreen('绘本城堡 · 大门', '🚪', [
        { t: '推开大门，讨伐魔王（正常结局路线）', eff: () => startBossFight(room) },
        { t: '【不进去】——走向锁孔里的裂缝（???）', eff: () => { room.cleared = true; enterFloor(4); } },
      ]);
    });
    return;
  }
  startBossFight(room);
}

function startBossFight(room) {
  const bossId = FLOORS[run.floor].boss;
  const intro = bossId === 'narrator' ? STORY.narratorFight() :
    [{ who: '旁白君', text: `决战！${ENEMIES[bossId].name} 出现了！加油啊，糖糖！` }];
  say(intro, () => {
    startCombat([bossId], {
      boss: true,
      onWin: () => {
        room.cleared = true;
        run.shards += 2;
        run.kills++;
        if (bossId === 'narrator') showEnding('true');
        else if (run.floor === 3) showEnding('normal');
        else { floorCleared(); }
      },
      onLose: () => gameOver(),
      onHiddenEnd: () => hiddenEnding(),
    });
  });
}

/* ─── 战斗结算 ─── */
function combatReward(room, elite, boss) {
  room.cleared = true;
  run.kills++;
  let gold = 0;
  for (const e of CB.enemies) gold += e.def.gold[0] + Math.floor(Math.random() * (e.def.gold[1] - e.def.gold[0] + 1));
  if (hasRelic('coinbag')) gold = Math.floor(gold * 1.3);
  run.gold += gold;
  // 碎片掉率：普通战斗 35% 掉 1 枚，精英固定 1 枚
  let shards = elite ? 1 : (Math.random() < 0.35 ? 1 : 0);
  if (elite && hasRelic('bookmark')) shards += 1;
  run.shards += shards;
  if (hasRelic('candyjar')) run.hp = Math.min(run.maxHp, run.hp + 3);
  AudioSys.sfx('victory'); AudioSys.sfx('coin');
  // 精英战先结算遗物
  let relicGot = null;
  if (elite) {
    relicGot = rollRelic();
    if (relicGot) { run.relics.push(relicGot); AudioSys.sfx('heal'); }
  }
  persistRun();
  // 奖励卡选择
  const cards = rollRewardCards(3);
  const relicInfo = relicGot ? ` 拾取遗物：${RELICS[relicGot].icon}${RELICS[relicGot].name}（${RELICS[relicGot].desc}）` : '';
  const shardInfo = shards > 0 ? `、+${shards} 记忆碎片` : '';
  showReward(
    `战斗胜利！+${gold} 金币${shardInfo}。${relicInfo} 选一张牌加入卡组：`,
    cards,
    () => { showMapScreen(); persistRun(); },
    true
  );
}

function rollRewardCards(n) {
  const pool = cardPool();
  const out = [];
  const weights = [['common', 55], ['uncommon', 33], ['rare', 12]];
  for (let i = 0; i < n; i++) {
    let rar;
    if (pool.corrupt.length && Math.random() < 0.18) rar = 'corrupt';
    else {
      const roll = Math.random() * 100;
      rar = roll < weights[0][1] ? 'common' : roll < weights[0][1] + weights[1][1] ? 'uncommon' : 'rare';
    }
    const list = pool[rar].length ? pool[rar] : pool.common;
    out.push({ cid: list[Math.floor(Math.random() * list.length)], up: false });
  }
  return out;
}

function rollRelic() {
  const pool = Object.keys(RELICS).filter(id => !run.relics.includes(id));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

/* 奖励卡选择浮层 */
function showReward(title, cards, onDone, allowSkip = true) {
  const ov = document.getElementById('reward-overlay');
  ov.style.display = 'flex';
  document.getElementById('reward-title').textContent = title;
  const box = document.getElementById('reward-cards');
  box.innerHTML = '';
  const done = () => { ov.style.display = 'none'; onDone(); };
  if (cards.length === 0) { setTimeout(done, 600); return; }
  for (const inst of cards) {
    box.appendChild(makeCardEl(inst, { onClick: () => { run.deck.push(inst); AudioSys.sfx('card'); done(); } }));
  }
  document.getElementById('btn-reward-skip').style.display = allowSkip ? '' : 'none';
  document.getElementById('btn-reward-skip').onclick = done;
}

function floorCleared() {
  run.shards += 1;
  SAVE.bestFloor = Math.max(SAVE.bestFloor, run.floor + 1);
  persistRun();
  enterFloor(run.floor + 1);
}

/* ─── 通用选择屏（复用事件界面） ─── */
function openChoiceScreen(title, icon, choices) {
  showScreen('screen-event');
  document.getElementById('event-title').textContent = title;
  document.getElementById('event-art').textContent = icon;
  document.getElementById('event-text').textContent = '';
  document.getElementById('event-result').textContent = '';
  document.getElementById('btn-event-leave').style.display = 'none';
  const box = document.getElementById('event-choices');
  box.innerHTML = '';
  for (const ch of choices) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = ch.t;
    btn.onclick = () => { AudioSys.sfx('click'); ch.eff(); };
    box.appendChild(btn);
  }
}

/* ─── 事件房间 ─── */
function openEvent(room) {
  const pool = EVENTS.filter(e => !run.usedEvents.includes(e.id));
  const ev = pool.length ? pool[Math.floor(Math.random() * pool.length)] : EVENTS[Math.floor(Math.random() * EVENTS.length)];
  run.usedEvents.push(ev.id);
  AudioSys.sfx('event');
  showScreen('screen-event');
  document.getElementById('event-title').textContent = ev.title;
  document.getElementById('event-art').textContent = ev.icon;
  let text = ev.text;
  if (run.san < 40) text = scrambleLine(text, 0.12);
  document.getElementById('event-text').textContent = text;
  document.getElementById('event-result').textContent = '';
  document.getElementById('btn-event-leave').style.display = 'none';
  const box = document.getElementById('event-choices');
  box.innerHTML = '';
  const ctx = {
    damage: n => { run.hp = Math.max(1, run.hp - n); },
    heal: n => { run.hp = Math.min(run.maxHp, run.hp + n); },
    san: n => changeSan(n),
    sanFull: () => { run.san = run.maxSan; updateSanFX(); },
    gold: n => { run.gold = Math.max(0, run.gold + n); },
    shard: n => { run.shards += n; },
    addCard: cid => run.deck.push({ cid, up: false }),
    removeRandomCard: () => {
      const i = Math.floor(Math.random() * run.deck.length);
      run.deck.splice(i, 1);
    },
    relic: () => { const r = rollRelic(); if (r) run.relics.push(r); },
  };
  for (const ch of ev.choices) {
    if (ch.cond && !ch.cond(run)) continue;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = ch.t;
    btn.onclick = () => {
      AudioSys.sfx('click');
      const res = ch.eff(run, ctx);
      box.innerHTML = '';
      document.getElementById('event-result').textContent = res;
      const leave = document.getElementById('btn-event-leave');
      leave.style.display = '';
      leave.onclick = () => { room.cleared = true; persistRun(); showMapScreen(); };
      renderHUD(); renderSidePanel();
    };
    box.appendChild(btn);
  }
}

/* ─── 商店 ─── */
function openShop(room) {
  const b = getBonuses();
  const discount = 1 - (b.shopDiscount / 100) - (hasRelic('coupon') ? 0.2 : 0);
  const price = base => Math.max(1, Math.floor(base * discount));
  const stock = {
    cards: rollRewardCards(3).map(inst => ({ inst, price: price((CARDS[inst.cid].rarity === 'rare' ? 75 : CARDS[inst.cid].rarity === 'uncommon' ? 55 : CARDS[inst.cid].rarity === 'corrupt' ? 65 : 40) + run.floor * 5), sold: false })),
    relics: [],
    heal: { price: price(30), sold: false },
    remove: { price: price(50), sold: false },
  };
  for (let i = 0; i < 2; i++) {
    const r = rollRelic();
    if (r && !stock.relics.find(x => x.id === r)) stock.relics.push({ id: r, price: price(90 + run.floor * 10), sold: false });
  }
  showScreen('screen-shop');
  const flavors = [
    '老板娘笑眯眯的："欢迎来到棉花糖杂货铺～"',
    '"新到的货，都是上一任勇者用剩下的。"……等等，什么？',
    '货架上的商品标签偶尔会闪一下，变成乱码，又变回来。',
  ];
  document.getElementById('shop-flavor').textContent = flavors[Math.min(SAVE.loops, flavors.length - 1)];
  const render = () => {
    document.getElementById('shop-gold').textContent = `持有金币：${run.gold} 💰`;
    const cardBox = document.getElementById('shop-cards');
    cardBox.innerHTML = '';
    for (const item of stock.cards) {
      if (item.sold) continue;
      const wrap = document.createElement('div');
      wrap.className = 'shop-item';
      wrap.appendChild(makeCardEl(item.inst, {
        price: item.price,
        onClick: () => {
          if (run.gold < item.price) return;
          run.gold -= item.price; item.sold = true;
          run.deck.push(item.inst); AudioSys.sfx('coin');
          render();
        },
      }));
      cardBox.appendChild(wrap);
    }
    const relBox = document.getElementById('shop-relics');
    relBox.innerHTML = '';
    for (const item of stock.relics) {
      if (item.sold) continue;
      const wrap = document.createElement('div');
      wrap.className = 'shop-item';
      const btn = document.createElement('button');
      btn.className = 'btn svc-btn';
      btn.innerHTML = `${RELICS[item.id].icon} ${RELICS[item.id].name}<br><small>${RELICS[item.id].desc}</small>`;
      btn.disabled = run.gold < item.price;
      btn.onclick = () => { run.gold -= item.price; item.sold = true; run.relics.push(item.id); AudioSys.sfx('coin'); render(); };
      wrap.appendChild(btn);
      const tag = document.createElement('div');
      tag.className = 'price-tag' + (run.gold < item.price ? ' cant' : '');
      tag.textContent = item.price + ' 金币';
      wrap.appendChild(tag);
      relBox.appendChild(wrap);
    }
    // 服务
    const svc = [
      { key: 'heal', label: `🍰 回复 20 生命`, eff: () => { run.hp = Math.min(run.maxHp, run.hp + 20); render(); } },
      { key: 'remove', label: `✂️ 删除 1 张牌`, eff: () => openRemoveCard(room, render) },
    ];
    for (const s of svc) {
      const item = stock[s.key];
      if (item.sold) continue;
      const wrap = document.createElement('div');
      wrap.className = 'shop-item';
      const btn = document.createElement('button');
      btn.className = 'btn svc-btn';
      btn.innerHTML = s.label;
      btn.disabled = run.gold < item.price;
      btn.onclick = () => {
        run.gold -= item.price; item.sold = true;
        AudioSys.sfx('coin');
        s.eff();
      };
      wrap.appendChild(btn);
      const tag = document.createElement('div');
      tag.className = 'price-tag' + (run.gold < item.price ? ' cant' : '');
      tag.textContent = item.price + ' 金币';
      wrap.appendChild(tag);
      relBox.appendChild(wrap);
    }
    renderHUD(); renderSidePanel();
  };
  document.getElementById('btn-shop-leave').onclick = () => { room.cleared = true; persistRun(); showMapScreen(); };
  render();
}

/* 删卡（商店服务/休息点共用） */
function openRemoveCard(room, cb) {
  const ov = document.getElementById('deck-overlay');
  ov.style.display = 'flex';
  const list = document.getElementById('deck-view-list');
  list.innerHTML = '';
  document.querySelector('#deck-overlay h3').textContent = '选择要删除的牌：';
  run.deck.forEach((inst, i) => {
    list.appendChild(makeCardEl(inst, { onClick: () => {
      run.deck.splice(i, 1);
      ov.style.display = 'none';
      AudioSys.sfx('glitch');
      if (cb) cb();
    } }));
  });
  document.getElementById('btn-deck-close').onclick = () => { ov.style.display = 'none'; if (cb) cb(); };
}

/* ─── 休息点 ─── */
function openRest(room) {
  const b = getBonuses();
  const boost = 1 + (b.restBoost / 100) + (hasRelic('pillow') ? 0.5 : 0);
  showScreen('screen-rest');
  const box = document.getElementById('rest-choices');
  box.innerHTML = '';
  const done = () => { room.cleared = true; persistRun(); showMapScreen(); };
  const opts = [
    { t: `🍖 烤棉花糖吃（回复 ${Math.floor(run.maxHp * 0.3 * boost)} 生命）`, eff: () => { run.hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp * 0.3 * boost)); AudioSys.sfx('heal'); done(); } },
    { t: `🕯️ 冥想（回复 ${Math.floor(12 * boost)} 理智）`, eff: () => { changeSan(Math.floor(12 * boost)); done(); } },
    { t: '✂️ 整理卡组（删除 1 张牌）', eff: () => openRemoveCard(room, done) },
    { t: '⬆️ 打磨卡牌（升级 1 张牌）', eff: () => {
        const ov = document.getElementById('deck-overlay');
        ov.style.display = 'flex';
        document.querySelector('#deck-overlay h3').textContent = '选择要升级的牌：';
        const list = document.getElementById('deck-view-list');
        list.innerHTML = '';
        const ups = run.deck.filter(c => !c.up);
        if (ups.length === 0) { ov.style.display = 'none'; done(); return; }
        ups.forEach(inst => list.appendChild(makeCardEl(inst, { onClick: () => {
          inst.up = true; ov.style.display = 'none'; AudioSys.sfx('heal'); done();
        } })));
        document.getElementById('btn-deck-close').onclick = () => { ov.style.display = 'none'; done(); };
      } },
  ];
  for (const o of opts) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = o.t;
    btn.onclick = () => { AudioSys.sfx('click'); o.eff(); };
    box.appendChild(btn);
  }
}

/* ─── 死亡 / 结局 ─── */
function gameOver() {
  const earned = run.shards;
  SAVE.shards += earned;
  SAVE.loops++;
  SAVE.bestFloor = Math.max(SAVE.bestFloor, run.floor + 1);
  SAVE.run = null;
  persistSave();
  AudioSys.sfx('die'); AudioSys.setDetune(0.6);
  fadeTo(() => {
    showScreen('screen-ending');
    document.getElementById('ending-title').textContent = '—— Game Over ——';
    document.getElementById('ending-text').textContent = STORY.gameover();
    document.getElementById('ending-stats').textContent =
      `本次冒险带回 ${earned} 枚记忆碎片（累计 ${SAVE.shards}）。它们不会消失。`;
    document.body.dataset.theme = 'f1';
    updateSanFX();
  });
}

function showEnding(kind) {
  const earned = run.shards;
  SAVE.shards += earned;
  SAVE.endings[kind] = true;
  SAVE.loops++;
  SAVE.wins++;
  if (kind === 'true') SAVE.flags.trueEnd = true;
  SAVE.run = null;
  persistSave();
  const info = STORY.endings[kind];
  fadeTo(() => {
    showScreen('screen-ending');
    document.getElementById('ending-title').textContent = info.title;
    document.getElementById('ending-text').textContent = info.text;
    document.getElementById('ending-stats').textContent =
      `带回 ${earned} 枚记忆碎片 · 第 ${SAVE.loops} 次轮回结束`;
    document.body.dataset.theme = kind === 'true' ? 'f5' : 'f1';
    AudioSys.setDetune(kind === 'normal' ? 0 : 0.3);
    AudioSys.sfx('victory');
  }, kind === 'normal' ? 600 : 1200);
}

function hiddenEnding() {
  AudioSys.sfx('crash');
  fakeCrash(() => {
    SAVE.corruptedBadge = true;
    showEnding('deleted');
  });
}

/* ─── 记忆回廊 ─── */
function renderMetaTree() {
  document.getElementById('meta-shard-count').textContent = SAVE.shards;
  const tree = document.getElementById('meta-tree');
  tree.innerHTML = '';
  for (const node of META_TREE) {
    const owned = SAVE.unlocked.includes(node.id);
    const reqMet = node.req.every(r => SAVE.unlocked.includes(r));
    const el = document.createElement('div');
    el.className = 'meta-node' + (owned ? ' owned' : '') + (!reqMet ? ' locked' : '') + (node.story ? ' story' : '');
    el.innerHTML = `<h5>${node.story ? '📖 ' : ''}${node.name}</h5><p>${node.desc}</p>
      <div class="cost">${owned ? '✓ 已解锁' : reqMet ? `${node.cost} ✦` : '🔒 需要先解锁前置'}</div>`;
    if (!owned && reqMet) {
      el.onclick = () => {
        if (SAVE.shards < node.cost) { AudioSys.sfx('glitch'); return; }
        SAVE.shards -= node.cost;
        SAVE.unlocked.push(node.id);
        AudioSys.sfx('victory');
        persistSave();
        renderMetaTree();
        if (node.story) {
          const who = '糖糖';
          say([{ who, text: node.desc.replace('【剧情】', ''), glitch: 0.3 }]);
        }
      };
    }
    tree.appendChild(el);
  }
}

/* ─── 结局图鉴 ─── */
function renderEndings() {
  const list = document.getElementById('endings-list');
  list.innerHTML = '';
  const all = [
    { key: 'normal', name: '结局 · 永远的第一章', hint: '讨伐魔王。' },
    { key: 'true', name: '真结局 · 觉醒', hint: '集齐记忆残片与裂缝感知，拒绝走进那扇门。' },
    { key: 'deleted', name: '隐藏结局 · 删除', hint: '在 Boss 战中，让理智归零。' },
  ];
  for (const e of all) {
    const got = SAVE.endings[e.key];
    const div = document.createElement('div');
    div.className = 'meta-node' + (got ? ' owned story' : ' locked');
    div.innerHTML = `<h5>${got ? e.name : '？？？'}</h5><p>${got ? '已达成。' + (e.key === 'deleted' ? '存档界面留下了永久的徽章。' : '') : e.hint}</p>`;
    list.appendChild(div);
  }
  if (SAVE.corruptedBadge) {
    const badge = document.createElement('p');
    badge.style.cssText = 'text-align:center;margin-top:12px;color:#d6405c';
    badge.textContent = '▪ 存档完整性：89.3% —— 有一部分，永远找不回来了（它也不想回来）';
    list.appendChild(badge);
  }
}

/* ─── 标题与启动 ─── */
function refreshTitle() {
  const L = SAVE.loops;
  const titleEl = document.getElementById('game-title');
  const subEl = document.getElementById('game-subtitle');
  titleEl.classList.toggle('glitch-text', L >= 5);
  if (L === 0) { titleEl.textContent = '糖果勇者物语'; subEl.textContent = '～绘本王国的甜蜜冒险～'; }
  else if (L < 3) { titleEl.textContent = '糖果勇者物语'; subEl.textContent = '～绘本王国的甜蜜冒险～'; }
  else if (L < 5) { titleEl.textContent = '糖果勇者物语'; subEl.textContent = '～绘本王囗的甜̶蜜̶冒险～'; }
  else { titleEl.textContent = scrambleLine('糖果勇者物语', 0.15); subEl.textContent = '～救̶我̶～'; }
  if (SAVE.flags.trueEnd) { titleEl.textContent = '糖糖勇者物语'; subEl.textContent = '～这次，轮到我保护你～'; }
  document.getElementById('title-loop-hint').textContent =
    L === 0 ? '' : L < 3 ? `第 ${L + 1} 次轮回 · 糖糖好像做恶梦了` :
    L < 5 ? `第 ${L + 1} 次轮回 · 有什么东西正在醒来` :
    `第 ${L + 1} 次轮回 · 它记得你`;
  document.getElementById('btn-continue').style.display = SAVE.run ? '' : 'none';
  Art.titleArt(document.getElementById('title-art'), Math.min(0.7, L * 0.12));
}

function boot() {
  loadSave();
  refreshTitle();
  showScreen('screen-title');
  document.body.dataset.theme = 'f1';
  // 首次交互启动音频
  document.body.addEventListener('click', function once() {
    AudioSys.resume(); AudioSys.startMusic(); updateSanFX();
    document.body.removeEventListener('click', once);
  });

  const B = id => document.getElementById(id);
  B('btn-newrun').onclick = () => {
    AudioSys.sfx('click');
    if (SAVE.run && !confirm('已有一场进行中的冒险，要开始新的吗？（旧冒险将被撕掉）')) return;
    newRun();
  };
  B('btn-continue').onclick = () => {
    AudioSys.sfx('click');
    run = SAVE.run;
    document.body.dataset.theme = FLOORS[run.floor].theme;
    const room = GameMap.currentRoom(run.map);
    if (room && !room.cleared && room.visited) { room.visited = false; } // 重进未完成房间
    showMapScreen();
  };
  B('btn-meta').onclick = () => { AudioSys.sfx('click'); renderMetaTree(); showScreen('screen-meta'); };
  B('btn-endings').onclick = () => { AudioSys.sfx('click'); renderEndings(); showScreen('screen-endings'); };
  B('btn-settings').onclick = () => {
    AudioSys.sfx('click');
    B('set-music').value = SAVE.settings.music;
    B('set-sfx').value = SAVE.settings.sfx;
    showScreen('screen-settings');
  };
  B('btn-meta-back').onclick = () => { refreshTitle(); showScreen('screen-title'); };
  B('btn-endings-back').onclick = () => { refreshTitle(); showScreen('screen-title'); };
  B('btn-settings-back').onclick = () => { refreshTitle(); showScreen('screen-title'); };
  B('set-music').oninput = e => { SAVE.settings.music = +e.target.value; AudioSys.applyVolumes(); persistSave(); };
  B('set-sfx').oninput = e => { SAVE.settings.sfx = +e.target.value; AudioSys.applyVolumes(); persistSave(); };
  B('set-mute').onclick = toggleMute;
  B('btn-help').onclick = () => { AudioSys.sfx('click'); B('help-overlay').style.display = 'flex'; };
  B('btn-help-close').onclick = () => { AudioSys.sfx('click'); B('help-overlay').style.display = 'none'; };
  // 暂停菜单
  B('pause-mute').onclick = toggleMute;
  B('pause-music').oninput = e => { SAVE.settings.music = +e.target.value; AudioSys.applyVolumes(); persistSave(); };
  B('pause-sfx').oninput = e => { SAVE.settings.sfx = +e.target.value; AudioSys.applyVolumes(); persistSave(); };
  B('btn-pause-resume').onclick = () => { AudioSys.sfx('click'); closePause(); };
  B('btn-pause-help').onclick = () => { AudioSys.sfx('click'); B('help-overlay').style.display = 'flex'; };
  B('btn-pause-restart').onclick = () => {
    if (confirm('撕掉这一页，重新开局？（已获得的记忆碎片会保留）')) {
      AudioSys.sfx('click');
      SAVE.shards += run ? run.shards : 0;
      SAVE.run = null; CB = null; run = null;
      closePause();
      newRun();
    }
  };
  B('btn-pause-quit').onclick = () => {
    if (confirm('中途退出本次冒险？已获得的记忆碎片会带回标题。')) abandonRun(true);
  };
  syncMuteButtons();
  B('btn-reset-save').onclick = () => {
    if (confirm('确定要删除全部存档吗？糖糖的每一世记忆都会被抹掉。') &&
        confirm('再问一次。真的、真的、真的要删除吗？')) {
      wipeSave(); refreshTitle(); showScreen('screen-title');
      glitchFlash(1);
      say([{ who: '???', text: '……好痛。', glitch: 0.8 }]);
    }
  };
  B('btn-end-turn').onclick = () => endTurn();
  B('btn-view-deck').onclick = () => {
    const ov = B('deck-overlay');
    ov.style.display = 'flex';
    document.querySelector('#deck-overlay h3').textContent = `🃏 当前卡组（${run.deck.length} 张）`;
    const list = B('deck-view-list');
    list.innerHTML = '';
    run.deck.forEach(inst => list.appendChild(makeCardEl(inst)));
    B('btn-deck-close').onclick = () => { ov.style.display = 'none'; };
  };
  B('btn-ending-home').onclick = () => {
    AudioSys.sfx('click');
    refreshTitle();
    showScreen('screen-title');
    AudioSys.setDetune(0); AudioSys.setDark(false);
    updateSanFX();
  };
  // 键盘：空格/回车结束回合，Esc 开关暂停菜单
  document.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && document.getElementById('screen-combat').classList.contains('active')) {
      e.preventDefault();
      endTurn();
    }
    if (e.key === 'Escape') {
      const help = document.getElementById('help-overlay');
      if (help.style.display !== 'none') { help.style.display = 'none'; return; }
      const pause = document.getElementById('pause-overlay');
      if (pause.style.display !== 'none') closePause();
      else if (document.getElementById('screen-map').classList.contains('active') && run) openPause();
    }
  });
}

window.addEventListener('load', boot);
