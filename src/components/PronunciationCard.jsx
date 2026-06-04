import clsx from 'clsx'

function ScoreRing({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={clsx('text-2xl font-bold tabular-nums', color)}>{value ?? '—'}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</div>
    </div>
  )
}

function scoreColor(n) {
  if (n == null) return 'text-gray-400'
  if (n >= 80) return 'text-green-600 dark:text-green-400'
  if (n >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function wordBg(accuracy, error) {
  if (error !== 'None' && error != null) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 underline decoration-red-400'
  if (accuracy >= 80) return 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (accuracy >= 60) return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}

export default function PronunciationCard({ result }) {
  if (!result) return null
  const { overallScore, accuracyScore, fluencyScore, completenessScore, words } = result

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-slide-up">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
        Pronunciation Assessment
      </h2>

      {/* Score row */}
      <div className="grid grid-cols-4 gap-2 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
        <ScoreRing label="Overall"      value={overallScore}      color={scoreColor(overallScore)} />
        <ScoreRing label="Accuracy"     value={accuracyScore}     color={scoreColor(accuracyScore)} />
        <ScoreRing label="Fluency"      value={fluencyScore}      color={scoreColor(fluencyScore)} />
        <ScoreRing label="Complete"     value={completenessScore} color={scoreColor(completenessScore)} />
      </div>

      {/* Word-level highlighting */}
      {words.length > 0 && (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Word accuracy:</p>
          <div className="flex flex-wrap gap-1.5">
            {words.map((w, i) => (
              <span
                key={i}
                title={w.error !== 'None' ? `Error: ${w.error} — ${w.accuracy}%` : `${w.accuracy}%`}
                className={clsx('text-sm px-2 py-0.5 rounded-md font-medium cursor-default', wordBg(w.accuracy, w.error))}
              >
                {w.word}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Red/underlined words need attention. Tap a word to see its score.
          </p>
        </>
      )}
    </div>
  )
}
