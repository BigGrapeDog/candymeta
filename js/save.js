/* ═══════ save.js · localStorage 存档 ═══════ */
const SAVE_KEY = 'candybrave_save_v1';

let SAVE = null;

function defaultSave() {
  return {
    shards: 0,            // 记忆碎片（局外货币）
    unlocked: [],         // 记忆回廊已解锁节点 id
    loops: 0,             // 轮回次数（死亡或通关都算）
    runs: 0,              // 总开局数
    wins: 0,
    bestFloor: 0,
    endings: {},          // {normal:true, true:true, deleted:true}
    flags: {},            // 剧情标记
    corruptedBadge: false,// 「删除」结局留下的存档徽章
    settings: { music: 60, sfx: 70, muted: false },
    codex: { cards: {}, enemies: {}, events: {}, relics: {} }, // 图鉴收集
    stats: { totalKills: 0, endingTimes: {} }, // 战绩统计（结局最快用时，秒）
    run: null,            // 进行中的冒险（局中自动存档）
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    SAVE = raw ? Object.assign(defaultSave(), JSON.parse(raw)) : defaultSave();
    // 旧存档补全新字段
    SAVE.codex = Object.assign(defaultSave().codex, SAVE.codex || {});
    SAVE.stats = Object.assign(defaultSave().stats, SAVE.stats || {});
    SAVE.stats.endingTimes = SAVE.stats.endingTimes || {};
  } catch (e) {
    SAVE = defaultSave();
  }
  return SAVE;
}

function persistSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {}
}

function wipeSave() {
  localStorage.removeItem(SAVE_KEY);
  SAVE = defaultSave();
  persistSave();
}

/* 局外加成（根据已解锁节点汇总） */
function getBonuses() {
  const b = {
    startHp: 0, startSan: 0, energy: 0, startGold: 0,
    unlockCorrupt: false, extraDraw: 0, shopDiscount: 0,
    restBoost: 0, minionAtk: 0, poisonPlus: 0,
    frag1: false, frag2: false, frag3: false, rift: false,
  };
  for (const id of SAVE.unlocked) {
    const node = META_TREE.find(n => n.id === id);
    if (node && node.effect) Object.assign(b, node.effect);
  }
  return b;
}

function trueEndingReady() {
  const b = getBonuses();
  return b.frag1 && b.frag2 && b.frag3 && b.rift;
}
