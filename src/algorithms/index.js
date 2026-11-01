import { bfs } from './bfs.js'
import { dfs } from './dfs.js'
import { ids } from './ids.js'

export const ALGORITHMS = {
  bfs: { id: 'bfs', name: 'BFS', fullName: 'Breadth-First Search', run: bfs },
  dfs: { id: 'dfs', name: 'DFS', fullName: 'Depth-First Search', run: dfs },
  ids: { id: 'ids', name: 'IDS', fullName: 'Iterative Deepening Search', run: ids },
}

export const ALGORITHM_LIST = Object.values(ALGORITHMS)

/**
 * Drains a search generator without pausing and measures wall-clock time.
 * Returns { solved, path, stats, reason, timeMs }.
 */
export function runToCompletion(algorithmId, initialState, options = {}) {
  const algorithm = ALGORITHMS[algorithmId]
  if (!algorithm) throw new Error(`Unknown algorithm: ${algorithmId}`)

  const result = { solved: false, path: [], stats: null, reason: null, timeMs: 0 }
  const start = performance.now()

  for (const event of algorithm.run(initialState, options)) {
    result.stats = event.stats
    if (event.type === 'goal') {
      result.solved = true
      result.path = event.path
    } else if (event.type === 'fail') {
      result.reason = event.reason
    }
  }

  result.timeMs = performance.now() - start
  return result
}