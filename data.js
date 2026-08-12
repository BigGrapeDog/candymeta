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

/* ═══════ 敌人 ═══════ */
const ENEMIES = {
  /* 第1层 糖果森林 */
  slime:     { name:'软糖史莱姆', hp:14, color:'#8ce8c0', shape:'blob', seed:3, gold:[6,10],
    moves:[{t:'atk',dmg:4},{t:'atk',dmg:5},{t:'debuff',weak:1}] },
  bunny:     { name:'棉花糖兔', hp:16, color:'#ffd6e8', shape:'round', horns:true, seed:5, gold:[6,11],
    moves:[{t:'atk',dmg:6},{t:'block',n:4},{t:'atk',dmg:4,hits:2}] },
  lolli:     { name:'棒棒糖卫兵', hp:18, color:'#ff8fab', color2:'#fff', shape:'tall', seed:8, gold:[8,12],
    moves:[{t:'atk',dmg:7},{t:'atk',dmg:5},{t:'buff',str:2}] },
  chocgolem: { name:'巧克力魔像', hp:38, color:'#7a4a2a', color2:'#a06a3a', shape:'sharp', teeth:true, seed:13, gold:[18,24], elite:true,
    moves:[{t:'atk',dmg:9},{t:'block',n:8},{t:'atk',dmg:6,hits:2},{t:'buff',str:2}] },
  mallowtitan:{ name:'棉花糖巨像', hp:64, color:'#fff0f6', color2:'#ffd6e8', shape:'round', eyes:3, seed:21, gold:[30,40], boss:true,
    moves:[{t:'atk',dmg:10},{t:'atk',dmg:5,hits:3},{t:'debuff',weak:2},{t:'block',n:10},{t:'buff',str:3}] },

  /* 第2层 棉花糖云海 */
  cloudfairy:{ name:'云朵妖精', hp:20, color:'#cfe8ff', shape:'blob', seed:31, gold:[9,13],
    moves:[{t:'atk',dmg:7},{t:'debuff',vuln:1},{t:'atk',dmg:5,hits:2}] },
  rainbowbee:{ name:'彩虹蜂', hp:17, color:'#ffd166', color2:'#8ce8c0', shape:'round', seed:33, gold:[9,13],
    moves:[{t:'atk',dmg:4,hits:2},{t:'atk',dmg:8},{t:'atk',dmg:3,hits:3}] },
  bubble:    { name:'泡泡糖气球', hp:24, color:'#ffb3c9', shape:'round', seed:35, gold:[10,14],
    moves:[{t:'block',n:6},{t:'atk',dmg:9},{t:'debuff',weak:1},{t:'atk',dmg:7}] },
  stormcloud:{ name:'暴风云', hp:46, color:'#6a7a9a', color2:'#9aa8c8', shape:'blob', eyes:1, seed:41, gold:[22,28], elite:true,
    moves:[{t:'atk',dmg:11},{t:'atk',dmg:6,hits:2},{t:'debuff',vuln:2},{t:'buff',str:2}] },
  unicorn:   { name:'彩虹独角骸', hp:80, color:'#e8d8ff', color2:'#fff', shape:'tall', horns:true, hornColor:'#ffd166', seed:45, gold:[36,46], boss:true,
    moves:[{t:'atk',dmg:12},{t:'atk_san',dmg:7,san:4},{t:'atk',dmg:6,hits:2},{t:'buff',str:3},{t:'debuff',weak:2}] },

  /* 第3层 巧克力洞窟 */
  bat:       { name:'蜡笔蝙蝠', hp:24, color:'#b06cff', shape:'blob', seed:51, gold:[12,16],
    moves:[{t:'atk',dmg:8},{t:'atk',dmg:5,hits:2},{t:'debuff',vuln:1}] },
  syrup:     { name:'糖浆虫', hp:28, color:'#e8965a', color2:'#ffd166', shape:'blob', teeth:true, seed:53, gold:[12,17],
    moves:[{t:'atk_san',dmg:6,san:3},{t:'atk',dmg:10},{t:'block',n:8}] },
  crumb:     { name:'碎饼干兵', hp:30, color:'#c98f4a', color2:'#f0d0a0', shape:'sharp', seed:55, gold:[13,18],
    moves:[{t:'atk',dmg:11},{t:'buff',str:2},{t:'atk',dmg:7,hits:2}] },
  lavacocoa: { name:'熔岩可可兽', hp:58, color:'#8a3a2a', color2:'#ff8a5a', shape:'sharp', eyes:3, teeth:true, seed:61, gold:[26,32], elite:true,
    moves:[{t:'atk',dmg:13},{t:'atk_san',dmg:8,san:5},{t:'block',n:10},{t:'atk',dmg:8,hits:2}] },
  crayonqueen:{ name:'蜡笔女皇', hp:96, color:'#d6405c', color2:'#ffb3c9', shape:'tall', horns:true, seed:65, gold:[44,56], boss:true,
    moves:[{t:'atk',dmg:14},{t:'atk',dmg:7,hits:3},{t:'atk_san',dmg:9,san:6},{t:'debuff',weak:2,vuln:1},{t:'buff',str:4}] },

  /* 第4层 绘本城堡 */
  pageknight:{ name:'纸页骑士', hp:32, color:'#f0ead8', color2:'#d8ccb0', shape:'tall', seed:71, gold:[15,20],
    moves:[{t:'atk',dmg:12},{t:'block',n:9},{t:'atk',dmg:8,hits:2}] },
  inkshadow: { name:'墨水幽影', hp:30, color:'#3a2a55', color2:'#6a5a8a', shape:'blob', eyes:1, seed:73, gold:[15,20],
    moves:[{t:'atk_san',dmg:8,san:5},{t:'atk',dmg:11},{t:'debuff',vuln:2}] },
  guard:     { name:'童话卫兵', hp:36, color:'#8a6aa8', color2:'#c8b8e0', shape:'sharp', teeth:true, seed:77, gold:[16,22],
    moves:[{t:'atk',dmg:13},{t:'buff',str:3},{t:'atk_san',dmg:7,san:4}] },
  gatekeeper:{ name:'章节守门人', hp:72, color:'#5a4a7a', color2:'#9a8ab8', shape:'sharp', eyes:3, seed:81, gold:[30,38], elite:true,
    moves:[{t:'atk',dmg:15},{t:'atk_san',dmg:9,san:6},{t:'block',n:12},{t:'atk',dmg:9,hits:2},{t:'debuff',weak:2}] },
  demonking: { name:'魔王·终章', hp:120, color:'#2a1a38', color2:'#b06cff', shape:'sharp', eyes:1, horns:true, hornColor:'#ff0033', teeth:true, seed:85, gold:[60,80], boss:true,
    moves:[{t:'atk',dmg:16},{t:'atk',dmg:8,hits:3},{t:'atk_san',dmg:10,san:8},{t:'buff',str:4},{t:'debuff',weak:2,vuln:2},{t:'block',n:14}] },

  /* 第5层 空白页 */
  narrator:  { name:'叙̶述̶者̶', hp:150, color:'#0d0d14', color2:'#3a3a55', shape:'round', eyes:1, eyeColor:'#ff2020', seed:99, gold:[0,0], boss:true, final:true,
    moves:[{t:'atk_san',dmg:12,san:10},{t:'atk',dmg:18},{t:'atk',dmg:9,hits:3},{t:'debuff',weak:2,vuln:2},{t:'buff',str:5},{t:'atk_san',dmg:6,san:14}] },
};

/* ═══════ 楼层配置 ═══════ */
const FLOORS = [
  { name:'糖果森林',   theme:'f1', roomCount:11, pool:['slime','bunny','lolli'],            elite:'chocgolem',  boss:'mallowtitan' },
  { name:'棉花糖云海', theme:'f2', roomCount:12, pool:['cloudfairy','rainbowbee','bubble'], elite:'stormcloud', boss:'unicorn' },
  { name:'巧克力洞窟', theme:'f3', roomCount:13, pool:['bat','syrup','crumb'],              elite:'lavacocoa',  boss:'crayonqueen' },
  { name:'绘本城堡',   theme:'f4', roomCount:13, pool:['pageknight','inkshadow','guard'],   elite:'gatekeeper', boss:'demonking' },
  { name:'空白页',     theme:'f5', roomCount:1,  pool:[],                                    elite:null,        boss:'narrator' },
];

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

/* ═══════ 事件 ═══════ */
const EVENTS = [
  { id:'well', title:'会说话的井', icon:'🕳️',
    text:'井底传来水声。你探头看去，水面倒映出的不是糖糖——\n是一个坐在屏幕前的人影。\n\n"又见面了，"井说，"这是第几次了？"',
    choices:[
      { t:'往井里丢一颗糖果（失去 5 金币）', cond:r=>r.gold>=5, eff:(r,c)=>{ c.gold(-5); c.san(8); return '井水泛起甜味。你感到一阵平静。理智 +8。'; } },
      { t:'追问"第几次"是什么意思', eff:(r,c)=>{ c.san(-6); c.shard(1); return '井沉默了很久。"你会知道的。或者，你已经知道了。"\n理智 -6，记忆碎片 +1。'; } },
      { t:'离开', eff:(r,c)=>'你快步离开。井水在你身后轻轻笑了一声。' },
    ]},
  { id:'ginger', title:'姜饼人的请求', icon:'🍪',
    text:'一个缺了半条腿的姜饼人拦住你：\n"勇者大人，能把我的腿还给我吗？\n它被『上一任勇者』吃掉了。"',
    choices:[
      { t:'给他一块饼干（回复 8 生命）', eff:(r,c)=>{ c.heal(8); return '你们分享了饼干。虽然他找不回腿，但你找回了力气。'; } },
      { t:'问"上一任勇者"是谁', eff:(r,c)=>{ c.san(-8); return '姜饼人的笑容裂开一道缝："就是你啊。"\n理智 -8。'; } },
      { t:'抢走他手里的糖果袋', eff:(r,c)=>{ c.gold(20); c.san(-4); return '他没有反抗，只是看着你。看得你发毛。\n金币 +20，理智 -4。'; } },
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
      { t:'喝下茶（随机失去 1 张牌，回复全部理智）', eff:(r,c)=>{ c.removeRandomCard(); c.sanFull(); return '你忘记了一件坏事。虽然你也想不起忘了什么。\n这就是重点。'; } },
      { t:'把茶泼在地上', eff:(r,c)=>{ c.san(-3); c.gold(10); return '地面被茶腐蚀出一个洞，洞里露出金币和电线。\n等等，电线？理智 -3，金币 +10。'; } },
    ]},
  { id:'candyhouse', title:'糖果屋', icon:'🏠',
    text:'糖果砌成的小屋，烟囱冒着棉花糖味的烟。\n门没锁。屋里飘着烤饼干的香气。\n墙上挂着一幅画：糖糖被钉在画框里。',
    choices:[
      { t:'进去大吃一顿（回复 15 生命）', eff:(r,c)=>{ c.heal(15); return '饼干很好吃。你决定不去想那幅画。生命 +15。'; } },
      { t:'取下那幅画', eff:(r,c)=>{ c.san(-7); c.shard(2); return '画的背面写着一行小字：\n"第 ■■ 次轮回留念"。理智 -7，记忆碎片 +2。'; } },
      { t:'烧了这栋房子', eff:(r,c)=>{ c.damage(4); c.addCard('bloodblade'); return '火焰是甜的。灰烬里剩下一支红色的蜡笔。\n生命 -4，获得「血色蜡笔」。'; } },
    ]},
  { id:'piano', title:'自动演奏的钢琴', icon:'🎹',
    text:'悬崖边有一架钢琴，正在自己演奏。\n是你很熟悉的旋律。\n熟悉得让你想起——不，你什么也没想起。',
    choices:[
      { t:'坐下听完', eff:(r,c)=>{ c.san(10); return '曲子结束时，琴键上放着一颗糖。理智 +10。'; } },
      { t:'掀开琴盖看里面', eff:(r,c)=>{ c.san(-9); c.shard(1); return '里面没有琴弦。只有无数条数据线，缠成一个茧。\n茧动了一下。理智 -9，记忆碎片 +1。'; } },
    ]},
  { id:'shopkeeper', title:'迷路的商人', icon:'🎒',
    text:'一个背着大口袋的商人坐在路边哭。\n"我的地图变成了乱码……勇者大人，\n能告诉我『出口』怎么走吗？"',
    choices:[
      { t:'给他指一条你也不知道对不对的路', eff:(r,c)=>{ c.gold(15); return '"谢谢！"他朝你指的方向跑去。\n你听到他在很远的地方撞上了一堵看不见的墙。金币 +15。'; } },
      { t:'告诉他"这里没有出口"', eff:(r,c)=>{ c.san(-5); c.relic(); return '他愣住，然后诡异地笑了："你也发现了啊。"\n他留下一个遗物，走进了空气里。理智 -5，获得随机遗物。'; } },
    ]},
  { id:'sleep', title:'打盹的巨龙', icon:'🐉',
    text:'一头棉花糖做的巨龙在睡觉，怀里抱着宝箱。\n它的呼噜声拼出了一个字：\n"救——救——"',
    choices:[
      { t:'悄悄拿走宝箱', eff:(r,c)=>{ if(Math.random()<0.6){c.gold(40);return '得手了！金币 +40。巨龙翻了个身，继续喊救命。';}c.damage(12);return '巨龙的眼睛睁开一条缝——那是人类的眼睛。\n你逃了出来。生命 -12。'; } },
      { t:'回应它的呼救', eff:(r,c)=>{ c.san(-6); c.san(6); c.heal(6); return '你轻声说"我听到了"。呼噜声停了。\n醒来时你手里攥着一颗龙泪糖。生命 +6，理智波动。'; } },
    ]},
  { id:'wall', title:'写满字的墙', icon:'🧱',
    text:'整面墙密密麻麻写满了同一句话，笔迹从工整到癫狂：\n"这次一定要通关这次一定要通关这次一定要……"\n\n最新的那行字，是你的笔迹。',
    choices:[
      { t:'读完全部文字', eff:(r,c)=>{ c.san(-10); c.shard(2); return '你数清了：共 ■■■ 次。\n理智 -10，记忆碎片 +2。'; } },
      { t:'在墙上写下新的一句话', eff:(r,c)=>{ c.san(6); return '你写："糖糖，别怕。"\n字迹闪了一下，像被谁记住了。理智 +6。'; } },
    ]},
  { id:'fountain', title:'许愿喷泉', icon:'⛲',
    text:'喷泉的水是彩虹色的。池底沉着数不清的金币。\n告示牌写着：投币许愿，概不退还。\n\n池底的金币摆成了一个形状：→ ? ←',
    choices:[
      { t:'投币许愿（10 金币，回复 12 生命）', cond:r=>r.gold>=10, eff:(r,c)=>{ c.gold(-10); c.heal(12); return '愿望实现了。虽然你不记得许了什么。生命 +12。'; } },
      { t:'捞池底的金币', eff:(r,c)=>{ c.gold(25); c.san(-6); return '每枚金币上都刻着你的名字。\n你装作没看见。金币 +25，理智 -6。'; } },
    ]},
  { id:'grave', title:'勇者之墓', icon:'🪦',
    text:'一片小小的墓地，整齐排列着几十块墓碑。\n每块碑上都刻着同一个名字：糖糖。\n\n区别只在日期。最早的一块，字迹已经风化了。',
    choices:[
      { t:'献上一朵花', eff:(r,c)=>{ c.san(8); c.shard(1); return '风吹过你耳边，像很多个声音一起说"谢谢"。\n理智 +8，记忆碎片 +1。'; } },
      { t:'挖开最新的一座', eff:(r,c)=>{ c.san(-8); c.relic(); return '棺材是空的。陪葬品还温热。\n理智 -8，获得随机遗物。'; } },
    ]},
  { id:'door', title:'标着"出口"的门', icon:'🚪',
    text:'墙上突兀地立着一扇门，挂着「EXIT」的牌子。\n门缝里没有光，只有代码一样的东西在流动。\n\n门把手上挂着牌子：员工专用。',
    choices:[
      { t:'拧动门把手', eff:(r,c)=>{ c.san(-12); c.shard(2); return '门纹丝不动。但门那边有什么东西，\n也把手放在了把手上。理智 -12，记忆碎片 +2。'; } },
      { t:'在门前坐下等', eff:(r,c)=>{ c.heal(8); c.san(4); return '你等了一会儿。门那边传来轻轻的敲击声，\n像在回应你。生命 +8，理智 +4。'; } },
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
