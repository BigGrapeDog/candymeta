/* ═══════ map.js · 以撒式楼层生成与渲染 ═══════ */
const GameMap = {
  /* 生成一层地图：7×7 网格随机游走
     meta 崩坏：轮回越多，绘本的边缘被"撕掉"越多（margin），房间也会随机崩坏 */
  generate(floorIdx) {
    const cfg = FLOORS[floorIdx];
    // 本层 Boss（分支时第4层换成分支 Boss）
    let bossId = cfg.boss[Math.floor(Math.random() * cfg.boss.length)];
    if (floorIdx === 3 && typeof run !== 'undefined' && run && run.branch) bossId = BRANCHES[run.branch].boss;
    // 第5层：只有 Boss 房
    if (floorIdx === 4) {
      const rooms = [{ x:3, y:3, type:'boss', visited:false, cleared:false, dist:0 }];
      return { floor: floorIdx, rooms, pos: { x:3, y:3 }, bossRoom: rooms[0], margin:0, bossId };
    }
    const margin = 0; // v2.6.0：不再整圈塌缩，改为边缘零散侵蚀
    // 侵蚀强度随轮回提升：外圈先烂，一圈一圈往里啃，但每次只啃零散几块
    const erosion = Math.min(4, SAVE.loops);
    const N = Math.max(6, cfg.roomCount - erosion * 2);
    const key = (x, y) => x + ',' + y;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let rooms = null, voidsArr = [];
    // 重试兜底：侵蚀把地图切得太碎时换一批侵蚀块重生成，保证房间足够且必有 Boss
    for (let attempt = 0; attempt < 8 && (!rooms || rooms.length < Math.max(4, N - 3)); attempt++) {
      const voidSet = new Set();
      for (let ring = 3; ring >= 1; ring--) {
        const depth = 3 - ring; // 0=最外圈
        const p = Math.max(0, Math.min(0.55, (erosion - depth) * 0.25));
        if (p <= 0) continue;
        for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
          if (Math.max(Math.abs(x - 3), Math.abs(y - 3)) !== ring) continue;
          if (Math.random() < p) voidSet.add(key(x, y));
        }
      }
      const inBounds = (x, y) => x >= 0 && x <= 6 && y >= 0 && y <= 6 && !voidSet.has(key(x, y));
      const grid = {};
      grid[key(3, 3)] = { x:3, y:3, type:'start', visited:true, cleared:true, dist:0 };
      let guard = 0;
      while (Object.keys(grid).length < N && guard++ < 500) {
        const list = Object.values(grid);
        const base = list[Math.floor(Math.random() * list.length)];
        const d = dirs[Math.floor(Math.random() * 4)];
        const nx = base.x + d[0], ny = base.y + d[1];
        if (!inBounds(nx, ny)) continue;
        if (grid[key(nx, ny)]) continue;
        // 限制每个房间最多 3 个邻居，避免过密
        const neighbors = dirs.filter(dd => grid[key(nx + dd[0], ny + dd[1])]).length;
        if (neighbors > 2) continue;
        grid[key(nx, ny)] = { x:nx, y:ny, type:'battle', visited:false, cleared:false, dist: base.dist + 1 };
      }
      const r = Object.values(grid);
      if (!rooms || r.length > rooms.length) { rooms = r; voidsArr = [...voidSet]; }
    }
    // Boss 房 = 距起点最远
    rooms.sort((a, b) => b.dist - a.dist);
    const boss = rooms.find(r => r.type === 'battle');
    boss.type = 'boss';
    // 精英房 = 距离较远的普通房
    const elite = rooms.find(r => r.type === 'battle' && r.dist >= boss.dist - 2 && r !== boss);
    if (elite) elite.type = 'elite';
    // 商店/休息/事件 分配到剩余房间（按距离排序取）
    const rest = rooms.filter(r => r.type === 'battle').sort((a, b) => a.dist - b.dist);
    const specials = ['rest', 'shop', 'event', 'event', 'rest', 'event'];
    let si = 0;
    for (let i = rest.length - 1; i >= 0 && si < specials.length; i -= Math.ceil(rest.length / specials.length) || 1) {
      rest[i].type = specials[si++];
    }
    // 崩坏格：轮回 1 次起，普通房间可能"坏掉"无法进入（保证 Boss 可达）
    let corruptN = Math.min(3, Math.max(0, SAVE.loops));
    let candidates = shuffle(rooms.filter(r => r.type === 'battle'));
    // 塌缩得太厉害时，事件房也会被撕掉
    if (candidates.length < corruptN) candidates = candidates.concat(shuffle(rooms.filter(r => r.type === 'event')));
    for (const r of candidates) {
      if (corruptN <= 0) break;
      r.corrupt = true;
      if (!this.solvable(rooms, boss)) { r.corrupt = false; continue; }
      corruptN--;
    }
    return { floor: floorIdx, rooms, pos: { x:3, y:3 }, bossRoom: boss, margin, voids: voidsArr, bossId };
  },

  /* 从起点到 Boss 是否仍可达（经过任意非崩坏房间） */
  solvable(rooms, boss) {
    const start = rooms.find(r => r.type === 'start');
    if (!start || !boss || start === boss) return true;
    const at = (x, y) => rooms.find(r => r.x === x && r.y === y && !r.corrupt);
    const seen = new Set([start]), queue = [start];
    while (queue.length) {
      const r = queue.shift();
      if (r === boss) return true;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nb = at(r.x + dx, r.y + dy);
        if (nb && !seen.has(nb)) { seen.add(nb); queue.push(nb); }
      }
    }
    return false;
  },

  roomAt(map, x, y) { return map.rooms.find(r => r.x === x && r.y === y) || null; },
  currentRoom(map) { return this.roomAt(map, map.pos.x, map.pos.y); },

  adjacent(map, room) {
    const dx = Math.abs(room.x - map.pos.x), dy = Math.abs(room.y - map.pos.y);
    return dx + dy === 1;
  },

  /* 渲染小地图 */
  render(map) {
    const el = document.getElementById('map-grid');
    el.innerHTML = '';
    const cur = this.currentRoom(map);
    const curCleared = !cur || cur.cleared;
    const margin = map.margin || 0;
    const voids = new Set(map.voids || []); // v2.6.0 零散侵蚀
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const cell = document.createElement('div');
        cell.className = 'map-cell';
        // 绘本被撕掉的边缘：整圈(旧存档) 或 零散侵蚀块
        if (x < margin || x > 6 - margin || y < margin || y > 6 - margin || voids.has(x + ',' + y)) {
          cell.classList.add('void');
          el.appendChild(cell);
          continue;
        }
        const room = this.roomAt(map, x, y);
        // 崩坏的房间：可见但永远进不去
        if (room && room.corrupt) {
          cell.classList.add('corrupt');
          cell.textContent = '▓';
          cell.dataset.tip = '崩坏的房间：这一页被撕掉了，无法进入';
          el.appendChild(cell);
          continue;
        }
        if (room && (room.visited || this.adjacentToVisited(map, room))) {
          cell.classList.add('revealed');
          cell.textContent = ROOM_ICONS[room.type] || '👾';
          if (room.visited) cell.classList.add('visited');
          if (room.cleared) cell.classList.add('done');
          if (room === cur) {
            cell.classList.add('current');
          } else if (curCleared && this.adjacent(map, room)) {
            cell.classList.add('movable');
            cell.onclick = () => { if (!WALKING) moveToRoom(room); };
          } else if (curCleared) {
            // 远处已探明房间：若可经由已清理房间到达，点击直接自动走过去
            const path = this.findPath(map, room);
            if (path) {
              cell.classList.add('walkable');
              cell.onclick = () => { if (!WALKING) autoWalkRoom(path); };
            }
          }
        }
        el.appendChild(cell);
      }
    }
    const cfg = FLOORS[map.floor];
    let fname = cfg.name;
    if (typeof run !== 'undefined' && run && run.san < 30) fname = scrambleLine(fname, 0.25);
    document.getElementById('floor-title').textContent =
      `第${map.floor + 1}层 · ${fname}${(margin > 0 || voids.size > 0) ? '（绘本的边缘正在塌缩）' : ''}`;
    document.getElementById('map-hint').textContent = curCleared
      ? '点击发光的相邻房间移动' : '清理当前房间后才能继续前进！';
  },

  adjacentToVisited(map, room) {
    return map.rooms.some(r => r.visited && Math.abs(r.x - room.x) + Math.abs(r.y - room.y) === 1);
  },

  /* BFS：经由已清理房间到达目标（目标本身只需已探明） */
  findPath(map, target) {
    const start = this.currentRoom(map);
    if (!start || !target || start === target) return null;
    if (!target.visited && !this.adjacentToVisited(map, target)) return null;
    const passable = r => (r === target || r.cleared) && !r.corrupt;
    const prev = new Map(), seen = new Set([start]), queue = [start];
    while (queue.length) {
      const r = queue.shift();
      if (r === target) {
        const path = [];
        let n = target;
        while (n !== start) { path.unshift(n); n = prev.get(n); }
        return path;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nb = this.roomAt(map, r.x + dx, r.y + dy);
        if (nb && !seen.has(nb) && passable(nb)) {
          seen.add(nb); prev.set(nb, r); queue.push(nb);
        }
      }
    }
    return null;
  },
};

/* 自动连走：穿过已清理房间，终点若有内容则弹出进入确认 */
let WALKING = false;
async function autoWalkRoom(path) {
  if (WALKING || !path || !path.length) return;
  WALKING = true;
  for (const room of path) {
    if (!room.cleared) {
      // 未清理的终点：停在门口，弹进入确认
      WALKING = false;
      showMapScreen();
      showRoomIntro(room);
      return;
    }
    run.map.pos = { x: room.x, y: room.y };
    room.visited = true;
    AudioSys.sfx('move');
    GameMap.render(run.map);
    await new Promise(r => setTimeout(r, 150));
  }
  WALKING = false;
  showMapScreen();
  persistRun();
}
