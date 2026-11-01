const FAIL_MESSAGES = {
  'node-limit': 'Stopped: node limit reached.',
  'depth-limit': 'No solution within the depth limit.',
  exhausted: 'Search space exhausted: no solution.',
}

const STATUS_LABELS = {
  idle: 'Ready. Press Run or Step.',
  running: 'Running…',
  paused: 'Paused.',
}

function formatNumber(value) {
  return value.toLocaleString('en-US')
}

export default function Stats({ stats, path, outcome, status, depthLimit, iteration }) {
  const solved = outcome?.solved === true

  const items = [
    ['Generated', formatNumber(stats.generated)],
    ['Expanded', formatNumber(stats.expanded)],
    ['Max frontier', formatNumber(stats.maxFrontier)],
    ['Max depth', formatNumber(stats.maxDepth)],
    ['Solution length', solved ? `${path.length - 1} moves` : '—'],
  ]
  if (depthLimit !== null) {
    items.push(['IDS depth limit', depthLimit], ['IDS iteration', iteration])
  }

  let message = STATUS_LABELS[status]
  let tone = 'text-slate-600 bg-slate-100'
  if (status === 'done' && outcome) {
    if (solved) {
      message = `Solution found in ${path.length - 1} moves.`
      tone = 'text-emerald-700 bg-emerald-50'
    } else {
      message = FAIL_MESSAGES[outcome.reason] ?? 'Search failed.'
      tone = 'text-rose-700 bg-rose-50'
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Statistics
      </h2>

      <p className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${tone}`}>{message}</p>

      <dl className="grid grid-cols-2 gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-lg font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}