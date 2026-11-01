import { getNeighbors, isGoal, statesEqual } from '../utils/puzzle.js'
import {
  createNodeFactory,
  extractPath,
  toEventNode,
} from '../utils/searchNode.js'

/** True if `state` already appears on the path from the root to `node`. */
function isOnPath(node, state) {
  for (let current = node; current; current = current.parent) {
    if (statesEqual(current.state, state)) return true
  }
  return false
}

/**
 * Depth-First Search with a depth limit and path-based cycle checking.
 * Frontier: LIFO stack. Children are pushed in reverse order so the
 * first move (Up) is explored first.
 * Yields events: generate | expand | prune | goal | fail
 */
export function* dfs(initialState, options = {}) {
  const { depthLimit = 20, maxGenerated = 500000 } = options
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

  const stack = [root]
  let cutoffOccurred = false

  while (stack.length > 0) {
    const current = stack.pop()

    if (current.depth >= depthLimit) {
      cutoffOccurred = true
      yield { type: 'prune', node: toEventNode(current, 'pruned'), stats: snap() }
      continue
    }

    stats.expanded++
    yield { type: 'expand', node: toEventNode(current, 'expanded'), stats: snap() }

    const children = []
    for (const { state, move } of getNeighbors(current.state)) {
      if (isOnPath(current, state)) continue

      if (stats.generated >= maxGenerated) {
        yield { type: 'fail', reason: 'node-limit', stats: snap() }
        return
      }

      const child = createNode(current, state, move)
      children.push(child)

      stats.generated++
      stats.maxDepth = Math.max(stats.maxDepth, child.depth)
      stats.maxFrontier = Math.max(stats.maxFrontier, stack.length + children.length)
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

    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i])
    }
  }

  yield {
    type: 'fail',
    reason: cutoffOccurred ? 'depth-limit' : 'exhausted',
    stats: snap(),
  }
}