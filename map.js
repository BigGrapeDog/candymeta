/* ═══════ map.js · 以撒式楼层生成与渲染 ═══════ */
const GameMap = {
  /* 生成一层地图：7×7 网格随机游走 */
  generate(floorIdx) {
    const cfg = FLOORS[floorIdx];
    // 第5层：只有 Boss 房
    if (floorIdx === 4) {
      const rooms = [{ x:3, y:3, type:'boss', visited:false, cleared:false, dist:0 }];
      return { floor: floorIdx, rooms, pos: { x:3, y:3 }, bossRoom: rooms[0] };
    }
    const N = cfg.roomCount;
    const key = (x, y) => x + ',' + y;
    const grid = {};
    grid[key(3, 3)] = { x:3, y:3, type:'start', visited:true, cleared:true, dist:0 };
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let guard = 0;
    while (Object.keys(grid).length < N && guard++ < 500) {
      const list = Object.values(grid);
      const base = list[Math.floor(Math.random() * list.length)];
      const d = dirs[Math.floor(Math.random() * 4)];
      const nx = base.x + d[0], ny = base.y + d[1];
      if (nx < 0 || nx > 6 || ny < 0 || ny > 6) continue;
      if (grid[key(nx, ny)]) continue;
      // 限制每个房间最多 3 个邻居，避免过密
      const neighbors = dirs.filter(dd => grid[key(nx + dd[0], ny + dd[1])]).length;
      if (neighbors > 2) continue;
      grid[key(nx, ny)] = { x:nx, y:ny, type:'battle', visited:false, cleared:false, dist: base.dist + 1 };
    }
    const rooms = Object.values(grid);
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
    return { floor: floorIdx, rooms, pos: { x:3, y:3 }, bossRoom: boss };
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
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const cell = document.createElement('div');
        cell.className = 'map-cell';
        const room = this.roomAt(map, x, y);
        if (room && (room.visited || this.adjacentToVisited(map, room))) {
          cell.classList.add('revealed');
          cell.textContent = ROOM_ICONS[room.type] || '👾';
          if (room.cleared) cell.classList.add('done');
          if (room === cur) {
            cell.classList.add('current');
          } else if (curCleared && this.adjacent(map, room)) {
            cell.classList.add('movable');
            cell.onclick = () => moveToRoom(room);
          }
        }
        el.appendChild(cell);
      }
    }
    const cfg = FLOORS[map.floor];
    document.getElementById('floor-title').textContent =
      `第${map.floor + 1}层 · ${cfg.name}`;
    document.getElementById('map-hint').textContent = curCleared
      ? '点击发光的相邻房间移动' : '清理当前房间后才能继续前进！';
  },

  adjacentToVisited(map, room) {
    return map.rooms.some(r => r.visited && Math.abs(r.x - room.x) + Math.abs(r.y - room.y) === 1);
  },
};
