import { generateScrambledPuzzle } from '../src/utils/randomPuzzle.js'
import { ALGORITHMS } from '../src/algorithms/index.js'
import { buildFlowGraph } from '../src/utils/treeLayout.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const start = generateScrambledPuzzle(10)
console.log('Start state:', start.join(' '))

for (const id of ['bfs', 'dfs', 'ids']) {
  // Mirror what useSearchRunner does with the events.
  let nodes = new Map()
  let solutionCount = 0
  for (const event of ALGORITHMS[id].run(start, { depthLimit: 20 })) {
    if (event.type === 'limit') nodes = new Map()
    else if (event.node) nodes.set(event.node.id, event.node)
    if (event.type === 'goal') {
      for (const node of event.path) nodes.set(node.id, node)
      solutionCount = event.path.length
    }
  }

  const treeNodes = Array.from(nodes.values())

  for (const cap of [Infinity, 50]) {
    const graph = buildFlowGraph(treeNodes, { maxRendered: cap })
    const ids = new Set(graph.nodes.map((n) => n.id))

    assert(graph.nodes.length >= Math.min(treeNodes.length, cap), `${id}: too few nodes`)
    for (const edge of graph.edges) {
      assert(ids.has(edge.source) && ids.has(edge.target), `${id}: dangling edge ${edge.id}`)
    }
    assert(graph.edges.length === graph.nodes.length - 1, `${id}: tree must have n-1 edges`)

    const positions = new Set(graph.nodes.map((n) => `${n.position.x},${n.position.y}`))
    assert(positions.size === graph.nodes.length, `${id}: overlapping nodes`)

    const shownSolution = graph.nodes.filter((n) => n.data.status === 'solution').length
    assert(shownSolution === solutionCount, `${id}: solution path was cut`)

    console.log(
      id.toUpperCase().padEnd(4),
      `cap=${cap}`.padEnd(14),
      `tree=${treeNodes.length}`.padEnd(12),
      `rendered=${graph.nodes.length}`.padEnd(15),
      `edges=${graph.edges.length}`,
    )
  }
}

console.log('OK: tree layout checks passed')