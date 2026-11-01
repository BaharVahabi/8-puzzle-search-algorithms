import Board from './Board.jsx'

const MOVE_LABELS = {
  Up: 'Blank ↑',
  Down: 'Blank ↓',
  Left: 'Blank ←',
  Right: 'Blank →',
}

export default function SolutionPath({ path }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Solution path
        {path.length > 0 && (
          <span className="ml-2 normal-case text-emerald-600">({path.length - 1} moves)</span>
        )}
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        Each label shows the direction the empty cell moved to reach that step.
      </p>

      {path.length === 0 ? (
        <p className="text-sm text-slate-500">
          The solution path appears here once the search reaches the goal.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4" dir="ltr">
          {path.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  index === 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : index === path.length - 1
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {index === 0 ? 'Start' : `${index}. ${MOVE_LABELS[node.move]}`}
              </span>
              <Board state={node.state} size="md" />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}