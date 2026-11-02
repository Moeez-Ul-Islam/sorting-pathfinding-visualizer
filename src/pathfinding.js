// Pathfinding on a grid. Walls are a Set of "row,col" keys. Each algorithm
// returns the order nodes were visited plus the shortest path it found
// (empty when the end is unreachable), so the UI can animate both phases.

export const ROWS = 15
export const COLS = 25
export const START = { r: 7, c: 2 }
export const END = { r: 7, c: 22 }

const key = (r, c) => `${r},${c}`

function neighbors(r, c, walls) {
  const out = []
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue
    if (walls.has(key(nr, nc))) continue
    out.push({ r: nr, c: nc })
  }
  return out
}

function buildPath(prev, start, end) {
  if (!prev.has(key(end.r, end.c)) && !(start.r === end.r && start.c === end.c)) {
    return []
  }
  const path = []
  let cur = { ...end }
  while (!(cur.r === start.r && cur.c === start.c)) {
    path.unshift(cur)
    cur = prev.get(key(cur.r, cur.c))
    if (!cur) return []
  }
  path.unshift({ ...start })
  return path
}

export function dijkstra(walls, start, end) {
  const dist = new Map([[key(start.r, start.c), 0]])
  const prev = new Map()
  const visitedOrder = []
  const done = new Set()
  while (true) {
    let cur = null
    let best = Infinity
    for (const [k, d] of dist) {
      if (!done.has(k) && d < best) {
        best = d
        cur = k
      }
    }
    if (cur === null) break
    done.add(cur)
    const [r, c] = cur.split(',').map(Number)
    visitedOrder.push({ r, c })
    if (r === end.r && c === end.c) break
    for (const nb of neighbors(r, c, walls)) {
      const nk = key(nb.r, nb.c)
      const nd = best + 1
      if (!dist.has(nk) || nd < dist.get(nk)) {
        dist.set(nk, nd)
        prev.set(nk, { r, c })
      }
    }
  }
  return { visitedOrder, path: buildPath(prev, start, end) }
}

export function bfs(walls, start, end) {
  const prev = new Map()
  const seen = new Set([key(start.r, start.c)])
  const queue = [{ ...start }]
  const visitedOrder = []
  while (queue.length > 0) {
    const cur = queue.shift()
    visitedOrder.push(cur)
    if (cur.r === end.r && cur.c === end.c) break
    for (const nb of neighbors(cur.r, cur.c, walls)) {
      const nk = key(nb.r, nb.c)
      if (seen.has(nk)) continue
      seen.add(nk)
      prev.set(nk, cur)
      queue.push(nb)
    }
  }
  return { visitedOrder, path: buildPath(prev, start, end) }
}

export function aStar(walls, start, end) {
  const h = (r, c) => Math.abs(r - end.r) + Math.abs(c - end.c)
  const g = new Map([[key(start.r, start.c), 0]])
  const prev = new Map()
  const open = [{ ...start }]
  const done = new Set()
  const visitedOrder = []
  while (open.length > 0) {
    open.sort((a, b) => g.get(key(a.r, a.c)) + h(a.r, a.c) - (g.get(key(b.r, b.c)) + h(b.r, b.c)))
    const cur = open.shift()
    const ck = key(cur.r, cur.c)
    if (done.has(ck)) continue
    done.add(ck)
    visitedOrder.push(cur)
    if (cur.r === end.r && cur.c === end.c) break
    for (const nb of neighbors(cur.r, cur.c, walls)) {
      const nk = key(nb.r, nb.c)
      const ng = g.get(ck) + 1
      if (!g.has(nk) || ng < g.get(nk)) {
        g.set(nk, ng)
        prev.set(nk, cur)
        if (!open.some((n) => n.r === nb.r && n.c === nb.c)) open.push(nb)
      }
    }
  }
  return { visitedOrder, path: buildPath(prev, start, end) }
}

export const PATH_ALGOS = [
  { id: 'dijkstra', name: 'Dijkstra', note: 'Shortest path on weighted/unweighted graphs' },
  { id: 'astar', name: 'A* Search', note: 'Dijkstra + Manhattan heuristic, faster on grids' },
  { id: 'bfs', name: 'Breadth-First Search', note: 'Shortest path on unweighted grids' }
]
