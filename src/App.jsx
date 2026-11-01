import { useMemo, useState } from 'react'
import { ALGORITHM_LIST } from './algorithms/index.js'
import { GOAL_STATE } from './utils/puzzle.js'
import { DEFAULT_DIFFICULTY, generatePuzzle } from './utils/difficulty.js'
import { SPEEDS, useSearchRunner } from './hooks/useSearchRunner.js'
import PuzzlePanel from './components/PuzzlePanel.jsx'
import Controls from './components/Controls.jsx'
import Stats from './components/Stats.jsx'
import SearchTree from './components/SearchTree.jsx'
import ComparisonTable from './components/ComparisonTable.jsx'
import SolutionPath from './components/SolutionPath.jsx'

const MAX_GENERATED = 200000

export default function App() {
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY)
  const [initialState, setInitialState] = useState(() => generatePuzzle(DEFAULT_DIFFICULTY))
  const [algorithmId, setAlgorithmId] = useState('bfs')
  const [dfsDepthLimit, setDfsDepthLimit] = useState(20)

  const options = useMemo(
    () => ({ depthLimit: dfsDepthLimit, maxGenerated: MAX_GENERATED }),
    [dfsDepthLimit],
  )

  const runner = useSearchRunner({ algorithmId, initialState, options })

  const handleAlgorithmChange = (id) => {
    runner.reset()
    setAlgorithmId(id)
  }

  const handleDepthLimitChange = (value) => {
    runner.reset()
    setDfsDepthLimit(value)
  }

  const handleNewPuzzle = (nextDifficulty = difficulty) => {
    runner.reset()
    setInitialState(generatePuzzle(nextDifficulty))
  }

  const handleDifficultyChange = (nextDifficulty) => {
    setDifficulty(nextDifficulty)
    handleNewPuzzle(nextDifficulty)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold">8-Puzzle Search Visualizer</h1>
        <p className="text-sm text-slate-500">
          Watch BFS, DFS and IDS build their search trees step by step.
        </p>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <PuzzlePanel
            initialState={initialState}
            goalState={GOAL_STATE}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            onNewPuzzle={() => handleNewPuzzle()}
          />
          <Controls
            algorithms={ALGORITHM_LIST}
            algorithmId={algorithmId}
            onAlgorithmChange={handleAlgorithmChange}
            status={runner.status}
            onRun={runner.run}
            onPause={runner.pause}
            onResume={runner.resume}
            onStep={runner.step}
            onSkip={runner.skipToEnd}
            onReset={runner.reset}
            speeds={SPEEDS}
            speedId={runner.speedId}
            onSpeedChange={runner.setSpeedId}
            depthLimit={dfsDepthLimit}
            onDepthLimitChange={handleDepthLimitChange}
          />
          <Stats
            stats={runner.stats}
            path={runner.path}
            outcome={runner.outcome}
            status={runner.status}
            depthLimit={runner.depthLimit}
            iteration={runner.iteration}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <SearchTree nodes={runner.nodes} activeId={runner.activeId} />
          <SolutionPath path={runner.path} />
          <ComparisonTable
            key={`${initialState.join('')}-${dfsDepthLimit}`}
            initialState={initialState}
            options={options}
          />
        </div>
      </main>
    </div>
  )
}