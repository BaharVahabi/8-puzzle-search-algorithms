import { FastForward, Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import IconButton from './IconButton.jsx'

export default function Controls({
  algorithms,
  algorithmId,
  onAlgorithmChange,
  status,
  onRun,
  onPause,
  onResume,
  onStep,
  onSkip,
  onReset,
  speeds,
  speedId,
  onSpeedChange,
  depthLimit,
  onDepthLimitChange,
}) {
  const currentSpeed = speeds.find((speed) => speed.id === speedId)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Controls
      </h2>

      <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Algorithm">
        {algorithms.map((algorithm) => (
          <button
            key={algorithm.id}
            type="button"
            title={algorithm.fullName}
            onClick={() => onAlgorithmChange(algorithm.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
              algorithm.id === algorithmId
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {algorithm.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {status === 'running' && (
          <IconButton icon={Pause} label="Pause" onClick={onPause} variant="primary" />
        )}
        {status === 'paused' && (
          <IconButton icon={Play} label="Resume" onClick={onResume} variant="primary" />
        )}
        {(status === 'idle' || status === 'done') && (
          <IconButton
            icon={Play}
            label={status === 'done' ? 'Run again' : 'Run'}
            onClick={onRun}
            variant="primary"
          />
        )}
        <IconButton icon={StepForward} label="Step" onClick={onStep} disabled={status === 'done'} />
        <IconButton icon={FastForward} label="Skip to end" onClick={onSkip} disabled={status === 'done'} />
        <IconButton icon={RotateCcw} label="Reset" onClick={onReset} disabled={status === 'idle'} />
      </div>

      <div className="mt-4">
        <label className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Speed</span>
          <span className="text-slate-700">{currentSpeed.label}</span>
        </label>
        <input
          type="range"
          min={speeds[0].id}
          max={speeds[speeds.length - 1].id}
          step={1}
          value={speedId}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="mt-1 w-full accent-indigo-600"
        />
      </div>

      {algorithmId === 'dfs' && (
        <div className="mt-4">
          <label className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>DFS depth limit</span>
            <input
              type="number"
              min={1}
              max={31}
              value={depthLimit}
              onChange={(event) =>
                onDepthLimitChange(Math.min(31, Math.max(1, Number(event.target.value) || 1)))
              }
              className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
            />
          </label>
        </div>
      )}
    </section>
  )
}