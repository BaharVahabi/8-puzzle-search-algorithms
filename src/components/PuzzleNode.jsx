import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import Board from './Board.jsx'

const STATUS_STYLES = {
  frontier: 'border-amber-400 bg-amber-50',
  expanded: 'border-sky-400 bg-sky-50',
  solution: 'border-emerald-500 bg-emerald-100',
  pruned: 'border-dashed border-rose-400 bg-rose-50',
}

const MOVE_SYMBOLS = { Up: '↑', Down: '↓', Left: '←', Right: '→' }

const handleStyle = { width: 6, height: 6, border: 0, background: '#94a3b8' }

function PuzzleNode({ data }) {
  const statusStyle = STATUS_STYLES[data.status] ?? STATUS_STYLES.frontier
  const ring = data.isActive ? 'ring-4 ring-indigo-400' : ''

  return (
    <div
      className={`flex h-28 w-24 flex-col items-center justify-between rounded-lg border-2 p-1.5 ${statusStyle} ${ring}`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} style={handleStyle} />
      <div className="flex w-full justify-between text-[10px] font-semibold leading-4 text-slate-600">
        <span>{data.move ? MOVE_SYMBOLS[data.move] : 'Start'}</span>
        <span>d{data.depth}</span>
      </div>
      <Board state={data.state} size="sm" />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={handleStyle} />
    </div>
  )
}

export default memo(PuzzleNode)