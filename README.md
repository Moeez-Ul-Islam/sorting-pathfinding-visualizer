# Algo Visualizer

Sorting and pathfinding algorithms, visualized step by step. Built with React + Vite.

## Live demo

https://moeez-ul-islam.github.io/sorting-pathfinding-visualizer/

## Sorting

Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort. Bar height is the
value. Orange bars are being compared or moved, dark blue bars are in final position.
The panel reports comparisons, moves and total animation steps.

Complexities: Bubble O(n^2) average, O(n) best. Selection O(n^2) always. Insertion
O(n^2) average, O(n) best. Merge O(n log n) always with O(n) extra space. Quick
O(n log n) average, O(n^2) worst case.

How it works: each algorithm records a list of steps (array snapshot plus highlighted
and finished indices) instead of touching the screen directly, so playback speed is
independent of the algorithm logic.

## Pathfinding

Dijkstra, A* Search and Breadth-First Search on a grid. Click or drag to draw walls,
drag the green start and red end nodes to move them. Light blue cells are visited,
yellow cells are the final path. A* uses Manhattan distance as its heuristic.

Dijkstra finds the shortest path on weighted and unweighted graphs. BFS finds the
shortest path on unweighted grids. A* is Dijkstra plus a heuristic, so it explores
fewer cells on a grid.

## Run it locally

```bash
npm install
npm run dev
```

Build the static site with `npm run build` (output goes to `docs/`).
