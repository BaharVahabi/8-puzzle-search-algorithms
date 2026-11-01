import { getNeighbors, isGoal, statesEqual } from '../utils/puzzle.js'
import {
  createNodeFactory,
  extractPath,
  toEventNode,
} from '../utils/searchNode.js'

function isOnPath(node, state) {
  for (let current = node; current; current = current.parent) {
    if (statesEqual(current.state, state)) return true
  }
  return false
}

/**
 * One depth-limited DFS pass. Returns 'found' | 'cutoff' | 'failure' | 'node-limit'.
 * It shares `ctx` (node factory, cumulative stats) with the outer IDS loop.
 */
function* depthLimitedSearch(initialState, limit, ctx) {
  const { createNode, stats, snap, maxGenerated } = ctx

  const root = createNode(null, initialState, null)
  stats.generated++
  stats.maxFrontier = Math.max(stats.maxFrontier, 1)
  yield { type: 'generate', node: toEventNode(root, 'frontier'), stats: snap() }

  if (isGoal(root.state)) {
    yield {
      type: 'goal',
      node: toEventNode(root, 'solution'),
      path: extractPath(root),
      stats: snap(),
    }
    return 'found'
  }

  const stack = [root]
  let cutoffOccurred = false

  while (stack.length > 0) {
    const current = stack.pop()

    if (current.depth >= limit) {
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
        return 'node-limit'
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
        return 'found'
      }
    }

    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i])
    }
  }

  return cutoffOccurred ? 'cutoff' : 'failure'
}

/**
 * Iterative Deepening Search: depth-limited DFS with limit = 0, 1, 2, ...
 * 31 is the maximum optimal solution depth of the 8-puzzle, so it is the
 * default upper bound.
 * Yields events: limit | generate | expand | prune | goal | fail
 */
export function* ids(initialState, options = {}) {
  const { maxDepth = 31, maxGenerated = 500000 } = options
  const stats = { generated: 0, expanded: 0, maxFrontier: 0, maxDepth: 0 }
  const ctx = {
    createNode: createNodeFactory(),
    stats,
    snap: () => ({ ...stats }),
    maxGenerated,
  }

  for (let limit = 0; limit <= maxDepth; limit++) {
    yield { type: 'limit', depthLimit: limit, stats: ctx.snap() }

    const result = yield* depthLimitedSearch(initialState, limit, ctx)

    if (result === 'found') return
    if (result === 'node-limit') return
    if (result === 'failure') {
      yield { type: 'fail', reason: 'exhausted', stats: ctx.snap() }
      return
    }
    // result === 'cutoff' -> try the next, deeper limit
  }

  yield { type: 'fail', reason: 'depth-limit', stats: ctx.snap() }
}