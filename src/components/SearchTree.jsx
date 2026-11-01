import { useMemo, useState } from 'react'
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import AutoFit from './AutoFit.jsx'
import PuzzleNode from './PuzzleNode.jsx'
import { buildFlowGraph } from '../utils/treeLayout.js'

const nodeTypes = { puzzle: PuzzleNode }

const RENDER_CAPS = [100, 250, 500, 1000, 2000]

const MINIMAP_COLORS = {
  frontier: '#fbbf24',
  expanded: '#38bdf8',
  solution: '#10b981',
  pruned: '#fb7185',
}

const LEGEND = [
  ['Frontier', 'bg-amber-400'],
  ['Expanded', 'bg-sky-400'],
  ['Solution', 'bg-emerald-500'],
  ['Pruned (depth limit)', 'bg-rose-400'],
]

export default function SearchTree({ nodes, activeId }) {
  const [maxRendered, setMaxRendered] = useState(500)
  const [autoFit, setAutoFit] = useState(true)

  const graph = useMemo(
    () => buildFlowGraph(nodes, { maxRendered, activeId }),
    [nodes, maxRendered, activeId],
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Search tree
          </h2>
          <p className="text-xs text-slate-500">
            {nodes.length.toLocaleString('en-US')} nodes in tree
            {graph.hiddenCount > 0 &&
              `, showing ${graph.nodes.length.toLocaleString('en-US')} (solution path always shown)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <label className="flex items-center gap-1.5">
            Render up to
            <select
              value={maxRendered}
              onChange={(event) => setMaxRendered(Number(event.target.value))}
              className="rounded border border-slate-300 bg-white px-1.5 py-1"
            >
              {RENDER_CAPS.map((cap) => (
                <option key={cap} value={cap}>
                  {cap} nodes
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={autoFit}
              onChange={(event) => setAutoFit(event.target.checked)}
              className="accent-indigo-600"
            />
            Auto-fit
          </label>
        </div>
      </div>

      <div className="relative h-[560px]">
        {nodes.length === 0 && (
          <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-slate-400">
            Press Run or Step to grow the search tree.
          </p>
        )}
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          onlyRenderVisibleElements
          minZoom={0.03}
          maxZoom={1.5}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => MINIMAP_COLORS[node.data.status] ?? '#cbd5e1'}
          />
          <AutoFit enabled={autoFit} trigger={graph.nodes.length} />
        </ReactFlow>
      </div>

      <ul className="flex flex-wrap gap-4 border-t border-slate-200 px-4 py-2 text-xs text-slate-600">
        {LEGEND.map(([label, color]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}