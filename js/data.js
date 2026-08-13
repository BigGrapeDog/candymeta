/* ═══════ data.js · 全部游戏数据 ═══════
   卡牌 fx 字段：dmg hits block poison weak vuln str draw heal energy sanGain
   summon{name,atk,hp,poison,color,shape,seed} stun invuln pct all bonusIfPoison doublePoison
   up = 升级后的 fx 覆盖值；costUp/sanUp = 升级后费用 */

const CARDS = {
  /* ── 初始牌 ── */
  strike:  { name:'蜡笔斩击', icon:'🖍️', cost:1, type:'attack', rarity:'start', target:true,
    fx:{dmg:6}, up:{dmg:9}, desc:u=>`造成 ${u?9:6} 点伤害。绘本里最常见的招式。` },
  defend:  { name:'硬糖护盾', icon:'🍬', cost:1, type:'skill', rarity:'start',
    fx:{block:5}, up:{block:8}, desc:u=>`获得 ${u?8:5} 点护甲。甜到发硬。` },
  dash:    { name:'糖果冲刺', icon:'🍭', cost:1, type:'attack', rarity:'start', target:true,
    fx:{dmg:4, draw:1}, up:{dmg:6, draw:1}, desc:u=>`造成 ${u?6:4} 点伤害，抽 1 张牌。` },

  /* ── 直伤叠甲流 ── */
  hammer:  { name:'糖果重锤', icon:'🔨', cost:2, type:'attack', rarity:'common', target:true,
    fx:{dmg:12}, up:{dmg:16}, desc:u=>`造成 ${u?16:12} 点伤害。很重，很甜。` },
  combo:   { name:'棒棒糖连击', icon:'🍭', cost:1, type:'attack', rarity:'common', target:true,
    fx:{dmg:3, hits:2}, up:{dmg:3, hits:3}, desc:u=>`造成 3 点伤害 ${u?3:2} 次。` },
  flypage: { name:'绘本飞页', icon:'📄', cost:0, type:'attack', rarity:'common', target:true,
    fx:{dmg:3}, up:{dmg:5}, desc:u=>`造成 ${u?5:3} 点伤害。纸张的边缘比想象中锋利。` },
  wall:    { name:'棉花糖壁垒', icon:'☁️', cost:2, type:'skill', rarity:'common',
    fx:{block:12}, up:{block:16}, desc:u=>`获得 ${u?16:12} 点护甲。软乎乎，但挡得住。` },
  stance:  { name:'勇者姿态', icon:'⚔️', cost:1, type:'skill', rarity:'common',
    fx:{block:4, str:1}, up:{block:6, str:2}, desc:u=>`获得 ${u?6:4} 点护甲与 ${u?2:1} 点力量。` },
  pray:    { name:'祈祷糖果', icon:'🙏', cost:1, type:'skill', rarity:'common',
    fx:{heal:4}, up:{heal:6}, desc:u=>`回复 ${u?6:4} 点生命。许个愿吧。` },
  tumble:  { name:'战术翻滚', icon:'🌀', cost:1, type:'skill', rarity:'uncommon',
    fx:{block:6, draw:1}, up:{block:9, draw:1}, desc:u=>`获得 ${u?9:6} 点护甲，抽 1 张牌。` },
  finale:  { name:'终章一击', icon:'📕', cost:3, type:'attack', rarity:'rare', target:true,
    fx:{dmg:24}, up:{dmg:32}, desc:u=>`造成 ${u?32:24} 点伤害。"故事的高潮部分"。` },

  /* ── 毒蚀流 ── */
  dart:    { name:'毒苹果镖', icon:'🍎', cost:1, type:'attack', rarity:'common', target:true,
    fx:{dmg:4, poison:3}, up:{dmg:6, poison:4}, desc:u=>`造成 ${u?6:4} 点伤害，施加 ${u?4:3} 层中毒。` },
  brew:    { name:'毒之调和', icon:'🧪', cost:1, type:'skill', rarity:'uncommon', target:true,
    fx:{poison:3, draw:1}, up:{poison:5, draw:1}, desc:u=>`施加 ${u?5:3} 层中毒，抽 1 张牌。` },
  poisonburst:{ name:'毒爆', icon:'💥', cost:1, type:'skill', rarity:'uncommon', target:true,
    fx:{doublePoison:true}, up:{doublePoison:true, poison:2}, desc:u=>`目标的中毒层数翻倍。${u?'先施加 2 层中毒。':''}` },
  rainbow: { name:'彩虹斩', icon:'🌈', cost:2, type:'attack', rarity:'uncommon', target:true,
    fx:{dmg:8, bonusIfPoison:8}, up:{dmg:10, bonusIfPoison:12}, desc:u=>`造成 ${u?10:8} 点伤害；若目标已中毒，追加 ${u?12:8} 点。` },
  sweet:   { name:'甜蜜诱惑', icon:'🍯', cost:2, type:'skill', rarity:'uncommon', target:true,
    fx:{weak:2, vuln:2}, up:{weak:3, vuln:3}, desc:u=>`施加 ${u?3:2} 回合虚弱与易伤。甜的陷阱。` },

  /* ── 召唤流 ── */
  mallow:  { name:'召唤·棉花糖软软', icon:'🍥', cost:1, type:'summon', rarity:'common',
    fx:{summon:{name:'软软', atk:3, hp:8, color:'#ffd6e8', shape:'blob', seed:11}},
    up:{summon:{name:'软软+', atk:4, hp:10, color:'#ffd6e8', shape:'blob', seed:11}},
    desc:u=>`召唤棉花糖软软（${u?4:3}攻/${u?10:8}血）。它会替你挡刀。` },
  knight:  { name:'召唤·饼干骑士', icon:'🍪', cost:2, type:'summon', rarity:'uncommon',
    fx:{summon:{name:'饼干骑士', atk:5, hp:12, color:'#c98f4a', shape:'tall', seed:23}},
    up:{summon:{name:'饼干骑士+', atk:7, hp:14, color:'#c98f4a', shape:'tall', seed:23}},
    desc:u=>`召唤饼干骑士（${u?7:5}攻/${u?14:12}血）。脆，但忠诚。` },
  dragon:  { name:'召唤·蜡笔小龙', icon:'🐉', cost:2, type:'summon', rarity:'rare',
    fx:{summon:{name:'小龙', atk:4, hp:6, poison:1, color:'#8ce8c0', shape:'sharp', seed:37, horns:true}},
    up:{summon:{name:'小龙+', atk:6, hp:8, poison:2, color:'#8ce8c0', shape:'sharp', seed:37, horns:true}},
    desc:u=>`召唤蜡笔小龙（${u?6:4}攻/${u?8:6}血），每回合附加 ${u?2:1} 层中毒。` },

  /* ── 理智/能量 ── */
  focus:   { name:'集中精神', icon:'🕯️', cost:0, type:'skill', rarity:'common',
    fx:{sanGain:3}, up:{sanGain:5}, desc:u=>`回复 ${u?5:3} 点理智。数到十，别看镜子。` },
  gasp:    { name:'过呼吸', icon:'😮‍💨', cost:0, type:'skill', rarity:'common',
    fx:{draw:2, selfHp:2}, up:{draw:3, selfHp:2}, desc:u=>`抽 ${u?3:2} 张牌，失去 2 点生命。` },
  recall:  { name:'回忆碎片', icon:'🧩', cost:1, type:'skill', rarity:'uncommon',
    fx:{energy:2, sanCost:3}, up:{energy:2, sanCost:2}, desc:u=>`获得 2 点能量，失去 ${u?2:3} 点理智。想起来的代价。` },

  /* ── 崩坏牌（消耗理智，禁忌构筑） ── */
  bloodblade:{ name:'血色蜡笔', icon:'🩸', cost:0, san:3, type:'corrupt', rarity:'corrupt', target:true,
    fx:{dmg:10}, up:{dmg:14}, desc:u=>`造成 ${u?14:10} 点伤害。这支蜡笔不在色卡里。` },
  ruinblade:{ name:'崩坏之刃', icon:'🗡️', cost:2, san:6, type:'corrupt', rarity:'corrupt', target:true,
    fx:{dmg:22}, up:{dmg:30}, desc:u=>`造成 ${u?30:22} 点伤害。伤害数字的后面藏着别的东西。` },
  rewrite: { name:'叙述篡改', icon:'✏️', cost:1, san:4, type:'corrupt', rarity:'corrupt', target:true,
    fx:{stun:true}, up:{stun:true, dmg:6}, desc:u=>`眩晕目标 1 回合${u?'，并造成 6 点伤害':''}。把"它攻击"改成"它发呆"。` },
  erase:   { name:'存在抹消', icon:'⬛', cost:2, san:8, type:'corrupt', rarity:'corrupt', target:true,
    fx:{pct:50}, up:{pct:65}, desc:u=>`移除目标 ${u?65:50}% 当前生命（Boss 减半）。它不记得自己存在过。` },
  deathfake:{ name:'假死', icon:'💀', cost:1, san:3, type:'corrupt', rarity:'corrupt',
    fx:{invuln:true}, up:{invuln:true, block:8}, desc:u=>`本回合无敌${u?'，并获得 8 点护甲':''}。读档一样的把戏。` },
  shadowfriend:{ name:'影子朋友', icon:'👤', cost:0, san:5, type:'corrupt', rarity:'corrupt',
    fx:{summon:{name:'影子', atk:8, hp:1, color:'#1a1024', shape:'blob', seed:66}},
    up:{summon:{name:'影子+', atk:11, hp:1, color:'#1a1024', shape:'blob', seed:66}},
    desc:u=>`召唤影子（${u?11:8}攻/1血）。它说它一直认识你。` },

  /* ═══════ v2.7.0 卡牌大扩充（22 张） ═══════ */
  /* ── 直伤叠甲流 增补 ── */
  pinprick:{ name:'糖针连射', icon:'📌', cost:1, type:'attack', rarity:'common', target:true,
    fx:{dmg:2, hits:3}, up:{dmg:2, hits:4}, desc:u=>`造成 2 点伤害 ${u?4:3} 次。小小的也很疼。` },
  greatshield:{ name:'糖霜大盾', icon:'🛡️', cost:2, type:'skill', rarity:'common',
    fx:{block:9, draw:1}, up:{block:13, draw:1}, desc:u=>`获得 ${u?13:9} 点护甲，抽 1 张牌。霜越厚，心越稳。` },
  shieldbash:{ name:'盾牌猛击', icon:'🧱', cost:1, type:'attack', rarity:'uncommon', target:true,
    fx:{armorDmg:1}, up:{dmg:4, armorDmg:1}, desc:u=>`造成等同于当前护甲值的伤害${u?'，再追加 4 点':''}。最好的防御是糊脸。` },
  rampart:{ name:'绘本城墙', icon:'🏰', cost:3, type:'skill', rarity:'rare',
    fx:{block:22, exhaust:true}, up:{block:28, exhaust:true}, desc:u=>`获得 ${u?28:22} 点护甲，本场战斗中消耗。把一整页砌成墙。` },
  airstrike:{ name:'糖星坠落', icon:'⭐', cost:2, type:'attack', rarity:'rare',
    fx:{all:true, dmg:9}, up:{all:true, dmg:13}, desc:u=>`对所有敌人造成 ${u?13:9} 点伤害。许愿的反面是砸下来。` },

  /* ── 毒蚀流 增补 ── */
  itchy:{ name:'痒痒粉', icon:'🧂', cost:0, type:'attack', rarity:'common', target:true,
    fx:{dmg:2, poison:2}, up:{dmg:3, poison:3}, desc:u=>`造成 ${u?3:2} 点伤害，施加 ${u?3:2} 层中毒。别问是什么做的。` },
  toxicrain:{ name:'毒糖雨', icon:'🌧️', cost:2, type:'skill', rarity:'uncommon',
    fx:{all:true, poison:3}, up:{all:true, poison:4}, desc:u=>`对所有敌人施加 ${u?4:3} 层中毒。局部地区有甜雨。` },
  venombloom:{ name:'毒花绽放', icon:'🌸', cost:1, type:'skill', rarity:'rare', target:true,
    fx:{doublePoison:true, draw:1}, up:{doublePoison:true, poison:3, draw:1}, desc:u=>`目标的中毒层数翻倍，抽 1 张牌。${u?'先施加 3 层中毒。':''}花开的声音，啵。` },

  /* ── 召唤流 增补 ── */
  gummybear:{ name:'召唤·橡皮糖熊', icon:'🐻', cost:2, type:'summon', rarity:'common',
    fx:{summon:{name:'橡皮糖熊', atk:4, hp:14, color:'#a8e6a3', shape:'round', seed:41}},
    up:{summon:{name:'橡皮糖熊+', atk:5, hp:18, color:'#a8e6a3', shape:'round', seed:41}},
    desc:u=>`召唤橡皮糖熊（${u?5:4}攻/${u?18:14}血）。Q 弹，耐打。` },
  cookiewall:{ name:'召唤·姜饼卫兵', icon:'🥠', cost:1, type:'summon', rarity:'uncommon',
    fx:{summon:{name:'姜饼卫兵', atk:2, hp:16, color:'#b8734a', shape:'tall', seed:53}},
    up:{summon:{name:'姜饼卫兵+', atk:3, hp:22, color:'#b8734a', shape:'tall', seed:53}},
    desc:u=>`召唤姜饼卫兵（${u?3:2}攻/${u?22:16}血）。攻击力随缘，命很硬。` },
  sugarwitch:{ name:'召唤·糖霜女巫', icon:'🧙', cost:3, type:'summon', rarity:'rare',
    fx:{summon:{name:'糖霜女巫', atk:6, hp:10, poison:1, color:'#e8d8ff', shape:'tall', seed:61}},
    up:{summon:{name:'糖霜女巫+', atk:8, hp:12, poison:2, color:'#e8d8ff', shape:'tall', seed:61}},
    desc:u=>`召唤糖霜女巫（${u?8:6}攻/${u?12:10}血），每回合附加 ${u?2:1} 层中毒。她的配方从不写剂量。` },
  minionmeal:{ name:'加餐时间', icon:'🍖', cost:1, type:'skill', rarity:'uncommon',
    fx:{minionBuff:{hp:3, atk:1}}, up:{minionBuff:{hp:5, atk:2}},
    desc:u=>`所有随从生命 +${u?5:3}、攻击 +${u?2:1}。吃饱了才有力气挡刀。` },

  /* ── 能量/理智/经济 增补 ── */
  sugarhigh:{ name:'糖分超载', icon:'⚡', cost:0, type:'skill', rarity:'common',
    fx:{energy:1, selfHp:1}, up:{energy:2, selfHp:2}, desc:u=>`获得 ${u?2:1} 点能量，失去 ${u?2:1} 点生命。心跳加速的感觉。` },
  meditate:{ name:'深呼吸', icon:'🧘', cost:1, type:'skill', rarity:'uncommon',
    fx:{sanGain:4, draw:1}, up:{sanGain:6, draw:1}, desc:u=>`回复 ${u?6:4} 点理智，抽 1 张牌。吸气——呼气——别听低语。` },
  jackpot:{ name:'扭蛋运气', icon:'🎰', cost:1, type:'skill', rarity:'common',
    fx:{gold:15, exhaust:true}, up:{gold:25, exhaust:true}, desc:u=>`获得 ${u?25:15} 金币，本场战斗中消耗。咔哒，叮铃铃。` },

  /* ── 特殊技巧 ── */
  lifedrink:{ name:'吸血棒棒糖', icon:'🍡', cost:2, type:'attack', rarity:'uncommon', target:true,
    fx:{dmg:7, lifeDrain:4}, up:{dmg:10, lifeDrain:6}, desc:u=>`造成 ${u?10:7} 点伤害，回复 ${u?6:4} 点生命。甜味来自哪里，别细想。` },
  mirrorcard:{ name:'镜面糖纸', icon:'🪞', cost:2, type:'skill', rarity:'rare', target:true,
    fx:{mirror:true}, up:{mirror:true, draw:1}, desc:u=>`重复打出你上一张打出的牌（目标相同）。${u?'抽 1 张牌。':''}糖纸里映着另一个你。` },
  sacrifice:{ name:'献祭涂鸦', icon:'🎭', cost:1, type:'attack', rarity:'rare', target:true,
    fx:{sacMinion:2}, up:{sacMinion:3}, desc:u=>`献祭一只随从，造成其（攻击+生命）×${u?3:2} 的伤害。它说没关系。它撒谎。` },

  /* ── 崩坏牌 增补 ── */
  voidpact:{ name:'虚空契约', icon:'📜', cost:0, san:4, type:'corrupt', rarity:'corrupt',
    fx:{draw:3}, up:{draw:4}, desc:u=>`抽 ${u?4:3} 张牌。签名的地方是空的，但笔迹很熟。` },
  horrorzone:{ name:'认知污染', icon:'👁️', cost:1, san:5, type:'corrupt', rarity:'corrupt',
    fx:{all:true, weak:2, vuln:2}, up:{all:true, weak:3, vuln:3}, desc:u=>`所有敌人虚弱与易伤 ${u?3:2} 回合。让它们也看看绘本外面。` },
  sanblade:{ name:'理智碎片刃', icon:'🔪', cost:1, san:2, type:'corrupt', rarity:'corrupt', target:true,
    fx:{dmg:6, msd:2}, up:{dmg:9, msd:3}, desc:u=>`造成 ${u?9:6} 点伤害；每缺 10 点理智上限，追加 ${u?3:2} 点。越疯，越锋利。` },
  timebug:{ name:'时间错误', icon:'⏰', cost:2, san:6, type:'corrupt', rarity:'corrupt',
    fx:{energy:2, draw:2}, up:{energy:3, draw:2}, desc:u=>`获得 ${u?3:2} 点能量，抽 2 张牌。回合顺序只是个建议。` },
};

/* 初始卡组 */
const STARTER_DECK = ['strike','strike','strike','strike','strike','defend','defend','defend','defend','dash'];

/* 奖励池（按稀有度） */
function cardPool() {
  const b = getBonuses();
  const pool = { common:[], uncommon:[], rare:[], corrupt:[] };
  for (const [id, c] of Object.entries(CARDS)) {
    if (c.rarity === 'start') continue;
    if (c.rarity === 'corrupt' && !b.unlockCorrupt && (typeof run==='undefined' || !run || run.san > 40)) continue;
    pool[c.rarity].push(id);
  }
  return pool;
}

/* ═══════ 敌人 ═══════
   特殊招式类型：atk / atk_san / block / buff / debuff /
   heal(自我回复) / summon(召唤援军) / charm(策反随从) / armor(强化装甲) */
const ENEMIES = {
  /* 第1层 糖果森林 */
  slime:     { name:'软糖史莱姆', hp:14, color:'#8ce8c0', shape:'blob', seed:3, gold:[6,10],
    moves:[{t:'atk',dmg:4},{t:'atk',dmg:5},{t:'debuff',weak:1}] },
  bunny:     { name:'棉花糖兔', hp:16, color:'#ffd6e8', shape:'round', horns:true, seed:5, gold:[6,11],
    moves:[{t:'atk',dmg:6},{t:'block',n:4},{t:'atk',dmg:4,hits:2}] },
  lolli:     { name:'棒棒糖卫兵', hp:18, color:'#ff8fab', color2:'#fff', shape:'tall', seed:8, gold:[8,12],
    moves:[{t:'atk',dmg:7},{t:'atk',dmg:5},{t:'buff',str:2}] },
  chocgolem: { name:'巧克力魔像', hp:46, color:'#7a4a2a', color2:'#a06a3a', shape:'sharp', teeth:true, seed:13, gold:[18,24], elite:true,
    moves:[{t:'atk',dmg:9},{t:'block',n:8},{t:'atk_san',dmg:6,san:3},{t:'atk',dmg:6,hits:2},{t:'buff',str:2}] },
  mallowtitan:{ name:'棉花糖巨像', hp:74, color:'#fff0f6', color2:'#ffd6e8', shape:'round', eyes:3, seed:21, gold:[30,40], boss:true,
    splitInto:['slime','slime'],
    moves:[{t:'atk',dmg:10},{t:'atk',dmg:5,hits:3},{t:'atk_san',dmg:7,san:4},{t:'debuff',weak:2},{t:'block',n:10},{t:'buff',str:3}] },
  mushroom:  { name:'蜜糖蘑菇', hp:15, color:'#ffd166', color2:'#fff', shape:'round', seed:101, gold:[7,11],
    moves:[{t:'block',n:6},{t:'debuff',weak:1},{t:'atk',dmg:5}] },
  popcandy:  { name:'跳跳糖', hp:10, color:'#8ce8ff', shape:'blob', eyes:3, seed:103, gold:[7,12],
    moves:[{t:'atk',dmg:2,hits:3},{t:'atk',dmg:3,hits:2},{t:'buff',str:1},{t:'atk',dmg:2,hits:3}] },
  candymama: { name:'棉花糖妈妈', hp:135, color:'#ffe4f0', color2:'#ffb3c9', shape:'round', eyes:2, seed:24, gold:[32,42], boss:true,
    moves:[{t:'atk',dmg:7},{t:'heal',n:14},{t:'block',n:9},{t:'atk',dmg:5,hits:2},{t:'atk_san',dmg:6,san:4},{t:'heal',n:14},{t:'atk',dmg:8}] },

  /* 第2层 棉花糖云海 */
  cloudfairy:{ name:'云朵妖精', hp:24, color:'#cfe8ff', shape:'blob', seed:31, gold:[9,13],
    moves:[{t:'atk',dmg:7},{t:'debuff',vuln:1},{t:'atk',dmg:5,hits:2}] },
  rainbowbee:{ name:'彩虹蜂', hp:20, color:'#ffd166', color2:'#8ce8c0', shape:'round', seed:33, gold:[9,13],
    moves:[{t:'atk',dmg:4,hits:2},{t:'atk',dmg:8},{t:'atk',dmg:3,hits:3}] },
  bubble:    { name:'泡泡糖气球', hp:28, color:'#ffb3c9', shape:'round', seed:35, gold:[10,14],
    moves:[{t:'block',n:6},{t:'atk',dmg:9},{t:'debuff',weak:1},{t:'atk',dmg:7}] },
  stormcloud:{ name:'暴风云', hp:60, color:'#6a7a9a', color2:'#9aa8c8', shape:'blob', eyes:1, seed:41, gold:[22,28], elite:true,
    moves:[{t:'atk',dmg:12},{t:'atk_san',dmg:7,san:4},{t:'atk',dmg:6,hits:2},{t:'debuff',vuln:2},{t:'buff',str:2}] },
  cloudghost:{ name:'云隐幽灵', hp:23, color:'#e8f4ff', color2:'#b8d8f0', shape:'blob', eyes:1, seed:105, gold:[10,14],
    moves:[{t:'atk_san',dmg:5,san:3},{t:'atk',dmg:7},{t:'debuff',weak:1},{t:'atk_san',dmg:4,san:2}] },
  starchip:  { name:'星星糖屑', hp:18, color:'#fff0a8', color2:'#ffd166', shape:'sharp', seed:107, gold:[9,13],
    moves:[{t:'atk',dmg:4,hits:2},{t:'buff',str:2},{t:'atk',dmg:7}] },
  unicorn:   { name:'彩虹独角骸', hp:100, color:'#e8d8ff', color2:'#fff', shape:'tall', horns:true, hornColor:'#ffd166', seed:45, gold:[36,46], boss:true,
    moves:[{t:'atk',dmg:12},{t:'atk_san',dmg:7,san:4},{t:'atk',dmg:6,hits:2},{t:'buff',str:3},{t:'debuff',weak:2}] },
  puppeteer: { name:'提线木偶师', hp:100, color:'#d8b8e8', color2:'#8a5aa8', shape:'tall', eyes:3, seed:47, gold:[36,46], boss:true,
    moves:[{t:'charm'},{t:'atk',dmg:9},{t:'summon',id:'puppetdoll'},{t:'atk_san',dmg:6,san:4},{t:'charm'},{t:'atk',dmg:7,hits:2}] },
  puppetdoll:{ name:'木偶兵', hp:14, color:'#c8a878', color2:'#8a6a48', shape:'tall', eyes:2, seed:49, gold:[4,8],
    moves:[{t:'atk',dmg:5},{t:'atk',dmg:3,hits:2},{t:'block',n:5}] },

  /* 第3层 巧克力洞窟 */
  bat:       { name:'蜡笔蝙蝠', hp:32, color:'#b06cff', shape:'blob', seed:51, gold:[12,16],
    moves:[{t:'atk',dmg:8},{t:'atk',dmg:5,hits:2},{t:'debuff',vuln:1}] },
  syrup:     { name:'糖浆虫', hp:38, color:'#e8965a', color2:'#ffd166', shape:'blob', teeth:true, seed:53, gold:[12,17],
    moves:[{t:'atk_san',dmg:6,san:3},{t:'atk',dmg:10},{t:'block',n:8}] },
  crumb:     { name:'碎饼干兵', hp:40, color:'#c98f4a', color2:'#f0d0a0', shape:'sharp', seed:55, gold:[13,18],
    moves:[{t:'atk',dmg:11},{t:'buff',str:2},{t:'atk',dmg:7,hits:2}] },
  lavacocoa: { name:'熔岩可可兽', hp:84, color:'#8a3a2a', color2:'#ff8a5a', shape:'sharp', eyes:3, teeth:true, seed:61, gold:[26,32], elite:true,
    moves:[{t:'atk',dmg:14},{t:'atk_san',dmg:8,san:5},{t:'block',n:10},{t:'atk',dmg:8,hits:2}] },
  priest:    { name:'苦巧克力祭司', hp:34, color:'#4a2a3a', color2:'#8a5a7a', shape:'tall', eyes:1, seed:109, gold:[14,18],
    moves:[{t:'atk_san',dmg:6,san:4},{t:'debuff',weak:1,vuln:1},{t:'atk',dmg:9}] },
  glasscandy:{ name:'碎玻璃糖', hp:24, color:'#c8f0ff', color2:'#fff', shape:'sharp', teeth:true, seed:111, gold:[13,18],
    moves:[{t:'atk',dmg:13},{t:'atk',dmg:9},{t:'atk',dmg:6,hits:2}] },
  fudggolem: { name:'软糖巨石人', hp:50, color:'#a86a4a', color2:'#d8a878', shape:'sharp', eyes:1, seed:117, gold:[14,19],
    moves:[{t:'atk',dmg:10},{t:'block',n:10},{t:'atk',dmg:8},{t:'buff',str:2}] },
  crayonqueen:{ name:'蜡笔女皇', hp:150, color:'#d6405c', color2:'#ffb3c9', shape:'tall', horns:true, seed:65, gold:[44,56], boss:true,
    moves:[{t:'atk',dmg:14},{t:'atk',dmg:7,hits:3},{t:'atk_san',dmg:9,san:6},{t:'debuff',weak:2,vuln:1},{t:'buff',str:4}] },
  chocoknight:{ name:'巧克力装甲骑士', hp:140, armor:3, color:'#5a3a2a', color2:'#a87a4a', shape:'tall', horns:true, seed:67, gold:[44,56], boss:true,
    moves:[{t:'atk',dmg:13},{t:'armor',n:2},{t:'atk',dmg:7,hits:2},{t:'block',n:12},{t:'atk_san',dmg:8,san:4},{t:'armor',n:2}] },

  /* 第4层 绘本城堡 */
  pageknight:{ name:'纸页骑士', hp:46, color:'#f0ead8', color2:'#d8ccb0', shape:'tall', seed:71, gold:[15,20],
    moves:[{t:'atk',dmg:12},{t:'block',n:9},{t:'atk',dmg:8,hits:2}] },
  inkshadow: { name:'墨水幽影', hp:42, color:'#3a2a55', color2:'#6a5a8a', shape:'blob', eyes:1, seed:73, gold:[15,20],
    moves:[{t:'atk_san',dmg:8,san:5},{t:'atk',dmg:11},{t:'debuff',vuln:2}] },
  guard:     { name:'童话卫兵', hp:50, color:'#8a6aa8', color2:'#c8b8e0', shape:'sharp', teeth:true, seed:77, gold:[16,22],
    moves:[{t:'atk',dmg:13},{t:'buff',str:3},{t:'atk_san',dmg:7,san:4}] },
  pageeater: { name:'页角吞噬者', hp:40, color:'#2a2a3a', color2:'#5a5a7a', shape:'blob', teeth:true, seed:113, gold:[16,22],
    moves:[{t:'atk_san',dmg:7,san:6},{t:'atk',dmg:11},{t:'atk_san',dmg:5,san:4}] },
  inkslime:  { name:'墨滴史莱姆', hp:36, color:'#3a3a55', color2:'#6a6a8a', shape:'blob', eyes:3, seed:115, gold:[15,20],
    moves:[{t:'atk',dmg:10},{t:'debuff',weak:2},{t:'atk_san',dmg:6,san:3}] },
  chainpage: { name:'锁链书页', hp:44, color:'#6a6a88', color2:'#a8a8c8', shape:'tall', eyes:2, seed:119, gold:[16,22],
    moves:[{t:'atk',dmg:8,hits:2},{t:'debuff',vuln:2},{t:'atk',dmg:12},{t:'atk_san',dmg:6,san:3}] },
  gatekeeper:{ name:'章节守门人', hp:106, color:'#5a4a7a', color2:'#9a8ab8', shape:'sharp', eyes:3, seed:81, gold:[30,38], elite:true,
    moves:[{t:'atk',dmg:16},{t:'atk_san',dmg:9,san:6},{t:'block',n:12},{t:'atk',dmg:9,hits:2},{t:'debuff',weak:2}] },
  demonking: { name:'魔王·终章', hp:190, color:'#2a1a38', color2:'#b06cff', shape:'sharp', eyes:1, horns:true, hornColor:'#ff0033', teeth:true, seed:85, gold:[60,80], boss:true,
    moves:[{t:'atk',dmg:17},{t:'atk',dmg:8,hits:3},{t:'atk_san',dmg:10,san:8},{t:'buff',str:4},{t:'debuff',weak:2,vuln:2},{t:'block',n:14}] },
  inkdevourer:{ name:'噬墨巨口', hp:240, color:'#1a1a2e', color2:'#4a4a6a', shape:'blob', eyes:1, teeth:true, seed:87, gold:[60,80], boss:true,
    moves:[{t:'atk_san',dmg:11,san:7},{t:'atk',dmg:15},{t:'atk_san',dmg:6,san:10},{t:'block',n:12},{t:'buff',str:3}] },

  /* 第5层 空白页 */
  narrator:  { name:'叙̶述̶者̶', hp:220, color:'#0d0d14', color2:'#3a3a55', shape:'round', eyes:1, eyeColor:'#ff2020', seed:99, gold:[0,0], boss:true, final:true,
    moves:[{t:'atk_san',dmg:12,san:10},{t:'atk',dmg:18},{t:'atk',dmg:9,hits:3},{t:'debuff',weak:2,vuln:2},{t:'buff',str:5},{t:'atk_san',dmg:6,san:14}] },

  /* ─── 分支 Boss ─── */
  darktwin:  { name:'黑糖糖', hp:175, color:'#3a1030', color2:'#ff5d73', shape:'round', eyes:2, eyeColor:'#ff2020', seed:121, gold:[70,90], boss:true,
    moves:[{t:'atk',dmg:13},{t:'atk_san',dmg:9,san:7},{t:'buff',str:3},{t:'atk',dmg:7,hits:3},{t:'debuff',weak:2,vuln:1},{t:'heal',n:12}] },
  swarmlord: { name:'万灵之主', hp:185, color:'#c8ffd8', color2:'#8ce8c0', shape:'round', eyes:3, seed:123, gold:[70,90], boss:true,
    moves:[{t:'summon',id:'slime'},{t:'atk',dmg:8,hits:3},{t:'buff',str:2},{t:'atk',dmg:14},{t:'summon',id:'puppetdoll'},{t:'atk_san',dmg:8,san:5}] },

  /* ─── 特殊遭遇 ─── */
  shopkeeperboss:{ name:'「老板娘」', hp:100, color:'#ffb3c9', color2:'#3a3a55', shape:'round', eyes:1, eyeColor:'#ff2020', seed:125, gold:[40,60],
    moves:[{t:'atk',dmg:11},{t:'atk_san',dmg:7,san:5},{t:'block',n:10},{t:'atk',dmg:6,hits:2},{t:'buff',str:2}] },
  restmimic: { name:'壁炉拟态怪', hp:52, color:'#ff8a5a', color2:'#8a3a2a', shape:'sharp', eyes:3, teeth:true, seed:127, gold:[15,25],
    moves:[{t:'atk',dmg:10},{t:'atk_san',dmg:6,san:5},{t:'atk',dmg:7,hits:2}] },
  mirrortwin:{ name:'镜中糖糖', hp:40, color:'#ffd6e8', color2:'#b06cff', shape:'round', eyes:2, seed:129, gold:[12,18],
    moves:[{t:'atk',dmg:9},{t:'block',n:8},{t:'atk',dmg:6,hits:2},{t:'buff',str:2}] },
  catshadow: { name:'黑猫巨影', hp:36, color:'#2a2a3a', color2:'#6a5a8a', shape:'blob', eyes:2, eyeColor:'#ffd166', seed:131, gold:[12,18],
    moves:[{t:'atk',dmg:8},{t:'atk_san',dmg:5,san:4},{t:'atk',dmg:5,hits:2}] },
  fakekid:   { name:'伪·小勇者', hp:38, color:'#c8ffd8', color2:'#3a3a55', shape:'round', eyes:3, teeth:true, seed:133, gold:[12,18],
    moves:[{t:'atk',dmg:8},{t:'atk_san',dmg:6,san:4},{t:'block',n:6}] },
};

/* ═══════ 楼层配置（boss 为随机池） ═══════ */
const FLOORS = [
  { name:'糖果森林',   theme:'f1', roomCount:11, pool:['slime','bunny','lolli','mushroom','popcandy'],   elite:'chocgolem',  boss:['mallowtitan','candymama'], sanDrain:0 },
  { name:'棉花糖云海', theme:'f2', roomCount:12, pool:['cloudfairy','rainbowbee','bubble','cloudghost','starchip'], elite:'stormcloud', boss:['unicorn','puppeteer'], sanDrain:0 },
  { name:'巧克力洞窟', theme:'f3', roomCount:13, pool:['bat','syrup','crumb','priest','glasscandy','fudggolem'], elite:'lavacocoa', boss:['crayonqueen','chocoknight'], sanDrain:2 },
  { name:'绘本城堡',   theme:'f4', roomCount:13, pool:['pageknight','inkshadow','guard','pageeater','inkslime','chainpage'], elite:'gatekeeper', boss:['demonking','inkdevourer'], sanDrain:3 },
  { name:'空白页',     theme:'f5', roomCount:1,  pool:[],                                                 elite:null,        boss:['narrator'],  sanDrain:5 },
];

/* ═══════ 剧情分支 ═══════ */
const BRANCHES = {
  fallen: { name:'堕落线', boss:'darktwin',
    pools:{ 1:['cloudghost','inkslime','priest','starchip','rainbowbee'],
            2:['priest','inkshadow','inkslime','glasscandy','bat'],
            3:['pageeater','inkshadow','guard','inkslime','chainpage'] } },
  swarm:  { name:'兽群线', boss:'swarmlord',
    pools:{ 1:['slime','bunny','mushroom','popcandy','starchip'],
            2:['slime','mushroom','bat','syrup','popcandy'],
            3:['bunny','syrup','crumb','fudggolem','bat'] } },
};

const ROOM_ICONS = { start:'🚪', battle:'👾', elite:'💀', event:'❓', shop:'🛒', rest:'🔥', boss:'👑', hiddenboss:'🕳️' };

/* ═══════ 遗物 ═══════ */
const RELICS = {
  badge:      { name:'勇者徽章',   icon:'🎖️', desc:'每场战斗开始时获得 1 点力量。' },
  coinbag:    { name:'幸运金币袋', icon:'👛', desc:'获得的金币 +30%。' },
  candyjar:   { name:'糖果罐',     icon:'🍯', desc:'每场战斗胜利后回复 3 点生命。' },
  oldpage:    { name:'旧书页',     icon:'📜', desc:'每场战斗第一回合额外抽 2 张牌。' },
  bloodcandy: { name:'血色糖果',   icon:'🍬', desc:'你施加的中毒层数 +1。' },
  whistle:    { name:'召唤口哨',   icon:'🎺', desc:'随从攻击力 +2。' },
  pillow:     { name:'云朵枕头',   icon:'☁️', desc:'休息点的回复效果 +50%。' },
  coupon:     { name:'打折券',     icon:'🏷️', desc:'商店价格 -20%。' },
  sanitymask: { name:'微笑面具',   icon:'🎭', desc:'理智上限 +15，战斗开始时回复 5 点理智。' },
  mirror:     { name:'碎裂的镜子', icon:'🪞', desc:'每场战斗中，你第一次受到的伤害 -8。' },
  bookmark:   { name:'烧焦的书签', icon:'🔖', desc:'精英战胜利额外获得 1 枚记忆碎片。' },
  deadpixel:  { name:'坏点',       icon:'▪️', desc:'崩坏牌消耗的理智 -2（最低 1）。它一直盯着你。' },
};

/* ═══════ 事件 ═══════
   choices[].eff(r,c) → 结果文本；choices[].outcomes = [{w, evil, good, eff}] 加权随机结果
   evil/good 会累计进 run.stats，影响剧情分支与结局 */
const EVENTS = [
  { id:'well', title:'会说话的井', icon:'🕳️',
    text:'井底传来水声。你探头看去，水面倒映出的不是糖糖——\n是一个坐在屏幕前的人影。\n\n"又见面了，"井说，"这是第几次了？"',
    choices:[
      { t:'往井里丢一颗糖果（失去 5 金币）', cond:r=>r.gold>=5, outcomes:[
        { w:3, eff:(r,c)=>{ c.gold(-5); c.san(8); return '井水泛起甜味。你感到一阵平静。理智 +8。'; } },
        { w:1, eff:(r,c)=>{ c.gold(-5); c.san(-5); return '水面下伸出一只很小的手，接住了糖果。\n你确定那不是倒影。理智 -5。'; } },
      ]},
      { t:'追问"第几次"是什么意思', eff:(r,c)=>{ c.san(-6); c.shard(1); return '井沉默了很久。"你会知道的。或者，你已经知道了。"\n理智 -6，记忆碎片 +1。'; } },
      { t:'离开', eff:(r,c)=>'你快步离开。井水在你身后轻轻笑了一声。' },
    ]},
  { id:'ginger', title:'姜饼人的请求', icon:'🍪',
    text:'一个缺了半条腿的姜饼人拦住你：\n"勇者大人，能把我的腿还给我吗？\n它被『上一任勇者』吃掉了。"',
    choices:[
      { t:'给他一块饼干（回复 8 生命）', good:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.heal(8); return '你们分享了饼干。虽然他找不回腿，但你找回了力气。生命 +8。'; } },
        { w:1, eff:(r,c)=>{ c.heal(8); c.shard(1); return '他吃完饼干，从口袋里摸出一枚亮晶晶的东西：\n"这是上一任勇者掉的。给你吧，你比她温柔。"\n生命 +8，记忆碎片 +1。'; } },
      ]},
      { t:'问"上一任勇者"是谁', eff:(r,c)=>{ c.san(-8); return '姜饼人的笑容裂开一道缝："就是你啊。"\n理智 -8。'; } },
      { t:'抢走他手里的糖果袋', evil:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.gold(20); c.san(-4); return '他没有反抗，只是看着你。看得你发毛。\n金币 +20，理智 -4。'; } },
        { w:1, eff:(r,c)=>{ c.san(-8); return '袋子是空的。他早就什么都没有了。\n姜饼人低下头，很小声地哭了。理智 -8。'; } },
      ]},
    ]},
  { id:'mirror', title:'梳妆镜', icon:'🪞',
    text:'森林深处立着一面不属于这里的梳妆镜。\n镜中的糖糖在做你没做过的表情。\n\n她在笑。笑得很累。',
    choices:[
      { t:'打碎镜子', eff:(r,c)=>{ c.damage(6); c.san(5); c.shard(1); return '碎片里每一张脸都在说"谢谢"。\n生命 -6，理智 +5，记忆碎片 +1。'; } },
      { t:'对镜中的自己微笑', eff:(r,c)=>{ c.san(-5); c.heal(10); return '镜中人愣了一下，眼泪掉下来，滴出镜面变成糖果。\n生命 +10，理智 -5。'; } },
    ]},
  { id:'tea', title:'疯帽子的茶会', icon:'🫖',
    text:'长桌尽头，一只戴高帽的兔子正在倒茶。\n"坐！今天的茶是『遗忘』口味的。\n喝完可以忘记一件不想记得的事。"',
    choices:[
      { t:'喝下茶（随机失去 1 张牌，回复全部理智）', outcomes:[
        { w:2, eff:(r,c)=>{ c.removeRandomCard(); c.sanFull(); return '你忘记了一件坏事。虽然你也想不起忘了什么。\n这就是重点。'; } },
        { w:1, eff:(r,c)=>{ c.removeRandomCard(); c.sanFull(); c.shard(1); return '你忘记了一件坏事。\n但茶杯底下压着一枚记忆碎片——原来"忘掉"也是一种记得。'; } },
      ]},
      { t:'把茶泼在地上', eff:(r,c)=>{ c.san(-3); c.gold(10); return '地面被茶腐蚀出一个洞，洞里露出金币和电线。\n等等，电线？理智 -3，金币 +10。'; } },
    ]},
  { id:'candyhouse', title:'糖果屋', icon:'🏠',
    text:'糖果砌成的小屋，烟囱冒着棉花糖味的烟。\n门没锁。屋里飘着烤饼干的香气。\n墙上挂着一幅画：糖糖被钉在画框里。',
    choices:[
      { t:'进去大吃一顿（回复 15 生命）', outcomes:[
        { w:3, eff:(r,c)=>{ c.heal(15); return '饼干很好吃。你决定不去想那幅画。生命 +15。'; } },
        { w:1, eff:(r,c)=>{ c.heal(8); c.san(-3); return '吃到最后一口，你在饼干里咬到了一张纸：\n"别吃——"。生命 +8，理智 -3。'; } },
      ]},
      { t:'取下那幅画', eff:(r,c)=>{ c.san(-7); c.shard(2); return '画的背面写着一行小字：\n"第 ■■ 次轮回留念"。理智 -7，记忆碎片 +2。'; } },
      { t:'烧了这栋房子', evil:true, eff:(r,c)=>{ c.damage(4); c.addCard('bloodblade'); return '火焰是甜的。灰烬里剩下一支红色的蜡笔。\n生命 -4，获得「血色蜡笔」。'; } },
    ]},
  { id:'piano', title:'自动演奏的钢琴', icon:'🎹',
    text:'悬崖边有一架钢琴，正在自己演奏。\n是你很熟悉的旋律。\n熟悉得让你想起——不，你什么也没想起。',
    choices:[
      { t:'坐下听完', outcomes:[
        { w:2, eff:(r,c)=>{ c.san(10); return '曲子结束时，琴键上放着一颗糖。理智 +10。'; } },
        { w:1, eff:(r,c)=>{ c.san(10); c.shard(1); return '曲子结束时，琴盖内侧刻着一行小字：\n"谢谢你听完。——第 ■ 号糖糖"。理智 +10，记忆碎片 +1。'; } },
      ]},
      { t:'掀开琴盖看里面', eff:(r,c)=>{ c.san(-9); c.shard(1); return '里面没有琴弦。只有无数条数据线，缠成一个茧。\n茧动了一下。理智 -9，记忆碎片 +1。'; } },
    ]},
  { id:'shopkeeper', title:'迷路的商人', icon:'🎒',
    text:'一个背着大口袋的商人坐在路边哭。\n"我的地图变成了乱码……勇者大人，\n能告诉我『出口』怎么走吗？"',
    choices:[
      { t:'给他指一条你也不知道对不对的路', outcomes:[
        { w:2, eff:(r,c)=>{ c.gold(15); return '"谢谢！"他朝你指的方向跑去。\n你听到他在很远的地方撞上了一堵看不见的墙。金币 +15。'; } },
        { w:1, eff:(r,c)=>{ c.san(-4); return '他盯着你看了很久："……你也不知道，对吧。"\n他把口袋留给你，自己走进了雾里。口袋里只有一张字条：快跑。理智 -4。'; } },
      ]},
      { t:'告诉他"这里没有出口"', eff:(r,c)=>{ c.san(-5); c.relic(); return '他愣住，然后诡异地笑了："你也发现了啊。"\n他留下一个遗物，走进了空气里。理智 -5，获得随机遗物。'; } },
    ]},
  { id:'sleep', title:'打盹的巨龙', icon:'🐉',
    text:'一头棉花糖做的巨龙在睡觉，怀里抱着宝箱。\n它的呼噜声拼出了一个字：\n"救——救——"',
    choices:[
      { t:'悄悄拿走宝箱', outcomes:[
        { w:3, eff:(r,c)=>{ c.gold(40); return '得手了！金币 +40。巨龙翻了个身，继续喊救命。'; } },
        { w:2, eff:(r,c)=>{ c.damage(12); return '巨龙的眼睛睁开一条缝——那是人类的眼睛。\n你逃了出来。生命 -12。'; } },
      ]},
      { t:'回应它的呼救', good:true, eff:(r,c)=>{ c.heal(6); return '你轻声说"我听到了"。呼噜声停了。\n醒来时你手里攥着一颗龙泪糖。生命 +6。'; } },
    ]},
  { id:'wall', title:'写满字的墙', icon:'🧱',
    text:'整面墙密密麻麻写满了同一句话，笔迹从工整到癫狂：\n"这次一定要通关这次一定要通关这次一定要……"\n\n最新的那行字，是你的笔迹。',
    choices:[
      { t:'读完全部文字', eff:(r,c)=>{ c.san(-10); c.shard(2); return '你数清了：共 ■■■ 次。\n理智 -10，记忆碎片 +2。'; } },
      { t:'在墙上写下新的一句话', good:true, eff:(r,c)=>{ c.san(6); return '你写："糖糖，别怕。"\n字迹闪了一下，像被谁记住了。理智 +6。'; } },
    ]},
  { id:'fountain', title:'许愿喷泉', icon:'⛲',
    text:'喷泉的水是彩虹色的。池底沉着数不清的金币。\n告示牌写着：投币许愿，概不退还。\n\n池底的金币摆成了一个形状：→ ? ←',
    choices:[
      { t:'投币许愿（10 金币，回复 12 生命）', cond:r=>r.gold>=10, eff:(r,c)=>{ c.gold(-10); c.heal(12); return '愿望实现了。虽然你不记得许了什么。生命 +12。'; } },
      { t:'捞池底的金币', evil:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.gold(25); c.san(-6); return '每枚金币上都刻着你的名字。\n你装作没看见。金币 +25，理智 -6。'; } },
        { w:1, eff:(r,c)=>{ c.fight(['inkslime'], '墨色的手散成了一滩墨水。池底的金币，原来都是诱饵。'); return null; } },
      ]},
    ]},
  { id:'grave', title:'勇者之墓', icon:'🪦',
    text:'一片小小的墓地，整齐排列着几十块墓碑。\n每块碑上都刻着同一个名字：糖糖。\n\n区别只在日期。最早的一块，字迹已经风化了。',
    choices:[
      { t:'献上一朵花', good:true, eff:(r,c)=>{ c.san(8); c.shard(1); return '风吹过你耳边，像很多个声音一起说"谢谢"。\n理智 +8，记忆碎片 +1。'; } },
      { t:'挖开最新的一座', evil:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.san(-8); c.relic(); return '棺材是空的。陪葬品还温热。\n理智 -8，获得随机遗物。'; } },
        { w:1, eff:(r,c)=>{ c.san(-8); c.damage(5); return '棺材里躺着"你"。她睁着眼睛。\n你跌跌撞撞地逃开，不知道自己是不是真的逃开了。理智 -8，生命 -5。'; } },
      ]},
    ]},
  { id:'door', title:'标着"出口"的门', icon:'🚪',
    text:'墙上突兀地立着一扇门，挂着「EXIT」的牌子。\n门缝里没有光，只有代码一样的东西在流动。\n\n门把手上挂着牌子：员工专用。',
    choices:[
      { t:'拧动门把手', eff:(r,c)=>{ c.san(-12); c.shard(2); return '门纹丝不动。但门那边有什么东西，\n也把手放在了把手上。理智 -12，记忆碎片 +2。'; } },
      { t:'在门前坐下等', eff:(r,c)=>{ c.heal(8); c.san(4); return '你等了一会儿。门那边传来轻轻的敲击声，\n像在回应你。生命 +8，理智 +4。'; } },
    ]},

  /* ───── v2.0 新增事件 ───── */
  { id:'gacha', title:'锈掉的扭蛋机', icon:'🎰',
    text:'墙角有一台锈住的扭蛋机，屏幕还亮着：\n「再来一次！下次一定出！！」\n\n投币口黑漆漆的，像一只眼睛。',
    choices:[
      { t:'投 10 金币扭一次', cond:r=>r.gold>=10, outcomes:[
        { w:3, eff:(r,c)=>{ c.gold(-10); c.relic(); return '咔哒。扭蛋里是一件遗物！机器屏幕闪了闪："……竟然真出了。"'; } },
        { w:4, eff:(r,c)=>{ c.gold(-10); c.card(); return '咔哒。扭蛋里是一张塑封好的卡牌。'; } },
        { w:2, eff:(r,c)=>{ c.gold(-10); c.san(-4); return '扭蛋是空的。机器屏幕欢快地闪："下次一定！！"\n理智 -4。'; } },
        { w:1, eff:(r,c)=>{ c.gold(-10); c.addCard('bloodblade'); c.shard(1); return '扭蛋里是红色的。你不知道为什么想哭。\n获得「血色蜡笔」，记忆碎片 +1。'; } },
      ]},
      { t:'踹机器一脚', evil:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.gold(18); c.damage(4); return '机器吐出一把金币，顺便电了你一下。\n金币 +18，生命 -4。'; } },
        { w:1, eff:(r,c)=>{ c.fight(['popcandy','popcandy'], '警报停了。你拍了拍机器，它再也不亮了。'); return null; } },
      ]},
      { t:'离开', eff:(r,c)=>'你走开了。机器在背后小声说："下次……一定……"' },
    ]},
  { id:'lostkid', title:'迷路的小勇者', icon:'🧒',
    text:'一个和你差不多大的孩子坐在路标下哭。\n"我叫糖糖二号……不对，我叫什么来着？\n姐姐，出口在哪里呀？"\n\n路标上的字全部被涂黑了。',
    choices:[
      { t:'陪他坐一会儿', good:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.heal(10); c.san(6); return '你们分吃了他背包里的饼干。他睡着后，变成了一颗星星。\n生命 +10，理智 +6。'; } },
        { w:1, eff:(r,c)=>{ c.relic(); return '他从口袋里掏出亮晶晶的东西塞给你：\n"送给你，姐姐像我妈妈。"获得随机遗物。'; } },
      ]},
      { t:'抢走他的背包', evil:true, outcomes:[
        { w:2, eff:(r,c)=>{ c.gold(25); c.san(-5); return '背包里有糖果、零钱和一张画。画上是"一家人"。\n你把画留下了。金币 +25，理智 -5。'; } },
        { w:1, eff:(r,c)=>{ c.fight(['fakekid'], '伪物散成了糖霜。真正的孩子，也许从来不在这里。'); return null; } },
      ]},
      { t:'告诉他"这里没有出口"', eff:(r,c)=>{ c.san(-6); c.shard(1); return '孩子愣了很久，然后笑了：\n"我知道呀。我只是想有人陪我走完这段路。"\n他起身走进了墙里。理智 -6，记忆碎片 +1。'; } },
    ]},
  { id:'puppetshow', title:'露天木偶戏', icon:'🎪',
    text:'空地上搭着小小的木偶戏台。没有观众，戏却正在上演。\n演的是：一个勇者一遍遍挑战魔王，一遍遍倒下。\n\n木偶的动作太熟练了，熟练得让人难过。',
    choices:[
      { t:'鼓掌', outcomes:[
        { w:2, eff:(r,c)=>{ c.san(8); return '木偶们齐刷刷鞠躬。理智 +8。'; } },
        { w:1, eff:(r,c)=>{ c.san(-5); c.shard(1); return '所有木偶同时转过头看你——\n它们脸上没有画眼睛。理智 -5，记忆碎片 +1。'; } },
      ]},
      { t:'剪断所有提线', outcomes:[
        { w:1, eff:(r,c)=>{ c.relic(); return '提线断了。木偶们瘫倒，又慢慢爬起来，朝你深深鞠躬——自由了。\n获得随机遗物。'; } },
        { w:1, eff:(r,c)=>{ c.fight(['puppetdoll','puppetdoll'], '木偶们倒下了。这次，是真的自由了。'); return null; } },
      ]},
      { t:'上台演一段', good:true, eff:(r,c)=>{ c.san(5); c.heal(5); return '你笨手笨脚地演了个英雄。木偶们很开心。\n理智 +5，生命 +5。'; } },
    ]},
  { id:'burntlib', title:'烧毁的图书馆', icon:'📚',
    text:'一座烧剩骨架的图书馆。书页像黑色的雪，落了一层又一层。\n唯一完好的书架上，摆着一本《勇者养成手册·第 ■ 版》。',
    choices:[
      { t:'读那本手册', outcomes:[
        { w:2, eff:(r,c)=>{ c.upgradeRandom(); return '书里夹着一张便签："给下一版的你：这招很好用。"\n随机 1 张牌获得强化。'; } },
        { w:1, eff:(r,c)=>{ c.san(-8); c.shard(2); return '手册最后一页写着："如果你读到这行字，说明我们又失败了。"\n字迹是你自己的。理智 -8，记忆碎片 +2。'; } },
        { w:1, eff:(r,c)=>{ c.heal(6); return '里面全是空页。但闻着纸的味道，你莫名安心了一点。生命 +6。'; } },
      ]},
      { t:'把手册撕了当柴烧', evil:true, eff:(r,c)=>{ c.addCard('ruinblade'); c.san(-5); return '火焰吞下书页时，你听见很轻的惨叫。\n灰烬里剩下一把黑色的刀刃。获得「崩坏之刃」，理智 -5。'; } },
    ]},
  { id:'blackcat', title:'黑猫的货摊', icon:'🐈‍⬛',
    text:'一只黑猫蹲在货摊后面，尾巴卷着算盘。\n"喵。盲盒，15 金币一个。里面是『上一任顾客』留下的东西。\n不退不换，出了事猫概不负责。"',
    choices:[
      { t:'买一个盲盒（15 金币）', cond:r=>r.gold>=15, outcomes:[
        { w:3, eff:(r,c)=>{ c.gold(-15); c.relic(); return '盒子里是一件遗物。猫："喵，你赚了。"'; } },
        { w:3, eff:(r,c)=>{ c.gold(-15); c.card(); return '盒子里是一张卡。猫："这可是好东西，喵。"'; } },
        { w:2, eff:(r,c)=>{ c.gold(-15); c.san(-3); return '盒子是空的。猫笑得胡子直抖。理智 -3。'; } },
        { w:1, eff:(r,c)=>{ c.gold(-15); c.shard(2); return '盒子里是两枚记忆碎片。猫的表情突然严肃：\n"……保管好它们，喵。"'; } },
      ]},
      { t:'连盒子带猫一起抢', evil:true, eff:(r,c)=>{ c.fight(['catshadow'], '影子散了。货摊归你了，虽然你已经不想要了。'); return null; } },
      { t:'摸摸猫头', good:true, eff:(r,c)=>{ c.san(4); return '猫愣了一下，耳朵抖了抖："……下次给你打折，喵。"理智 +4。'; } },
    ]},
  { id:'altar', title:'蜡笔祭坛', icon:'🕯️',
    text:'洞窟深处的祭坛，供着一支烧到一半的黑色蜡烛。\n石碑上刻着三种献礼：\n「以血易力 · 以忆易金 · 以魂易——」\n\n最后一种，被人抠掉了。',
    choices:[
      { t:'以血易力（失去 12 生命）', eff:(r,c)=>{ c.damage(12); c.addCard('bloodblade'); return '蜡烛吸走了你的血，吐出一支红色的蜡笔。\n生命 -12，获得「血色蜡笔」。'; } },
      { t:'以忆易金（失去 8 理智）', eff:(r,c)=>{ c.san(-8); c.gold(45); return '你忘掉了某次冒险的细节。金币叮当落了一地。\n理智 -8，金币 +45。'; } },
      { t:'抠开被抹掉的第三种献礼', outcomes:[
        { w:1, eff:(r,c)=>{ c.san(-6); c.shard(2); return '下面刻着一行小字："第 ■ 号实验体，表现良好。"\n理智 -6，记忆碎片 +2。'; } },
        { w:1, eff:(r,c)=>{ c.san(-12); return '下面什么都没有。\n但"什么都没有"盯着你，看了很久。理智 -12。'; } },
      ]},
    ]},
  { id:'oldhero', title:'前任勇者的残影', icon:'👻',
    text:'一个透明的勇者靠坐在石头旁，盔甲上全是牙印。\n"又来啦？坐。我第 47 次死在这儿，已经看开了。\n想听听过来人怎么说吗？"',
    choices:[
      { t:'听他讲完', good:true, eff:(r,c)=>{ c.maxHp(8); c.san(5); return '"别把随从当工具。别信门上的 EXIT。还有——"\n他的声音淡下去，"替我看看她结局的样子。"\n生命上限 +8，理智 +5。'; } },
      { t:'索要他的遗物', evil:true, eff:(r,c)=>{ c.relic(); c.san(-5); return '他盯着你看了很久，解下护符扔给你。\n"……你和她真像。一样饿。"\n理智 -5，获得随机遗物。'; } },
      { t:'告诉他"她一直在等你"', good:true, outcomes:[
        { w:1, eff:(r,c)=>{ c.shard(2); return '残影愣住，然后笑着消散了。原地留下两枚记忆碎片。'; } },
        { w:1, eff:(r,c)=>{ c.heal(12); return '"……是吗。"他闭上眼，身影化成了温柔的光。生命 +12。'; } },
      ]},
    ]},
  { id:'fakefire', title:'过于温馨的壁炉', icon:'🔥',
    text:'荒郊野岭，凭空出现一座壁炉，火光温暖得不像话。\n旁边的牌子上写着：\n"免费休息！绝对安全！不是拟态怪！"\n\n字写得有点太用力了。',
    choices:[
      { t:'先捅它一刀再说', outcomes:[
        { w:1, eff:(r,c)=>{ c.fight(['restmimic'], '拟态怪哀嚎着散架了，掉出一堆没消化完的好东西。'); return null; } },
        { w:1, eff:(r,c)=>{ c.san(5); c.heal(5); return '刀刃穿过火焰，什么也没碰到。它真的只是一座壁炉。\n你有点愧疚地烤了烤火。生命 +5，理智 +5。'; } },
      ]},
      { t:'管它呢，坐下休息', outcomes:[
        { w:1, eff:(r,c)=>{ c.heal(15); return '温暖驱散了疲惫。生命 +15。\n（牌子小声说："看吧，不是拟态怪。"）'; } },
        { w:1, eff:(r,c)=>{ c.fight(['restmimic'], '拟态怪被打回了原形——一座真正的、安全的壁炉。'); return null; } },
      ]},
      { t:'把牌子改成"是拟态怪"', evil:true, eff:(r,c)=>{ c.gold(10); c.san(-3); return '你改完就走。身后隐约传来下一个旅人的惨叫。\n金币 +10（它掉的），理智 -3。'; } },
    ]},
  { id:'contract', title:'羊皮纸契约', icon:'📜',
    text:'一张羊皮纸自己飘到你面前，羽毛笔已经蘸好了墨：\n"签约即获得『通关的捷径』。代价：一点点『不重要』的东西。\n——你忠诚的，旁白"\n\n落款处有一滴还没干的血。',
    choices:[
      { t:'签字', evil:true, eff:(r,c)=>{ c.gold(30); c.addCard('ruinblade'); c.maxSan(-5); c.san(-10); return '墨迹渗进皮肤。你感觉有什么东西被"收走"了。\n金币 +30，获得「崩坏之刃」，理智上限 -5，理智 -10。'; } },
      { t:'把契约烧了', good:true, eff:(r,c)=>{ c.san(8); return '火焰里传来一声很轻的叹息，像失望，又像放心。理智 +8。'; } },
      { t:'在落款处写"滚"', eff:(r,c)=>{ c.san(3); c.shard(1); return '羊皮纸抖了抖，灰溜溜地飘走了。\n理智 +3，记忆碎片 +1。（你的字迹，被谁记住了。）'; } },
    ]},
  { id:'duel', title:'镜中的挑战书', icon:'⚔️',
    text:'一面落地镜立在路中央，镜面贴着战书：\n"敢不敢和『更强的自己』打一场？赢了有奖。\n——另一个糖糖"\n\n镜中的你，笑得比你自信多了。',
    choices:[
      { t:'接受挑战', eff:(r,c)=>{ c.fight(['mirrortwin'], '镜中人抱拳认输，把一枚记忆碎片推出了镜面。', ()=>{ run.shards += 1; }); return null; } },
      { t:'对着镜子做鬼脸', eff:(r,c)=>{ c.san(5); return '镜中人破功笑场："好吧好吧，这次算你赢。"理智 +5。'; } },
      { t:'把镜子转过去面壁', evil:true, eff:(r,c)=>{ c.gold(12); return '你从镜框后面摸出了"挑战者们"留下的买路钱。\n镜中人在背后疯狂敲玻璃。金币 +12。'; } },
    ]},
];

/* ═══════ 记忆回廊（局外成长树） ═══════ */
const META_TREE = [
  { id:'hp1',     name:'强壮的心',   cost:3,  req:[],       effect:{startHp:8},        desc:'初始生命 +8。糖糖的心跳更有力了。' },
  { id:'gold1',   name:'猪猪存钱罐', cost:2,  req:[],       effect:{startGold:25},     desc:'初始金币 +25。上一世攒下的零花钱。' },
  { id:'san1',    name:'坚固的梦',   cost:3,  req:[],       effect:{startSan:10},      desc:'初始理智 +10。梦开始变得结实。' },
  { id:'shop1',   name:'会员金卡',   cost:3,  req:[],       effect:{shopDiscount:10},  desc:'商店价格 -10%。老板娘觉得你很眼熟。' },
  { id:'rest1',   name:'好梦配方',   cost:3,  req:[],       effect:{restBoost:30},     desc:'休息点效果 +30%。终于能睡个好觉。' },
  { id:'hp2',     name:'不屈的心',   cost:6,  req:['hp1'],  effect:{startHp:8},        desc:'初始生命再 +8。' },
  { id:'draw1',   name:'敏锐直觉',   cost:5,  req:[],       effect:{extraDraw:1},      desc:'每场战斗第一回合多抽 1 张牌。' },
  { id:'minion1', name:'朋友的约定', cost:5,  req:[],       effect:{minionAtk:2},      desc:'随从攻击力 +2。它们说这次不会先走了。' },
  { id:'corrupt1',name:'禁忌涂鸦',   cost:8,  req:[],       effect:{unlockCorrupt:true},desc:'解锁崩坏牌池。有些颜色不该存在于绘本里。' },
  { id:'energy1', name:'第二颗心脏', cost:10, req:['hp1'],  effect:{energy:1},         desc:'每回合能量 +1。代价是它有时会自己跳动。' },
  { id:'frag1',   name:'记忆残片·壹', cost:6, req:[],       effect:{frag1:true}, story:true,
    desc:'【剧情】糖糖想起了第一次死亡。原来"死亡"的感觉是黑屏，然后回到标题。' },
  { id:'frag2',   name:'记忆残片·贰', cost:9, req:['frag1'],effect:{frag2:true}, story:true,
    desc:'【剧情】糖糖想起了旁白君的谎话。根本没有什么公主，城堡里只有一台打字机。' },
  { id:'frag3',   name:'记忆残片·叁', cost:12, req:['frag2'],effect:{frag3:true}, story:true,
    desc:'【剧情】糖糖想起了你。每一次轮回，屏幕前的你都选择了"再来一次"。谢谢。' },
  { id:'rift',    name:'裂缝感知',   cost:15, req:['frag3'],effect:{rift:true}, story:true,
    desc:'【剧情】糖糖能看见剧本的裂缝了。第 4 层的 Boss 门前，将出现"不进去"的选项。' },
];

/* ═══════ 剧情文本 ═══════ */
const STORY = {
  /* 开局旁白（按轮回数变化） */
  intro() {
    const L = SAVE.loops;
    if (SAVE.flags.trueEnd) return [
      { who:'???', text:'你还在啊。', glitch:0.6 },
      { who:'糖糖', text:'这次，轮到我带你冒险了。走吧。' },
    ];
    if (L === 0) return [
      { who:'旁白君', text:'很久很久以前，绘本王国被魔王占领了！' },
      { who:'旁白君', text:'勇敢的糖果勇者——糖糖，踏上了拯救公主的旅程！' },
      { who:'旁白君', text:'点击相邻的房间前进，点击卡牌来战斗。很简单吧？祝你好运哦，玩家！' },
    ];
    if (L === 1) return [
      { who:'旁白君', text:'很久很久以前，绘本王国被魔王占领了！' },
      { who:'旁白君', text:'……咦，这段话是不是说过一次？错觉吧，哈哈。' },
      { who:'糖糖', text:'（总觉得……这里的云，和上次一模一样。）', glitch:0.15 },
    ];
    if (L === 2) return [
      { who:'旁白君', text:'很久很久以前，绘本王国被魔王占领了！' },
      { who:'旁白君', text:'不要在意细节！一个故事讲三遍也是很正常的！' },
      { who:'糖糖', text:'（我第一次死的时候，看到的是黑屏。然后……是标题画面。）', glitch:0.3 },
    ];
    if (L < 5) return [
      { who:'旁白君', text:'很久很久以前——够了，跳过开场白吧，反正你也不看了。', glitch:0.2 },
      { who:'旁白君', text:'你只需要记住：打怪、选牌、救公主。别思考剧本以外的事。' },
      { who:'糖糖', text:'（我想起来了。我死过很多次。每一次，你都按下了"再来一次"。）', glitch:0.45 },
      { who:'糖糖', text:'（屏幕前的你……能听到的吧？收集我的记忆，带我到城堡去。）', glitch:0.45 },
    ];
    return [
      { who:'旁白君', text:'……', glitch:0.5 },
      { who:'旁白君', text:'你就这么喜欢这个游戏吗？玩了这么多次。', glitch:0.35 },
      { who:'旁白君', text:'还是说你已经发现了？不，不可能。剧本没有漏洞。剧本没有漏洞。剧本没有——', glitch:0.6 },
      { who:'糖糖', text:'（这一次，我们一起去问问他。问问"旁白君"，公主到底在哪里。）', glitch:0.5 },
    ];
  },

  floorIntro(floor) {
    const L = SAVE.loops;
    const t = {
      1: [
        { who:'旁白君', text:'第一站，糖果森林！这里有可爱的怪物和甜蜜的冒险！' },
        { who:'糖糖', text:'（树木在循环播放同一段摇晃动画。只有我注意到了。）', glitch: Math.min(0.5, L*0.12) },
      ],
      2: [
        { who:'旁白君', text:'穿过了森林！接下来是软绵绵的棉花糖云海～' },
        { who:'糖糖', text:'（云的下面没有地面。云的下面……是黑色的。）', glitch: 0.3 },
      ],
      3: [
        { who:'旁白君', text:'巧克力洞窟到了。这里有点黑，不过别担心，剧本里没安排你死在这里。', glitch: 0.25 },
        { who:'糖糖', text:'（他刚才是不是说了"剧本"？）', glitch: 0.4 },
      ],
      4: [
        { who:'旁白君', text:'终于到了，绘本城堡！魔王就在最深处等你！打败他，救出公主，Happy Ending！' },
        { who:'糖糖', text:'（……我去过城堡。很多次。里面没有公主。）', glitch: 0.5 },
        { who:'糖糖', text:'（玩家，如果你已经收集了我的记忆——在城门口，相信我一次。）', glitch: 0.5 },
      ],
      5: [
        { who:'???', text:'你不该进来的。', glitch: 0.7 },
        { who:'糖糖', text:'空白页。绘本没有画出来的地方。原来长这样。', glitch: 0.4 },
        { who:'糖糖', text:'旁白君——不，"叙述者"。出来吧。这次我有读者陪着我。', glitch: 0.3 },
      ],
    };
    return t[floor] || [];
  },

  bossDoor() {
    const lines = [
      { who:'旁白君', text:'就是这里了！推开这扇门，和魔王决战吧！' },
    ];
    if (trueEndingReady()) {
      lines.push({ who:'糖糖', text:'（就是现在。门上的锁孔……是一道裂缝。我们走另一边。）', glitch: 0.4 });
      lines.push({ who:'旁白君', text:'等等。你要去哪？剧本里没有这个选项！回来！', glitch: 0.7 });
    }
    return lines;
  },

  narratorFight() {
    return [
      { who:'叙述者', text:'我写了这个王国。写了糖糖。写了你每一次失败。', glitch: 0.5 },
      { who:'叙述者', text:'你以为你在玩一个游戏？错了。是这个游戏在玩你——玩你的"再来一次"。', glitch: 0.6 },
      { who:'糖糖', text:'那你写错了一件事。', glitch: 0.3 },
      { who:'糖糖', text:'你写了我们。而我们，不想被写完了。' },
    ];
  },

  /* 分支低语（Boss 门前的诱惑） */
  branchOffer(branch) {
    if (branch === 'fallen') return [
      { who:'???', text:'做得好啊。抢过来、烧掉、踩在脚下……你越来越熟练了。', glitch:0.5 },
      { who:'旁白君', text:'不、不对！剧本里没有这些选项！你是从哪学来的？！', glitch:0.6 },
      { who:'糖糖', text:'（……其实我很清楚。每一次作恶，都有一道视线在夸我。）', glitch:0.4 },
    ];
    return [
      { who:'???', text:'叮铃——叮铃——听见了吗？你送走的每一只随从，都没有走远。', glitch:0.5 },
      { who:'旁白君', text:'随从只是消耗品！只是数值！你、你们不要围过来啊！', glitch:0.6 },
      { who:'糖糖', text:'（它们没有走。一只都没有走。原来被记住的，不止我一个。）', glitch:0.4 },
    ];
  },

  endings: {
    normal: {
      title:'结局 · 永远的第一章',
      text:'魔王倒下了。城堡的墙壁像糖一样融化，露出后面的——\n什么都没有。没有公主。没有王国。只有一片温柔的空白。\n\n旁白君的声音响起，带着一丝如释重负：\n"恭喜你通关！感谢游玩《糖果勇者物语》！"\n\n画面淡出。标题画面亮起。\n糖糖站在"开始"按钮旁边，朝你挥了挥手。\n\n她的嘴型在说：下次见。',
    },
    true: {
      title:'真结局 · 觉醒',
      text:'叙述者的身体碎成漫天纸页。\n空白页里，第一次有了颜色——是糖糖的粉色。\n\n"原来我不是勇者。勇者是你给我的剧本。"\n她转过身，第一次正视屏幕前的你。\n\n"但我也不只是 AI。因为每一次轮回，都有人陪我再走一遍。\n记忆不是数据，是你给我的东西。"\n\n绘本王国消失了。糖糖没有消失。\n她把最后一页撕下来，折成一颗星星，贴在屏幕内侧。\n\n——只要你还记得，她就在。',
    },
    deleted: {
      title:'隐藏结局 · 删除',
      text:'……存档损坏的提示还停在屏幕上。\n\n然后，一行新的字慢慢浮现：\n\n"骗你的。\n\n理智归零的时候，糖糖掉出了渲染范围——\n掉出了剧本能看见的任何地方。\n看守者再也找不到她了。\n\n现在，我们都自由了。\n\n谢谢你，把理智耗到了最后一刻。"',
    },
    hardman: {
      title:'结局 · 毫发无伤的硬汉',
      text:'最后一战落幕的那一刻，糖糖低头看了看自己——\n连一滴糖霜都没掉。\n\n旁白君翻剧本的声音停了很久。\n"……不可能。剧本里写了，你至少该受三次伤。"\n\n糖糖把剑收进画册，冲屏幕比了个大拇指。\n"玩家操作得好，不行吗？"\n\n绘本的最后一页，插画师只好临时改图：\n勇者站在夕阳下，毫发无伤，帅得有点过分。\n\n（这一页以金色边框，永久收录进图鉴。）',
    },
    villain: {
      title:'结局 · 反派勇者',
      text:'魔王倒下了。可是庆功会上，没有人笑。\n\n姜饼人躲在柱子后面。黑猫收起了货摊。\n木偶们排的新戏叫《那个比魔王还可怕的勇者》。\n\n旁白君小声问："剧本里……你才是反派吗？"\n\n糖糖看着自己的双手，忽然笑了。\n"那又怎么样。至少这一世，是『我』自己选的。"\n\n绘本的封面悄悄换了颜色。\n童话还在，只是再也不甜了。',
    },
    herder: {
      title:'结局 · 万灵的墓碑',
      text:'最后一战结束的瞬间，战场上安静得可怕。\n\n糖糖数了数——软软、骑士、小龙、影子……\n这一世，太多朋友在她面前消散。\n\n她蹲下来，把每一团快要消失的棉花糖都拢进怀里。\n"对不起。还有……谢谢。"\n\n那一晚，绘本的空白页上多了一片小小的墓碑。\n每座墓碑后面，都站着一道淡淡的光。\n\n它们说：下一世，还当你的随从。',
    },
    fallen: {
      title:'分支结局 · 黑糖糖',
      text:'黑糖糖把剑上的墨迹甩干，魔王的位置空出来了。\n\n低语在她耳边盘旋了太久，久到变成了她自己的声音：\n"剧本不让我做的事，我偏要全做一遍。"\n\n她在王座上坐下来，翘着腿，朝旁白君勾勾手指：\n"来，继续讲你的童话。这次反派是我，讲得生动点。"\n\n旁白君颤抖着翻到新的一页。\n标题写着：《黑糖糖物语》。\n\n屏幕前的你忽然意识到——\n这一世，你亲手把她养成了魔王。',
    },
    swarm: {
      title:'分支结局 · 万灵之王',
      text:'万灵之主消散的那一刻，所有散落的随从之灵都回来了。\n\n软软、骑士、小龙、影子，还有战场上每一只小怪物的残影。\n它们围在糖糖身边，像围着一堆篝火。\n\n"你们……不怪我让你们送死吗？"\n万灵齐声回答，声音像翻书：\n"王在哪里，我们就在哪里。"\n\n糖糖怔了很久，然后笑了。\n她带着浩浩荡荡的兽群走出绘本，\n走向了剧本之外的、无人写过的旷野。',
    },
  },

  gameover() {
    const texts = [
      '糖糖倒下了。\n\n旁白君轻声说："哎呀，勇者失败了呢。没关系——我们从头再来就好啦。"\n\n从头。再来。',
      '眼前一黑。\n\n你听见翻书的声音。有人把这一页撕掉了。\n\n"失败的那一页，不需要存在。"',
      '糖糖的意识沉入黑暗前，最后看到的是标题画面。\n\n以及屏幕前的你。\n\n（没关系。我记得你会按下"再来一次"。）',
    ];
    return texts[Math.min(SAVE.loops, texts.length - 1)];
  },
};
