export const SIZE = 3
export const GOAL_STATE = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 0])

export function stateKey(state) {
  return state.join(',')
}

export function statesEqual(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function isGoal(state) {
  return statesEqual(state, GOAL_STATE)
}

export function isValidState(state) {
  if (!Array.isArray(state) || state.length !== SIZE * SIZE) return false
  const seen = new Set(state)
  if (seen.size !== SIZE * SIZE) return false
  for (let v = 0; v < SIZE * SIZE; v++) {
    if (!seen.has(v)) return false
  }
  return true
}

/**
 * Returns every state reachable by sliding the blank (0) one step.
 * The order is fixed (Up, Down, Left, Right) so all algorithms behave
 * deterministically. `move` describes the direction the BLANK moves.
 */
export function getNeighbors(state) {
  const blank = state.indexOf(0)
  const row = Math.floor(blank / SIZE)
  const col = blank % SIZE

  const candidates = [
    { move: 'Up', allowed: row > 0, target: blank - SIZE },
    { move: 'Down', allowed: row < SIZE - 1, target: blank + SIZE },
    { move: 'Left', allowed: col > 0, target: blank - 1 },
    { move: 'Right', allowed: col < SIZE - 1, target: blank + 1 },
  ]

  const neighbors = []
  for (const { move, allowed, target } of candidates) {
    if (!allowed) continue
    const next = [...state]
    next[blank] = next[target]
    next[target] = 0
    neighbors.push({ state: next, move })
  }
  return neighbors
}

/** Inversions are counted over the tiles only (the blank is ignored). */
export function countInversions(state) {
  const tiles = state.filter((t) => t !== 0)
  let inversions = 0
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++
    }
  }
  return inversions
}

/**
 * For a 3x3 board (odd width) a state can reach the goal
 * [1,2,3,4,5,6,7,8,0] if and only if its inversion count is even.
 */
export function isSolvable(state) {
  return countInversions(state) % 2 === 0
}