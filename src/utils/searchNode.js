/** Each search run gets its own factory so node ids are unique and increasing. */
export function createNodeFactory() {
  let nextId = 0
  return function createNode(parent, state, move) {
    return {
      id: nextId++,
      parent,
      state,
      move,
      depth: parent ? parent.depth + 1 : 0,
    }
  }
}

/** Plain snapshot sent to the UI: { id, parentId, state, move, depth, status } */
export function toEventNode(node, status) {
  return {
    id: node.id,
    parentId: node.parent ? node.parent.id : null,
    state: node.state,
    move: node.move,
    depth: node.depth,
    status,
  }
}

/** Walks parent links and returns the root -> goal path as snapshots. */
export function extractPath(node) {
  const path = []
  for (let current = node; current; current = current.parent) {
    path.push(toEventNode(current, 'solution'))
  }
  return path.reverse()
}