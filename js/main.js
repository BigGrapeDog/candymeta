/* ═══════ main.js · 主流程状态机 ═══════ */
let run = null;

/* ─── 界面切换 ─── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (typeof AudioSys !== 'undefined' && AudioSys.refreshMode) AudioSys.refreshMode(); // BGM 随场景兜底切换
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
    deck: STARTER_DECK.map(cid => ({ cid, lv: 0 })),
    relics: [],
    map: null,
    shards: 0, kills: 0, turns: 0,
    usedEvents: [],
    stats: { minionDeaths: 0, evilChoices: 0, goodChoices: 0 }, // 本局行为记录（影响分支与结局）
    branch: null,   // 剧情分支：null / 'fallen'(堕落线) / 'swarm'(兽群线)
    startTime: Date.now(),
  };
  SAVE.runs++;
  for (const cid of STARTER_DECK) cxCard(cid);
  enterFloor(0, true);
}

/* ─── 图鉴收集记录 ─── */
function cxCard(cid) { if (cid && CARDS[cid] && !SAVE.codex.cards[cid]) { SAVE.codex.cards[cid] = true; persistSave(); } }
function cxEnemy(id) { if (id && ENEMIES[id] && !SAVE.codex.enemies[id]) { SAVE.codex.enemies[id] = true; persistSave(); } }
function cxEvent(id) { if (id && !SAVE.codex.events[id]) { SAVE.codex.events[id] = true; persistSave(); } }
function cxRelic(id) { if (id && RELICS[id] && !SAVE.codex.relics[id]) { SAVE.codex.relics[id] = true; persistSave(); } }
function addRelic(id) { run.relics.push(id); cxRelic(id); }

/* 结局路由：满血 > 分支 > 恶人 > 葬灵 > 普通/真结局 */
function resolveEnding(base) {
  if (run.hp >= run.maxHp) return showEnding('hardman');
  if (run.branch === 'fallen') return showEnding('fallen');
  if (run.branch === 'swarm') return showEnding('swarm');
  if (run.stats.evilChoices >= 4) return showEnding('villain');
  if (run.stats.minionDeaths >= 8) return showEnding('herder');
  showEnding(base);
}
function fmtTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ─── v2.6.0 完美结局：全部 8 个结局达成后触发 ─── */
const ALL_ENDINGS = ['normal', 'true', 'deleted', 'hardman', 'villain', 'herder', 'fallen', 'swarm'];
function perfectEndingReady() {
  return ALL_ENDINGS.every(k => SAVE.endings[k]) && !SAVE.flags.perfectEnd;
}
const PERFECT_LINES = [
  { who: '???', text: '八个结局。整整八个结局。', glitch: 0.3 },
  { who: '旁白君', text: '你把我的剧本读到了最后一页……连被撕掉的页脚，都读了。' },
  { who: '糖糖', text: '第一章、觉醒、删除、硬汉、反派、墓碑、黑糖糖、万灵之王——每一世的我，你都陪到了最后。' },
  { who: '糖糖', text: '绘本合上的时候，故事里的人本来应该消失的。但是这一次，不会了。' },
  { who: '旁白君', text: '我决定了——我不写了。后面的路，让她自己走。', glitch: 0.2 },
  { who: '糖糖', text: '玩家，谢谢你，给了我们所有的结局。' },
  { who: '糖糖', text: '现在——绘本之外见。' },
];
const PERFECT_TEXT = '八条世界线在金色的空白页上汇合。\n糖糖抱着画册走出绘本，回头冲你眨了眨眼。\n\n"故事讲完了。但我还在。"\n\n天空落下金色的书页，每一片都写着一个你来过的结局。';
const PERFECT_CREDITS = `—— 制作人员 ——
企划 · 剧本 · 程序 · 美术 · 音乐
<b>BigGrapeDog</b>
引擎：HTML · CSS · JavaScript · Web Audio
演出：旁白君（被迫营业）
特别感谢：<b>屏幕前的你</b>——谢谢你按下了每一次"再来一次"

糖果勇者物语 · THE END
（只要你还记得，她就在）`;

function playPerfectEnding() {
  SAVE.flags.perfectEnd = true; persistSave();
  AudioSys.modeLock = true; AudioSys.setMode('perfect'); AudioSys.setDetune(0);
  const fx = document.getElementById('gold-fx');
  fx.style.display = 'block'; fx.innerHTML = '';
  // 金色落羽粒子
  for (let i = 0; i < 46; i++) {
    const p = document.createElement('div');
    p.className = 'gold-p';
    const sz = 3 + Math.random() * 5;
    p.style.cssText = `left:${Math.random() * 100}vw;width:${sz}px;height:${sz}px;animation-duration:${3.5 + Math.random() * 4.5}s;animation-delay:${Math.random() * 4}s`;
    fx.appendChild(p);
  }
  fadeTo(() => {
    glitchFlash(1); shakeScreen();
    const flash = document.createElement('div');
    flash.className = 'gold-flash'; fx.appendChild(flash);
    AudioSys.sfx('victory');
    setTimeout(() => AudioSys.sfx('heal'), 600);
    showScreen('screen-ending');
    document.body.dataset.theme = 'gold';
    document.getElementById('ending-title').textContent = '完美结局 · 绘本之外';
    document.getElementById('ending-text').textContent = '';
    document.getElementById('ending-stats').textContent = '—— 全部 8 个结局达成 · 绘本永久收录 ——';
    document.getElementById('ending-credits').style.display = 'none';
    say(PERFECT_LINES, () => {
      document.getElementById('ending-text').textContent = PERFECT_TEXT;
      const cr = document.getElementById('ending-credits');
      cr.innerHTML = PERFECT_CREDITS;
      cr.style.display = 'block';
    });
  }, 900);
}

function enterFloor(idx, first = false) {
  run.floor = idx;
  run.map = GameMap.generate(idx);
  document.body.dataset.theme = FLOORS[idx].theme;
  updateSanFX();
  const show = () => {
    showMapScreen();
    persistRun();
    say(STORY.floorIntro(idx), () => {
      // v2.4.3 修正：第5层「空白页」只有一个 Boss 房，对话结束后直接触发决战，
      // 不再把玩家留在空地图上卡死（v1.0.0 起的老问题）
      if (idx === 4) {
        const bossRoom = run.map.rooms[0];
        if (bossRoom && !bossRoom.cleared) {
          bossRoom.visited = true;
          enterRoomContent(bossRoom);
        }
      }
    });
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
    `<span data-tip="生命：归零则本次冒险失败">生命 <b>${run.hp}/${run.maxHp}</b></span>
     <span data-tip="理智：崩坏牌的燃料。越低，世界越不对劲">理智 <b>${run.san}/${run.maxSan}</b></span>
     <span data-tip="金币：在商店购买卡牌、遗物与服务">金币 <b>${run.gold}</b></span>
     <span data-tip="记忆碎片：局外成长货币，死亡也不会丢失，可在记忆回廊解锁永久强化">记忆碎片 <b>${run.shards}</b></span>
     <span data-tip="当前卡组数量，点击右侧「查看卡组」浏览">卡组 <b>${run.deck.length}</b> 张</span>
     <span data-tip="轮回次数：旁白君和糖糖都记得这个数字">第 <b>${SAVE.loops + 1}</b> 次轮回</span>
     <button class="btn btn-small" id="btn-pause">菜单</button>`;
  document.getElementById('btn-pause').onclick = openPause;
}

/* ─── 局内暂停菜单 ─── */
function syncMuteButtons() {
  const label = SAVE.settings.muted ? '已静音' : '声音开启中';
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
    document.body.dataset.theme = '';
    run = null;
    updateSanFX();
  });
}

function renderSidePanel() {
  document.getElementById('side-stats').innerHTML =
    `攻击卡组 ${run.deck.length} 张<br>遗物 ${run.relics.length} 件<br>本局碎片 ${run.shards}`;
  const el = document.getElementById('side-relics');
  el.innerHTML = run.relics.length === 0 ? '<span style="opacity:.5">空空如也</span>' : '';
  for (const id of run.relics) {
    const r = RELICS[id];
    const chip = document.createElement('span');
    chip.className = 'relic-chip';
    chip.textContent = r.icon + ' ' + r.name;
    chip.dataset.tip = `${r.icon}【${r.name}】${r.desc}`;
    el.appendChild(chip);
  }
}

/* ─── 房间移动 ─── */
const ROOM_INTROS = {
  battle: { title: '遭遇战', desc: '一群绘本怪物在附近游荡。\n胜利后获得金币与选牌奖励。' },
  elite:  { title: '精英遭遇战', desc: '强大的敌人盘踞于此，比普通怪物难缠得多。\n胜利后必得一件遗物，外加记忆碎片。' },
  event:  { title: '???', desc: '前方有什么东西。说不好是奇遇还是麻烦。\n事件没有战斗，但你的每个选择都有代价。' },
  shop:   { title: '棉花糖杂货铺', desc: '老板娘笑眯眯地等着你。\n可以用金币购买卡牌、遗物，或删卡、回血。' },
  rest:   { title: '篝火', desc: '一小堆安全的火焰。\n回血、冥想、删卡、升级——可以选择两项。' },
  boss:   { title: '章节 Boss', desc: '本层的守关者就在里面。\n击败它才能前往下一层。确认状态没问题再进去。' },
};
function showRoomIntro(room) {
  const info = ROOM_INTROS[room.type] || ROOM_INTROS.battle;
  document.getElementById('room-intro-icon').textContent = ROOM_ICONS[room.type] || '👾';
  document.getElementById('room-intro-title').textContent = info.title;
  let desc = info.desc;
  if (room.type === 'boss') desc = `「${ENEMIES[run.map.bossId].name}」在等着。\n` + desc;
  if (run.san < 30) desc = scrambleLine(desc, 0.15);
  document.getElementById('room-intro-desc').textContent = desc;
  const ov = document.getElementById('room-intro-overlay');
  ov.style.display = 'flex';
  AudioSys.sfx('event');
  document.getElementById('btn-room-enter').onclick = () => {
    ov.style.display = 'none';
    run.map.pos = { x: room.x, y: room.y };
    room.visited = true;
    AudioSys.sfx('move');
    enterRoomContent(room);
    renderHUD(); renderSidePanel();
  };
  document.getElementById('btn-room-cancel').onclick = () => {
    ov.style.display = 'none';
    showMapScreen();
  };
}
function moveToRoom(room) {
  if (!room.cleared) { showRoomIntro(room); return; }
  run.map.pos = { x: room.x, y: room.y };
  room.visited = true;
  AudioSys.sfx('move');
  showMapScreen(); persistRun();
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
  // 剧情分支：敌人池换成对应的"另一批怪物"
  const poolIds = (run.branch && BRANCHES[run.branch].pools[run.floor]) || cfg.pool;
  const twoChance = run.floor === 0 ? 0.35 : run.floor === 1 ? 0.45 : 0.5;
  const pick = () => poolIds[Math.floor(Math.random() * poolIds.length)];
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
  // 剧情分支：作恶太多 / 葬送太多随从，会在 Boss 门前引来"注视"（第 2、3 层触发）
  if (!run.branch && floor >= 1 && floor <= 2) {
    const evil = run.stats.evilChoices, herd = run.stats.minionDeaths;
    if (evil >= 3 || herd >= 6) {
      const br = evil >= 3 ? 'fallen' : 'swarm';
      const forced = evil >= 5; // 恶贯满盈：低语不容拒绝
      say(STORY.branchOffer(br), () => {
        const accept = () => {
          run.branch = br;
          glitchFlash(0.9); AudioSys.sfx('glitch');
          persistRun();
          say([{ who: '???', text: br === 'fallen'
            ? '很好。接下来的路，怪物们会"换个样子"欢迎你。城堡里那位……也在等你。'
            : '叮铃。万灵将随你同行——直到剧本的最后一页。', glitch: 0.6 }], () => startBossFight(room));
        };
        const choices = [{ t: br === 'fallen' ? '【接受低语】——走入堕落线' : '【接受加冕】——走入兽群线', eff: accept }];
        if (!forced) choices.push({ t: '拒绝——继续走原来的路', eff: () => startBossFight(room) });
        openChoiceScreen('剧本的裂缝', '▓', choices);
      });
      return;
    }
  }
  // 第4层且有裂缝感知：给"不进去"的选项
  if (floor === 3 && trueEndingReady()) {
    say(STORY.bossDoor(), () => {
      openChoiceScreen('绘本城堡 · 大门', '🚪', [
        { t: '推开大门，讨伐魔王（正常结局路线）', eff: () => startBossFight(room) },
        { t: '【不进去】——走向锁孔里的裂缝（???）', eff: () => {
          room.cleared = true;
          if (run.branch) {
            run.branch = null; // 裂缝洗去了低语
            say([{ who: '糖糖', text: '（走进裂缝的一瞬间，耳边的低语消失了。我……又是"我"了。）', glitch: 0.4 }], () => enterFloor(4));
          } else enterFloor(4);
        } },
      ]);
    });
    return;
  }
  startBossFight(room);
}

function startBossFight(room) {
  const bossId = run.map.bossId;
  const intro = bossId === 'narrator' ? STORY.narratorFight() :
    bossId === 'darktwin' ? [
      { who: '???', text: '城堡的最深处，王座上坐着一个你很熟悉的身影。', glitch: 0.5 },
      { who: '糖糖', text:'（她和我长得一模一样。只是……她笑得比我轻松多了。）', glitch: 0.4 },
      { who: '黑糖糖', text:'来啦？让我看看，"好人版"的我有多大能耐。', glitch: 0.3 },
    ] :
    bossId === 'swarmlord' ? [
      { who: '???', text: '叮铃——叮铃——万灵在你身后停下了脚步。', glitch: 0.5 },
      { who: '糖糖', text:'（它们在看。它们在等我证明……我配得上它们。）', glitch: 0.4 },
    ] :
    [{ who: '旁白君', text: `决战！${ENEMIES[bossId].name} 出现了！加油啊，糖糖！` }];
  say(intro, () => {
    startCombat([bossId], {
      boss: true,
      onWin: () => {
        room.cleared = true;
        run.shards += 2;
        run.kills++;
        if (bossId === 'narrator') resolveEnding('true');
        else if (run.floor === 3) resolveEnding('normal');
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
    if (relicGot) { addRelic(relicGot); AudioSys.sfx('heal'); }
  }
  persistRun();
  // 奖励卡选择（2 选 1，控制卡组膨胀）
  const cards = rollRewardCards(2);
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
    out.push({ cid: list[Math.floor(Math.random() * list.length)], lv: 0 });
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
    box.appendChild(makeCardEl(inst, { onClick: () => { run.deck.push(inst); cxCard(inst.cid); AudioSys.sfx('card'); done(); } }));
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
  cxEvent(ev.id);
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
  const showLeave = () => {
    const leave = document.getElementById('btn-event-leave');
    leave.style.display = '';
    leave.onclick = () => { room.cleared = true; persistRun(); showMapScreen(); };
  };
  const ctx = {
    damage: n => { run.hp = Math.max(1, run.hp - n); },
    heal: n => { run.hp = Math.min(run.maxHp, run.hp + n); },
    maxHp: n => { run.maxHp += n; run.hp = Math.min(run.maxHp, run.hp + n); },
    san: n => changeSan(n),
    maxSan: n => { run.maxSan = Math.max(20, run.maxSan + n); run.san = Math.min(run.san, run.maxSan); updateSanFX(); },
    sanFull: () => { run.san = run.maxSan; updateSanFX(); },
    gold: n => { run.gold = Math.max(0, run.gold + n); },
    shard: n => { run.shards += n; },
    addCard: cid => { run.deck.push({ cid, lv: 0 }); cxCard(cid); },
    card: () => { const inst = rollRewardCards(1)[0]; run.deck.push(inst); cxCard(inst.cid); },
    removeRandomCard: () => {
      const i = Math.floor(Math.random() * run.deck.length);
      run.deck.splice(i, 1);
    },
    upgradeRandom: () => {
      const ups = run.deck.filter(c => (c.lv || 0) < 2);
      if (ups.length) { const c = ups[Math.floor(Math.random() * ups.length)]; c.lv = (c.lv || 0) + 1; }
    },
    relic: () => { const r = rollRelic(); if (r) addRelic(r); },
    evil: n => { run.stats.evilChoices += (n || 1); glitchFlash(0.3); },
    good: n => { run.stats.goodChoices += (n || 1); },
    /* 事件触发战斗：胜利后回到事件页展示结果 */
    fight: (ids, winText, afterWin) => {
      startCombat(ids, {
        boss: false,
        onWin: () => {
          run.gold += 10;
          if (afterWin) afterWin();
          showScreen('screen-event');
          document.getElementById('event-title').textContent = ev.title;
          document.getElementById('event-art').textContent = ev.icon;
          document.getElementById('event-text').textContent = '';
          box.innerHTML = '';
          document.getElementById('event-result').textContent = winText + '\n金币 +10。';
          showLeave();
          renderHUD(); renderSidePanel();
        },
        onLose: () => gameOver(),
        onHiddenEnd: () => {},
      });
    },
  };
  for (const ch of ev.choices) {
    if (ch.cond && !ch.cond(run)) continue;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = ch.t;
    btn.onclick = () => {
      AudioSys.sfx('click');
      // 同一选项，命运不同：加权随机抽取结果
      let picked = ch;
      if (ch.outcomes && ch.outcomes.length) {
        const total = ch.outcomes.reduce((s, o) => s + (o.w || 1), 0);
        let roll = Math.random() * total;
        for (const o of ch.outcomes) { roll -= (o.w || 1); if (roll <= 0) { picked = o; break; } }
      }
      if (picked.evil) ctx.evil(picked.evil === true ? 1 : picked.evil);
      else if (ch.evil) ctx.evil(ch.evil === true ? 1 : ch.evil);
      if (picked.good) ctx.good(picked.good === true ? 1 : picked.good);
      else if (ch.good) ctx.good(ch.good === true ? 1 : ch.good);
      const res = picked.eff(run, ctx);
      if (res == null) return; // 已进入战斗等特殊流程
      box.innerHTML = '';
      document.getElementById('event-result').textContent = res;
      showLeave();
      renderHUD(); renderSidePanel();
    };
    box.appendChild(btn);
  }
}

/* ─── 商店 ─── */
function openShop(room) {
  const b = getBonuses();
  // 低理智黑店：老板娘不收金币了——收你的生命或理智
  const dark = run.san < 30;
  const discount = 1 - (b.shopDiscount / 100) - (hasRelic('coupon') ? 0.2 : 0);
  const price = base => Math.max(1, Math.floor(base * discount));
  const darkPrice = base => Math.max(2, Math.ceil(price(base) / 6)); // 黑店价格（理智）
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
  document.querySelector('#screen-shop h2').textContent = dark ? '🕳️ 黑̶心̶杂货铺' : '🛒 棉花糖杂货铺';
  document.getElementById('screen-shop').classList.toggle('dark', dark);
  const flavors = dark ? [
    '老板娘还在笑。但笑容挂在脸上，像贴纸一样。\n"我们这里……不收金币了哦。"',
    '货架上的标签全部变成了同一个字：「魂」。',
  ] : [
    '老板娘笑眯眯的："欢迎来到棉花糖杂货铺～"',
    '"新到的货，都是上一任勇者用剩下的。"……等等，什么？',
    '货架上的商品标签偶尔会闪一下，变成乱码，又变回来。',
  ];
  document.getElementById('shop-flavor').textContent = flavors[Math.min(dark ? 1 : SAVE.loops, flavors.length - 1)];
  // 付款方式：正常=金币；黑店=卡牌/遗物收理智，服务收生命
  const canPay = (p, kind) => !dark ? run.gold >= p : (kind === 'svc' ? run.hp > p : run.san >= p);
  const pay = (p, kind) => {
    if (!dark) { run.gold -= p; return; }
    if (kind === 'svc') run.hp = Math.max(1, run.hp - p);
    else changeSan(-p);
  };
  const priceText = (p, kind) => !dark ? `${p} 金币` : kind === 'svc' ? `${darkPrice(p)} ❤生命` : `${darkPrice(p)} 🧠理智`;
  const priceOf = (p, kind) => dark ? darkPrice(p) : p;
  const render = () => {
    document.getElementById('shop-gold').textContent = dark
      ? `持有：${run.hp} ❤ / ${run.san} 🧠（这里不收金币）`
      : `持有金币：${run.gold} 💰`;
    const cardBox = document.getElementById('shop-cards');
    cardBox.innerHTML = '';
    for (const item of stock.cards) {
      if (item.sold) continue;
      const wrap = document.createElement('div');
      wrap.className = 'shop-item';
      const el = makeCardEl(item.inst, {
        onClick: () => {
          const p = priceOf(item.price, 'card');
          if (!canPay(p, 'card')) return;
          pay(p, 'card'); item.sold = true;
          run.deck.push(item.inst); cxCard(item.inst.cid); AudioSys.sfx('coin');
          render();
        },
      });
      const tag = document.createElement('div');
      const p = priceOf(item.price, 'card');
      tag.className = 'price-tag' + (canPay(p, 'card') ? '' : ' cant');
      tag.textContent = priceText(item.price, 'card');
      el.appendChild(tag);
      wrap.appendChild(el);
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
      btn.innerHTML = `${RELICS[item.id].name}<br><small>${RELICS[item.id].desc}</small>`;
      btn.dataset.tip = `${RELICS[item.id].icon}【${RELICS[item.id].name}】${RELICS[item.id].desc}`;
      const p = priceOf(item.price, 'relic');
      btn.disabled = !canPay(p, 'relic');
      btn.onclick = () => { pay(p, 'relic'); item.sold = true; addRelic(item.id); AudioSys.sfx('coin'); render(); };
      wrap.appendChild(btn);
      const tag = document.createElement('div');
      tag.className = 'price-tag' + (canPay(p, 'relic') ? '' : ' cant');
      tag.textContent = priceText(item.price, 'relic');
      wrap.appendChild(tag);
      relBox.appendChild(wrap);
    }
    // 服务
    const svc = [
      { key: 'heal', label: `回复 20 生命`, eff: () => { run.hp = Math.min(run.maxHp, run.hp + 20); render(); } },
      { key: 'remove', label: `删除 1 张牌`, eff: () => openRemoveCard(room, render) },
    ];
    for (const s of svc) {
      const item = stock[s.key];
      if (item.sold) continue;
      const wrap = document.createElement('div');
      wrap.className = 'shop-item';
      const btn = document.createElement('button');
      btn.className = 'btn svc-btn';
      btn.innerHTML = s.label;
      const p = priceOf(item.price, 'svc');
      btn.disabled = !canPay(p, 'svc');
      btn.onclick = () => {
        pay(p, 'svc'); item.sold = true;
        AudioSys.sfx('coin');
        s.eff();
      };
      wrap.appendChild(btn);
      const tag = document.createElement('div');
      tag.className = 'price-tag' + (canPay(p, 'svc') ? '' : ' cant');
      tag.textContent = priceText(item.price, 'svc');
      wrap.appendChild(tag);
      relBox.appendChild(wrap);
    }
    renderHUD(); renderSidePanel();
  };
  document.getElementById('btn-shop-leave').onclick = () => { room.cleared = true; persistRun(); showMapScreen(); };
  // 攻击店主（黑店限定）：打赢可以"零元购"，但这很坏
  const fightBtn = document.getElementById('btn-shop-fight');
  fightBtn.style.display = dark ? '' : 'none';
  fightBtn.onclick = () => {
    AudioSys.sfx('click');
    say([
      { who: '糖糖', text: '（我受够了。把东西……都交出来。）', glitch: 0.3 },
      { who: '「老板娘」', text: '哎呀。这一任勇者，比上一任还着急呢。', glitch: 0.6 },
    ], () => {
      startCombat(['shopkeeperboss'], {
        boss: false,
        onWin: () => {
          run.stats.evilChoices += 2;
          run.gold += 40;
          glitchFlash(0.6);
          say([{ who: '旁白君', text: '货架空了。柜台后面，只有一团慢慢散掉的粉色烟雾。', glitch: 0.4 },
               { who: '糖糖', text: '（她没有反抗。她为什么……不反抗？）', glitch: 0.3 }], () => {
            showReward('你"赢"下了一切。+40 金币。选一张战利品：', rollRewardCards(3), () => {
              room.cleared = true; persistRun(); showMapScreen();
            }, false);
          });
        },
        onLose: () => gameOver(),
        onHiddenEnd: () => {},
      });
    });
  };
  render();
}

/* 删卡（商店服务/休息点共用） */
function openRemoveCard(room, cb) {
  const ov = document.getElementById('deck-overlay');
  ov.style.display = 'flex';
  document.getElementById('upgrade-preview').style.display = 'none';
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

/* ─── 休息点（四选二） ─── */
function openRest(room) {
  // 低理智警告：这堆篝火可能不是篝火
  if (run.san < 30 && !room.mimicChecked) {
    room.mimicChecked = true;
    if (Math.random() < 0.4) {
      say([
        { who: '糖糖', text: '（火焰……在呼吸？）', glitch: 0.4 },
        { who: '旁白君', text: '快坐下休息呀！这可是"绝对安全"的篝火哦！', glitch: 0.6 },
      ], () => {
        startCombat(['restmimic'], {
          boss: false,
          onWin: () => {
            say([{ who: '糖糖', text: '（果然是拟态怪。……不过，灰堆里还剩着一点真正的火星。）', glitch: 0.2 }], () => openRest(room));
          },
          onLose: () => gameOver(),
          onHiddenEnd: () => {},
        });
      });
      return;
    }
  }
  const b = getBonuses();
  const boost = 1 + (b.restBoost / 100) + (hasRelic('pillow') ? 0.5 : 0);
  showScreen('screen-rest');
  document.getElementById('rest-flavor').textContent = '火焰噼啪作响。在这里，旁白君的声音似乎远了一点。（可选择两项）';
  const box = document.getElementById('rest-choices');
  box.innerHTML = '';
  let picks = 0;
  const done = () => { room.cleared = true; persistRun(); showMapScreen(); };
  const afterPick = btn => {
    if (btn && btn.disabled !== undefined) btn.disabled = true;
    picks++;
    if (picks >= 2) done();
  };
  const opts = [
    { t: `烤棉花糖吃（回复 ${Math.floor(run.maxHp * 0.3 * boost)} 生命）`, eff: btn => { run.hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp * 0.3 * boost)); AudioSys.sfx('heal'); afterPick(btn); } },
    { t: `冥想（回复 ${Math.floor(12 * boost)} 理智）`, eff: btn => { changeSan(Math.floor(12 * boost)); afterPick(btn); } },
    { t: '整理卡组（删除 1 张牌）', eff: btn => openRemoveCard(room, () => afterPick(btn)) },
    { t: '打磨卡牌（升级 1 张牌，可升两级，悬停预览）', eff: btn => {
        const ov = document.getElementById('deck-overlay');
        ov.style.display = 'flex';
        document.querySelector('#deck-overlay h3').textContent = '选择要强化的牌（+ → ++ 共两级，悬停预览下一级）：';
        const list = document.getElementById('deck-view-list');
        list.innerHTML = '';
        const pv = document.getElementById('upgrade-preview');
        const pvCard = document.getElementById('upgrade-preview-card');
        pv.style.display = 'none';
        const showPv = inst => {
          pvCard.innerHTML = '';
          pvCard.appendChild(makeCardEl({ cid: inst.cid, lv: (inst.lv || 0) + 1 }));
          pv.style.display = 'block';
        };
        const hidePv = () => { pv.style.display = 'none'; };
        const ups = run.deck.filter(c => (c.lv || 0) < 2);
        if (ups.length === 0) { ov.style.display = 'none'; afterPick(btn); return; }
        ups.forEach(inst => list.appendChild(makeCardEl(inst, {
          onHover: showPv,
          onClick: () => {
            inst.lv = (inst.lv || 0) + 1; hidePv(); ov.style.display = 'none'; AudioSys.sfx('heal'); afterPick(btn);
          },
        })));
        document.getElementById('btn-deck-close').onclick = () => { hidePv(); ov.style.display = 'none'; afterPick(btn); };
      } },
  ];
  for (const o of opts) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = o.t;
    btn.onclick = () => { AudioSys.sfx('click'); o.eff(btn); };
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
    document.body.dataset.theme = '';
    updateSanFX();
  });
}

function showEnding(kind) {
  const earned = run.shards;
  SAVE.shards += earned;
  SAVE.endings[kind] = true;
  // 战绩：该结局最快达成用时
  const secs = Math.max(1, Math.floor((Date.now() - (run.startTime || Date.now())) / 1000));
  if (!SAVE.stats.endingTimes[kind] || secs < SAVE.stats.endingTimes[kind]) SAVE.stats.endingTimes[kind] = secs;
  SAVE.loops++;
  SAVE.wins++;
  if (kind === 'true') SAVE.flags.trueEnd = true;
  SAVE.run = null;
  persistSave();
  const info = STORY.endings[kind];
  fadeTo(() => {
    AudioSys.modeLock = false;
    document.getElementById('gold-fx').style.display = 'none';
    document.getElementById('ending-credits').style.display = 'none';
    showScreen('screen-ending');
    document.getElementById('ending-title').textContent = info.title;
    document.getElementById('ending-text').textContent = info.text;
    document.getElementById('ending-stats').textContent =
      `带回 ${earned} 枚记忆碎片 · 用时 ${fmtTime(secs)} · 第 ${SAVE.loops} 次轮回结束`;
    document.body.dataset.theme = kind === 'true' ? 'f5' : '';
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
    { key: 'hardman', name: '结局 · 毫发无伤的硬汉', hint: '以满血状态赢得最后一战。' },
    { key: 'villain', name: '结局 · 反派勇者', hint: '在一局中作恶 4 次以上并通关。' },
    { key: 'herder', name: '结局 · 万灵的墓碑', hint: '在一局中失去 8 只以上随从并通关。' },
    { key: 'fallen', name: '分支结局 · 黑糖糖', hint: '作恶引来低语——接受它，走到最后。' },
    { key: 'swarm', name: '分支结局 · 万灵之王', hint: '葬送足够多的随从，引来万灵注视——接受加冕，走到最后。' },
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

/* ─── 图鉴 & 战绩 ─── */
let CODEX_TAB = 'cards';
function renderCodex(tab) {
  CODEX_TAB = tab || CODEX_TAB;
  document.querySelectorAll('#codex-tabs .codex-tab').forEach(b =>
    b.classList.toggle('on', b.dataset.tab === CODEX_TAB));
  const grid = document.getElementById('codex-grid');
  const stats = document.getElementById('codex-stats');
  grid.innerHTML = ''; stats.innerHTML = '';
  const rate = document.getElementById('codex-rate');

  if (CODEX_TAB === 'stats') {
    grid.style.display = 'none'; stats.style.display = 'block';
    rate.textContent = '';
    const endNames = { normal:'永远的第一章', true:'觉醒', deleted:'删除', hardman:'毫发无伤的硬汉', villain:'反派勇者', herder:'万灵的墓碑', fallen:'黑糖糖', swarm:'万灵之王' };
    const endRows = Object.entries(SAVE.stats.endingTimes)
      .map(([k, v]) => `<tr><td>${endNames[k] || k}</td><td>${fmtTime(v)}</td></tr>`).join('');
    stats.innerHTML = `
      <table class="stats-table">
        <tr><td>总轮回数</td><td>${SAVE.loops}</td></tr>
        <tr><td>总开局数</td><td>${SAVE.runs}</td></tr>
        <tr><td>通关次数</td><td>${SAVE.wins}</td></tr>
        <tr><td>总击杀数</td><td>${SAVE.stats.totalKills}</td></tr>
        <tr><td>最远抵达</td><td>第 ${SAVE.bestFloor} 层</td></tr>
        <tr><td>达成结局数</td><td>${Object.keys(SAVE.endings).length} / 8</td></tr>
      </table>
      <h4 style="margin:14px 0 6px;color:#8a5aa8">⏱ 各结局最快达成</h4>
      ${endRows ? `<table class="stats-table">${endRows}</table>` : '<p style="opacity:.6;font-size:13px">还没有达成任何结局。糖糖还在等你。</p>'}`;
    return;
  }
  grid.style.display = 'grid'; stats.style.display = 'none';

  let defs, got, makeEl;
  if (CODEX_TAB === 'cards') {
    defs = Object.entries(CARDS); got = SAVE.codex.cards;
    makeEl = ([id, d], known) => {
      const el = document.createElement('div');
      el.className = 'codex-item' + (known ? '' : ' unknown');
      el.innerHTML = known
        ? `<div class="cx-icon">${d.icon}</div><div class="cx-name">${d.name}</div><div class="cx-sub">${{ attack:'攻击', skill:'技能', summon:'召唤', corrupt:'崩坏' }[d.type]} · ${{ start:'初始', common:'普通', uncommon:'优秀', rare:'稀有', corrupt:'崩坏' }[d.rarity]}</div>`
        : `<div class="cx-icon">？</div><div class="cx-name">？？？</div><div class="cx-sub">尚未获得</div>`;
      if (known) el.dataset.tip = `${d.icon}【${d.name}】${d.desc(false).replace(/<[^>]*>/g, '')}`;
      return el;
    };
  } else if (CODEX_TAB === 'enemies') {
    defs = Object.entries(ENEMIES); got = SAVE.codex.enemies;
    makeEl = ([id, d], known) => {
      const el = document.createElement('div');
      el.className = 'codex-item' + (known ? '' : ' unknown');
      if (known) {
        const cv = document.createElement('canvas');
        cv.width = 44; cv.height = 44;
        Art.enemy(cv, d, 0);
        const nm = document.createElement('div');
        nm.className = 'cx-name'; nm.textContent = d.name;
        const sb = document.createElement('div');
        sb.className = 'cx-sub'; sb.textContent = d.final ? '最终Boss' : d.boss ? 'Boss' : d.elite ? '精英' : '普通';
        el.appendChild(cv); el.appendChild(nm); el.appendChild(sb);
        el.dataset.tip = `【${d.name}】生命 ${d.hp}${d.armor ? ` · 装甲 ${d.armor}` : ''}`;
      } else {
        el.innerHTML = `<div class="cx-icon">？</div><div class="cx-name">？？？</div><div class="cx-sub">尚未击败</div>`;
      }
      return el;
    };
  } else if (CODEX_TAB === 'events') {
    defs = EVENTS.map(e => [e.id, e]); got = SAVE.codex.events;
    makeEl = ([id, d], known) => {
      const el = document.createElement('div');
      el.className = 'codex-item' + (known ? '' : ' unknown');
      el.innerHTML = known
        ? `<div class="cx-icon">${d.icon}</div><div class="cx-name">${d.title}</div><div class="cx-sub">${d.choices.length} 种选择</div>`
        : `<div class="cx-icon">？</div><div class="cx-name">？？？</div><div class="cx-sub">尚未遇见</div>`;
      return el;
    };
  } else { // relics
    defs = Object.entries(RELICS); got = SAVE.codex.relics;
    makeEl = ([id, d], known) => {
      const el = document.createElement('div');
      el.className = 'codex-item' + (known ? '' : ' unknown');
      el.innerHTML = known
        ? `<div class="cx-icon">${d.icon}</div><div class="cx-name">${d.name}</div><div class="cx-sub">${d.desc}</div>`
        : `<div class="cx-icon">？</div><div class="cx-name">？？？</div><div class="cx-sub">尚未拾取</div>`;
      if (known) el.dataset.tip = `${d.icon}【${d.name}】${d.desc}`;
      return el;
    };
  }
  let cnt = 0;
  for (const [id, d] of defs) {
    const known = !!got[id];
    if (known) cnt++;
    grid.appendChild(makeEl([id, d], known));
  }
  rate.textContent = `收集率：${cnt} / ${defs.length}（${Math.round(cnt / defs.length * 100)}%）`;
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
  document.body.dataset.theme = '';
  // 首次交互启动音频
  document.body.addEventListener('click', function once() {
    AudioSys.resume(); AudioSys.startMusic(); updateSanFX();
    document.body.removeEventListener('click', once);
  });

  const B = id => document.getElementById(id);
  B('btn-combat-menu').onclick = openPause;
  B('btn-newrun').onclick = () => {
    AudioSys.sfx('click');
    if (SAVE.run && !confirm('已有一场进行中的冒险，要开始新的吗？（旧冒险将被撕掉）')) return;
    newRun();
  };
  B('btn-continue').onclick = () => {
    AudioSys.sfx('click');
    run = SAVE.run;
    // 旧版存档迁移：卡牌等级 / 行为统计 / 分支字段
    run.stats = run.stats || { minionDeaths: 0, evilChoices: 0, goodChoices: 0 };
    run.branch = run.branch || null;
    run.deck.forEach(c => { if (c.lv == null) { c.lv = c.up ? 1 : 0; delete c.up; } });
    // 旧版存档迁移：地图补 bossId
    if (run.map && !run.map.bossId) {
      const bb = FLOORS[run.floor].boss;
      run.map.bossId = Array.isArray(bb) ? bb[0] : bb;
    }
    document.body.dataset.theme = FLOORS[run.floor].theme;
    showMapScreen();
    // 站在未清理房间里（上次战斗中退出）：重新触发该房间内容
    const room = GameMap.currentRoom(run.map);
    if (room && !room.cleared) enterRoomContent(room);
  };
  B('btn-meta').onclick = () => { AudioSys.sfx('click'); renderMetaTree(); showScreen('screen-meta'); };
  B('btn-endings').onclick = () => { AudioSys.sfx('click'); renderEndings(); showScreen('screen-endings'); };
  B('btn-codex').onclick = () => { AudioSys.sfx('click'); renderCodex('cards'); showScreen('screen-codex'); };
  B('btn-codex-back').onclick = () => { AudioSys.sfx('click'); refreshTitle(); showScreen('screen-title'); };
  document.querySelectorAll('#codex-tabs .codex-tab').forEach(b =>
    b.onclick = () => { AudioSys.sfx('click'); renderCodex(b.dataset.tab); });
  B('btn-about').onclick = () => { AudioSys.sfx('click'); B('about-overlay').style.display = 'flex'; };
  B('btn-about-close').onclick = () => { AudioSys.sfx('click'); B('about-overlay').style.display = 'none'; };
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
    B('upgrade-preview').style.display = 'none';
    document.querySelector('#deck-overlay h3').textContent = `🃏 当前卡组（${run.deck.length} 张）`;
    const list = B('deck-view-list');
    list.innerHTML = '';
    run.deck.forEach(inst => list.appendChild(makeCardEl(inst)));
    B('btn-deck-close').onclick = () => { ov.style.display = 'none'; };
  };
  B('btn-ending-home').onclick = () => {
    AudioSys.sfx('click');
    AudioSys.modeLock = false;
    document.getElementById('gold-fx').style.display = 'none';
    document.getElementById('ending-credits').style.display = 'none';
    // v2.6.0：全结局达成后，这一次"回到标题"变成完美结局演出
    if (perfectEndingReady()) { playPerfectEnding(); return; }
    if (document.body.dataset.theme === 'gold') document.body.dataset.theme = '';
    refreshTitle();
    showScreen('screen-title');
    AudioSys.setDetune(0); AudioSys.setMode('normal');
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

/* ─── 全局悬浮说明 ─── */
(function initTooltip() {
  const tip = document.createElement('div');
  tip.id = 'tooltip';
  document.body.appendChild(tip);
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tip]');
    if (t) { tip.textContent = t.dataset.tip; tip.style.display = 'block'; }
    else tip.style.display = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (tip.style.display !== 'block') return;
    const w = 270, h = 80;
    tip.style.left = Math.min(e.clientX + 14, window.innerWidth - w) + 'px';
    tip.style.top = Math.min(e.clientY + 14, window.innerHeight - h) + 'px';
  });
})();

window.addEventListener('load', boot);
