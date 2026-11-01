import { generateRandomPuzzle, generateScrambledPuzzle } from '../src/utils/randomPuzzle.js'
import { isSolvable, isValidState } from '../src/utils/puzzle.js'
import { runToCompletion } from '../src/algorithms/index.js'

// 1) Random puzzles must always be valid and solvable
for (let i = 0; i < 1000; i++) {
  const s = generateRandomPuzzle()
  if (!isValidState(s) || !isSolvable(s)) throw new Error(`Bad puzzle: ${s}`)
}
console.log('OK: 1000 random puzzles are valid and solvable')

// 2) Run all three algorithms on the same scrambled puzzle
const start = generateScrambledPuzzle(8)
console.log('Start state:', start.join(' '))

for (const id of ['bfs', 'dfs', 'ids']) {
  const r = runToCompletion(id, start, { depthLimit: 12 })
  console.log(
    id.toUpperCase().padEnd(4),
    r.solved ? 'solved' : `FAILED (${r.reason})`,
    '| path length:', Math.max(0, r.path.length - 1),
    '| stats:', JSON.stringify(r.stats),
    '|', r.timeMs.toFixed(1), 'ms',
  )
}