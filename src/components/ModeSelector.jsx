import clsx from 'clsx'

const MODES = [
  { id: 'casual',  label: 'Casual',  desc: 'Everyday English' },
  { id: 'formal',  label: 'Formal',  desc: 'Academic / Work' },
  { id: 'grammar', label: 'Grammar', desc: 'Deep corrections' },
]

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={clsx(
            'flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl text-xs font-medium border transition-all',
            mode === m.id
              ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500 shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400'
          )}
        >
          <span className="font-semibold">{m.label}</span>
          <span className={clsx('font-normal', mode === m.id ? 'text-primary-100' : 'text-gray-400 dark:text-gray-500')}>
            {m.desc}
          </span>
        </button>
      ))}
    </div>
  )
}
