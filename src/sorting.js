// Sorting algorithms. Each one records a list of animation steps instead of
// mutating the screen directly, so playback speed is independent of the logic.
// A step is { arr, hi, done } where hi = indices being compared/moved right
// now and done = indices already in their final sorted position.

export function getSortingSteps(algo, input) {
  const arr = [...input]
  const steps = []
  let comparisons = 0
  let swaps = 0

  const push = (hi = [], done = []) => steps.push({ arr: [...arr], hi, done })
  const swap = (i, j) => {
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
    swaps++
  }

  if (algo === 'bubble') {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        comparisons++
        push([j, j + 1], doneSoFar(arr.length, i))
        if (arr[j] > arr[j + 1]) {
          swap(j, j + 1)
          push([j, j + 1], doneSoFar(arr.length, i))
        }
      }
    }
  }

  if (algo === 'selection') {
    // Selection sort finalizes from the front, unlike bubble sort.
    const doneFront = (i) => arr.map((_, k) => k).filter((k) => k < i)
    for (let i = 0; i < arr.length; i++) {
      let min = i
      for (let j = i + 1; j < arr.length; j++) {
        comparisons++
        push([min, j], doneFront(i))
        if (arr[j] < arr[min]) min = j
      }
      if (min !== i) {
        swap(i, min)
        push([i, min], doneFront(i))
      }
    }
  }

  if (algo === 'insertion') {
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]
      let j = i - 1
      while (j >= 0) {
        comparisons++
        push([j, j + 1], [])
        if (arr[j] > key) {
          arr[j + 1] = arr[j]
          swaps++
          push([j, j + 1], [])
          j--
        } else {
          break
        }
      }
      arr[j + 1] = key
      push([j + 1], [])
    }
  }

  if (algo === 'merge') {
    const merge = (left, mid, right) => {
      const temp = []
      let i = left
      let j = mid + 1
      while (i <= mid && j <= right) {
        comparisons++
        push([i, j], [])
        if (arr[i] <= arr[j]) temp.push(arr[i++])
        else temp.push(arr[j++])
      }
      while (i <= mid) temp.push(arr[i++])
      while (j <= right) temp.push(arr[j++])
      for (let k = 0; k < temp.length; k++) {
        arr[left + k] = temp[k]
        push([left + k], [])
      }
    }
    const sort = (left, right) => {
      if (left >= right) return
      const mid = Math.floor((left + right) / 2)
      sort(left, mid)
      sort(mid + 1, right)
      merge(left, mid, right)
    }
    sort(0, arr.length - 1)
  }

  if (algo === 'quick') {
    const partition = (low, high) => {
      const pivot = arr[high]
      let i = low - 1
      for (let j = low; j < high; j++) {
        comparisons++
        push([j, high], [])
        if (arr[j] < pivot) {
          i++
          swap(i, j)
          push([i, j], [])
        }
      }
      swap(i + 1, high)
      push([i + 1, high], [])
      return i + 1
    }
    const sort = (low, high, done) => {
      if (low > high) return
      const p = partition(low, high)
      const nextDone = [...done, p]
      push([], nextDone)
      sort(low, p - 1, nextDone)
      sort(p + 1, high, nextDone)
    }
    sort(0, arr.length - 1, [])
  }

  push([], arr.map((_, i) => i))
  return { steps, comparisons, swaps }
}

function doneSoFar(n, pass) {
  // After `pass` bubble/selection passes, the last `pass` elements are sorted.
  const done = []
  for (let i = n - pass; i < n; i++) done.push(i)
  return done
}

export const SORTING_ALGOS = [
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n^2) average, O(n) best' },
  { id: 'selection', name: 'Selection Sort', complexity: 'O(n^2) always' },
  { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n^2) average, O(n) best' },
  { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n) always, O(n) space' },
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n) average, O(n^2) worst' }
]
