import { ArrowRight, Shuffle } from 'lucide-react'
import Board from './Board.jsx'
import IconButton from './IconButton.jsx'
import { DIFFICULTIES } from '../utils/difficulty.js'

export default function PuzzlePanel({
  initialState,
  goalState,
  difficulty,
  onDifficultyChange,
  onNewPuzzle,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Puzzle
      </h2>

      <div className="flex items-center justify-around gap-2">
        <div className="text-center">
          <p className="mb-2 text-xs font-medium text-slate-500">Initial state</p>
          <Board state={initialState} size="md" />
        </div>
        <ArrowRight className="text-slate-400" aria-hidden="true" />
        <div className="text-center">
          <p className="mb-2 text-xs font-medium text-slate-500">Goal state</p>
          <Board state={goalState} size="md" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={difficulty}
          onChange={(event) => onDifficultyChange(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
          aria-label="Difficulty"
        >
          {DIFFICULTIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <IconButton icon={Shuffle} label="New puzzle" onClick={onNewPuzzle} />
      </div>
    </section>
  )
}