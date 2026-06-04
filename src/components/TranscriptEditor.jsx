import { CheckCircle2, RefreshCw } from 'lucide-react'

export default function TranscriptEditor({ transcript, onChange, onSubmit, onReset, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-slide-up">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        Transcription — review &amp; edit
      </h2>
      <textarea
        value={transcript}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className="w-full text-sm text-gray-800 dark:text-gray-100 bg-transparent
                   border border-gray-200 dark:border-gray-600 rounded-xl p-3 resize-none
                   focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
        placeholder="Your speech will appear here…"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full
                     text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw size={14} />
          Re-record
        </button>
        <button
          onClick={onSubmit}
          disabled={!transcript.trim() || loading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold
                     rounded-full bg-primary-600 dark:bg-primary-500 text-white
                     hover:bg-primary-700 dark:hover:bg-primary-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading
            ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            : <CheckCircle2 size={16} />
          }
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
    </div>
  )
}
