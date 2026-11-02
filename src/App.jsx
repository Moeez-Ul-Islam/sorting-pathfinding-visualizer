import { useEffect, useRef, useState } from 'react'
import { getSortingSteps, SORTING_ALGOS } from './sorting.js'
import { ROWS, COLS, START, END, dijkstra, bfs, aStar, PATH_ALGOS } from './pathfinding.js'

const randomArray = (n) => Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 96))
const cellKey = (r, c) => `${r},${c}`

export default function App() {
  const [tab, setTab] = useState('sorting')
  return (
    <div className="page">
      <header className="hero">
        <h1>Algo Visualizer</h1>
        <p>Sorting and pathfinding algorithms, visualized step by step. Built with React.</p>
        <div className="tabs">
          <button className={tab === 'sorting' ? 'tab active' : 'tab'} onClick={() => setTab('sorting')}>Sorting</button>
          <button className={tab === 'pathfinding' ? 'tab active' : 'tab'} onClick={() => setTab('pathfinding')}>Pathfinding</button>
        </div>
      </header>
      {tab === 'sorting' ? <SortingPanel /> : <PathfindingPanel />}
      <footer className="footer">
        <p>Sorting: bar height is the value. Orange bars are being compared, green bars are in final position.</p>
        <p>Pathfinding: click or drag on the grid to draw walls. Drag the green start and red end nodes to move them.</p>
      </footer>
    </div>
  )
}

function SortingPanel() {
  const [algo, setAlgo] = useState('merge')
  const [size, setSize] = useState(50)
  const [speed, setSpeed] = useState(70)
  const [array, setArray] = useState(() => randomArray(50))
  const [step, setStep] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [stats, setStats] = useState(null)
  const runRef = useRef(null)

  const delay = 201 - speed * 2 // speed 1..100 maps to ~199ms..1ms

  useEffect(() => () => clearTimeout(runRef.current), [])

  const newArray = (n = size) => {
    clearTimeout(runRef.current)
    setPlaying(false)
    setStep(null)
    setStats(null)
    setArray(randomArray(n))
  }

  const play = () => {
    if (playing) return
    const { steps, comparisons, swaps } = getSortingSteps(algo, array)
    setStats({ comparisons, swaps, total: steps.length })
    setPlaying(true)
    let i = 0
    const tick = () => {
      if (i >= steps.length) {
        setPlaying(false)
        return
      }
      setStep(steps[i])
      i++
      runRef.current = setTimeout(tick, delay)
    }
    tick()
  }

  const shown = step ? step.arr : array
  const hi = new Set(step ? step.hi : [])
  const done = new Set(step ? step.done : [])
  const meta = SORTING_ALGOS.find((a) => a.id === algo)

  return (
    <section className="panel">
      <div className="controls">
        <label>
          Algorithm
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} disabled={playing}>
            {SORTING_ALGOS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <label>
          Array size: {size}
          <input type="range" min="10" max="100" value={size} disabled={playing}
            onChange={(e) => { setSize(Number(e.target.value)); newArray(Number(e.target.value)) }} />
        </label>
        <label>
          Speed: {speed}
          <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <button className="primary" onClick={play} disabled={playing}>Sort</button>
        <button onClick={() => newArray()} disabled={playing}>New array</button>
      </div>
      <p className="meta">{meta.name} &middot; {meta.complexity}</p>
      <div className="bars">
        {shown.map((v, i) => (
          <div
            key={i}
            className={'bar' + (done.has(i) ? ' done' : hi.has(i) ? ' hi' : '')}
            style={{ height: `${v}%` }}
            title={`${v}`}
          />
        ))}
      </div>
      {stats && (
        <p className="stats">
          Comparisons: <b>{stats.comparisons}</b> &nbsp;|&nbsp; Moves: <b>{stats.swaps}</b> &nbsp;|&nbsp; Steps: <b>{stats.total}</b>
        </p>
      )}
    </section>
  )
}

function PathfindingPanel() {
  const [algo, setAlgo] = useState('dijkstra')
  const [walls, setWalls] = useState(new Set())
  const [start, setStart] = useState(START)
  const [end, setEnd] = useState(END)
  const [visited, setVisited] = useState([])
  const [path, setPath] = useState([])
  const [animating, setAnimating] = useState(false)
  const [message, setMessage] = useState('')
  const dragRef = useRef(null)
  const timersRef = useRef([])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const clearAnimation = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setVisited([])
    setPath([])
    setMessage('')
  }

  const paint = (r, c) => {
    const k = cellKey(r, c)
    if (k === cellKey(start.r, start.c) || k === cellKey(end.r, end.c)) return
    setWalls((prev) => {
      const next = new Set(prev)
      if (dragRef.current === 'erase') next.delete(k)
      else next.add(k)
      return next
    })
  }

  const onCellDown = (r, c) => {
    if (animating) return
    clearAnimation()
    const k = cellKey(r, c)
    if (k === cellKey(start.r, start.c)) dragRef.current = 'start'
    else if (k === cellKey(end.r, end.c)) dragRef.current = 'end'
    else {
      dragRef.current = walls.has(k) ? 'erase' : 'wall'
      paint(r, c)
    }
  }

  const onCellEnter = (r, c) => {
    if (!dragRef.current || animating) return
    if (dragRef.current === 'start') setStart({ r, c })
    else if (dragRef.current === 'end') setEnd({ r, c })
    else paint(r, c)
  }

  const onCellUp = () => { dragRef.current = null }

  const run = () => {
    if (animating) return
    clearAnimation()
    const fn = algo === 'dijkstra' ? dijkstra : algo === 'astar' ? aStar : bfs
    const { visitedOrder, path: found } = fn(walls, start, end)
    setAnimating(true)
    visitedOrder.forEach((node, i) => {
      timersRef.current.push(setTimeout(() => setVisited(visitedOrder.slice(0, i + 1)), i * 12))
    })
    const after = visitedOrder.length * 12
    timersRef.current.push(setTimeout(() => {
      setPath(found)
      setAnimating(false)
      setMessage(found.length > 0
        ? `Path found: ${found.length - 1} steps, ${visitedOrder.length} nodes visited.`
        : 'No path found. Remove some walls and try again.')
    }, after + 50))
  }

  const randomMaze = () => {
    if (animating) return
    clearAnimation()
    const next = new Set()
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = cellKey(r, c)
        if (k === cellKey(start.r, start.c) || k === cellKey(end.r, end.c)) continue
        if (Math.random() < 0.3) next.add(k)
      }
    }
    setWalls(next)
  }

  const visitedSet = new Set(visited.map((n) => cellKey(n.r, n.c)))
  const pathSet = new Set(path.map((n) => cellKey(n.r, n.c)))
  const meta = PATH_ALGOS.find((a) => a.id === algo)

  return (
    <section className="panel">
      <div className="controls">
        <label>
          Algorithm
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} disabled={animating}>
            {PATH_ALGOS.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <button className="primary" onClick={run} disabled={animating}>Find path</button>
        <button onClick={randomMaze} disabled={animating}>Random maze</button>
        <button onClick={() => { clearAnimation(); setWalls(new Set()) }} disabled={animating}>Clear walls</button>
        <button onClick={clearAnimation} disabled={animating}>Clear path</button>
      </div>
      <p className="meta">{meta.name} &middot; {meta.note}</p>
      <div className="grid" onMouseLeave={onCellUp}>
        {Array.from({ length: ROWS }, (_, r) => (
          <div className="grid-row" key={r}>
            {Array.from({ length: COLS }, (_, c) => {
              const k = cellKey(r, c)
              let cls = 'cell'
              if (walls.has(k)) cls += ' wall'
              else if (r === start.r && c === start.c) cls += ' start'
              else if (r === end.r && c === end.c) cls += ' end'
              else if (pathSet.has(k)) cls += ' path'
              else if (visitedSet.has(k)) cls += ' visited'
              return (
                <div
                  key={c}
                  className={cls}
                  onMouseDown={() => onCellDown(r, c)}
                  onMouseEnter={() => onCellEnter(r, c)}
                  onMouseUp={onCellUp}
                />
              )
            })}
          </div>
        ))}
      </div>
      {message && <p className="stats">{message}</p>}
      <p className="legend">
        <span className="swatch start" /> Start &nbsp;
        <span className="swatch end" /> End &nbsp;
        <span className="swatch wall" /> Wall &nbsp;
        <span className="swatch visited" /> Visited &nbsp;
        <span className="swatch path" /> Path
      </p>
    </section>
  )
}
