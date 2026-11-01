export const NODE_WIDTH = 96
export const NODE_HEIGHT = 112
const H_GAP = 24
const V_GAP = 56

const EDGE_STYLES = {
  solution: { stroke: '#10b981', strokeWidth: 3 },
  default: { stroke: '#94a3b8', strokeWidth: 1.5 },
}

function selectVisible(treeNodes, maxRendered) {
  if (treeNodes.length <= maxRendered) return treeNodes

  const chosen = new Set()
  for (const node of treeNodes) {
    if (node.status === 'solution') chosen.add(node.id)
  }
  for (const node of treeNodes) {
    if (chosen.size >= maxRendered) break
    chosen.add(node.id)
  }
  return treeNodes.filter((node) => chosen.has(node.id))
}

/**
 * treeNodes: array of { id, parentId, state, move, depth, status } in creation order.
 * Returns { nodes, edges, hiddenCount } ready for <ReactFlow />.
 */
export function buildFlowGraph(treeNodes, { maxRendered = 500, activeId = null } = {}) {
  const visible = selectVisible(treeNodes, maxRendered)
  const byId = new Map(visible.map((node) => [node.id, node]))

  const children = new Map()
  const roots = []
  for (const node of visible) {
    if (node.parentId !== null && byId.has(node.parentId)) {
      if (!children.has(node.parentId)) children.set(node.parentId, [])
      children.get(node.parentId).push(node.id)
    } else {
      roots.push(node.id)
    }
  }

  // Leaves get consecutive slots; a parent sits in the middle of its children.
  const slots = new Map()
  let nextLeafSlot = 0
  const place = (id) => {
    const kids = children.get(id)
    if (!kids) {
      slots.set(id, nextLeafSlot++)
      return
    }
    for (const kid of kids) place(kid)
    slots.set(id, (slots.get(kids[0]) + slots.get(kids[kids.length - 1])) / 2)
  }
  roots.forEach(place)

  const nodes = visible.map((node) => ({
    id: String(node.id),
    type: 'puzzle',
    position: {
      x: slots.get(node.id) * (NODE_WIDTH + H_GAP),
      y: node.depth * (NODE_HEIGHT + V_GAP),
    },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    draggable: false,
    selectable: false,
    data: {
      state: node.state,
      move: node.move,
      depth: node.depth,
      status: node.status,
      isActive: node.id === activeId,
    },
  }))

  const edges = []
  for (const node of visible) {
    if (node.parentId === null || !byId.has(node.parentId)) continue
    const style = node.status === 'solution' ? EDGE_STYLES.solution : EDGE_STYLES.default
    edges.push({
      id: `e${node.parentId}-${node.id}`,
      source: String(node.parentId),
      target: String(node.id),
      type: 'smoothstep',
      style,
    })
  }

  return { nodes, edges, hiddenCount: treeNodes.length - visible.length }
}