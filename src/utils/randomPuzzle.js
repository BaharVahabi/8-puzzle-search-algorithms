import {
  GOAL_STATE,
  getNeighbors,
  isGoal,
  isSolvable,
  statesEqual,
} from './puzzle.js'

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Fully random solvable state. Roughly half of all permutations are
 * solvable, so the loop finishes after about two attempts on average.
 * Typical solution depth is around 20+, which can be heavy for DFS.
 */
export function generateRandomPuzzle() {
  let state
  do {
    state = shuffle(GOAL_STATE)
  } while (!isSolvable(state) || isGoal(state))
  return state
}

/**
 * Random walk of `steps` legal moves starting from the goal.
 * Always solvable, and the optimal solution depth is at most `steps`,
 * so it is ideal for demos where the tree should stay readable.
 */
export function generateScrambledPuzzle(steps = 10) {
  const total = Math.max(1, Math.floor(steps))
  let state
  do {
    state = [...GOAL_STATE]
    let previous = null
    for (let i = 0; i < total; i++) {
      const options = getNeighbors(state).filter(
        (n) => previous === null || !statesEqual(n.state, previous),
      )
      const pick = options[Math.floor(Math.random() * options.length)]
      previous = state
      state = pick.state
    }
  } while (isGoal(state))
  return state
}