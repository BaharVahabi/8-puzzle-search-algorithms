const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
  neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
}

export default function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'neutral',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]}`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  )
}