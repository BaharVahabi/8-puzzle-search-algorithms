const SIZES = {
  sm: { cell: 'h-6 w-6 text-xs', gap: 'gap-0.5' },
  md: { cell: 'h-12 w-12 text-xl', gap: 'gap-1' },
  lg: { cell: 'h-16 w-16 text-2xl', gap: 'gap-1.5' },
}

export default function Board({ state, size = 'md', className = '' }) {
  const { cell, gap } = SIZES[size]

  return (
    <div dir="ltr" className={`inline-grid grid-cols-3 ${gap} ${className}`}>
      {state.map((tile, index) => (
        <div
          key={index}
          className={`flex items-center justify-center rounded font-semibold ${cell} ${
            tile === 0 ? 'bg-slate-200' : 'bg-indigo-500 text-white'
          }`}
        >
          {tile === 0 ? '' : tile}
        </div>
      ))}
    </div>
  )
}