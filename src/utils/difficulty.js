import { generateRandomPuzzle, generateScrambledPuzzle } from './randomPuzzle.js'

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy (up to 6 moves)', steps: 6 },
  { id: 'medium', label: 'Medium (up to 10 moves)', steps: 10 },
  { id: 'hard', label: 'Hard (up to 14 moves)', steps: 14 },
  { id: 'random', label: 'Fully random', steps: null },
]

export const DEFAULT_DIFFICULTY = 'medium'

export function generatePuzzle(difficultyId) {
  const difficulty =
    DIFFICULTIES.find((d) => d.id === difficultyId) ?? DIFFICULTIES[1]
  return difficulty.steps === null
    ? generateRandomPuzzle()
    : generateScrambledPuzzle(difficulty.steps)
}