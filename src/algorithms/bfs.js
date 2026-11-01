import { getNeighbors, isGoal, stateKey } from '../utils/puzzle.js'
import {
  createNodeFactory,
  extractPath,
  toEventNode,
} from '../utils/searchNode.js'

/**
 * Breadth-First Search.
 * Frontier: FIFO queue. Duplicates: global visited set.
 * Yields events: generate | expand | goal | fail
 */
export function* bfs(initialState, options = {}) {
  const { maxGenerated = 500000 } = options
  const createNode = createNodeFactory()
  const stats = { generated: 0, expanded: 0, maxFrontier: 0, maxDepth: 0 }
  const snap = () => ({ ...stats })

  const root = createNode(null, initialState, null)
  stats.generated = 1
  stats.maxFrontier = 1
  yield { type: 'generate', node: toEventNode(root, 'frontier'), stats: snap() }

  if (isGoal(root.state)) {
    yield {
      type: 'goal',
      node: toEventNode(root, 'solution'),
      path: extractPath(root),
      stats: snap(),
    }
    return
  }

  const queue = [root]
  let head = 0
  const visited = new Set([stateKey(root.state)])

  while (head < queue.length) {
    const current = queue[head++]
    stats.expanded++
    yield { type: 'expand', node: toEventNode(current, 'expanded'), stats: snap() }

    for (const { state, move } of getNeighbors(current.state)) {
      const key = stateKey(state)
      if (visited.has(key)) continue

      if (stats.generated >= maxGenerated) {
        yield { type: 'fail', reason: 'node-limit', stats: snap() }
        return
      }

      visited.add(key)
      const child = createNode(current, state, move)
      queue.push(child)

      stats.generated++
      stats.maxDepth = Math.max(stats.maxDepth, child.depth)
      stats.maxFrontier = Math.max(stats.maxFrontier, queue.length - head)
      yield { type: 'generate', node: toEventNode(child, 'frontier'), stats: snap() }

      if (isGoal(state)) {
        yield {
          type: 'goal',
          node: toEventNode(child, 'solution'),
          path: extractPath(child),
          stats: snap(),
        }
        return
      }
    }
  }

  yield { type: 'fail', reason: 'exhausted', stats: snap() }
}