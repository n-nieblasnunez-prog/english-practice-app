import { Mic, Square } from 'lucide-react'
import clsx from 'clsx'

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RecordButton({ isRecording, onStart, onStop, duration, disabled }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        className={clsx(
          'relative w-24 h-24 rounded-full flex items-center justify-center',
          'text-white font-bold text-lg shadow-lg transition-all duration-200',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400',
          'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          isRecording
            ? 'bg-red-500 animate-pulse-ring'
            : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
        )}
      >
        {isRecording
          ? <Square size={32} fill="white" />
          : <Mic size={32} />
        }
      </button>

      {isRecording && (
        <span className="text-sm font-mono text-red-500 dark:text-red-400 tabular-nums animate-fade-in">
          {formatDuration(duration)}
        </span>
      )}

      {!isRecording && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Tap to record
        </span>
      )}
    </div>
  )
}
