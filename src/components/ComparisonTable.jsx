import { useState } from 'react'
import { Scale } from 'lucide-react'
import { ALGORITHM_LIST, runToCompletion } from '../algorithms/index.js'
import IconButton from './IconButton.jsx'

const REASONS = {
  'node-limit': 'Node limit reached',
  'depth-limit': 'No solution within depth limit',
  exhausted: 'No solution',
}

export default function ComparisonTable({ initialState, options }) {
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = () => {
    setLoading(true)
    // Let the browser paint the "Comparing…" label before the heavy synchronous work.
    setTimeout(() => {
      setRows(
        ALGORITHM_LIST.map((algorithm) => ({
          algorithm,
          result: runToCompletion(algorithm.id, initialState, options),
        })),
      )
      setLoading(false)
    }, 30)
  }

  const solvedLengths = rows
    ? rows.filter((row) => row.result.solved).map((row) => row.result.path.length - 1)
    : []
  const shortest = solvedLengths.length > 0 ? Math.min(...solvedLengths) : null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Algorithm comparison
        </h2>
        <IconButton
          icon={Scale}
          label={loading ? 'Comparing…' : 'Compare all algorithms'}
          onClick={handleCompare}
          disabled={loading}
          variant="primary"
        />
      </div>

      {rows === null ? (
        <p className="text-sm text-slate-500">
          Runs BFS, DFS and IDS on the current puzzle without animation and compares them.
        </p>
      ) : (
        <div className="overflow-x-auto" dir="ltr">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Algorithm</th>
                <th className="py-2 pr-4">Result</th>
                <th className="py-2 pr-4">Path length</th>
                <th className="py-2 pr-4">Generated</th>
                <th className="py-2 pr-4">Expanded</th>
                <th className="py-2 pr-4">Max frontier</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ algorithm, result }) => {
                const length = result.solved ? result.path.length - 1 : null
                return (
                  <tr key={algorithm.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4 font-semibold">{algorithm.name}</td>
                    <td className={`py-2 pr-4 ${result.solved ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.solved ? 'Solved' : REASONS[result.reason] ?? 'Failed'}
                    </td>
                    <td
                      className={`py-2 pr-4 ${
                        length !== null && length === shortest ? 'font-semibold text-emerald-600' : ''
                      }`}
                    >
                      {length ?? '—'}
                    </td>
                    <td className="py-2 pr-4">{result.stats.generated.toLocaleString('en-US')}</td>
                    <td className="py-2 pr-4">{result.stats.expanded.toLocaleString('en-US')}</td>
                    <td className="py-2 pr-4">{result.stats.maxFrontier.toLocaleString('en-US')}</td>
                    <td className="py-2">{result.timeMs.toFixed(1)} ms</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}