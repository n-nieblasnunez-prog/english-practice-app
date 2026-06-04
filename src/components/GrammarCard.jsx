import clsx from 'clsx'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const ERROR_COLORS = {
  'Verb Tense':              'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'Preposition':             'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Article':                 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Subject-Verb Agreement':  'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'Sentence Structure':      'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'Word Choice':             'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'Other':                   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

function scoreColor(n) {
  if (n == null) return 'text-gray-400'
  if (n >= 90) return 'text-green-600 dark:text-green-400'
  if (n >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export default function GrammarCard({ feedback }) {
  if (!feedback) return null
  const { corrected, score, errors, encouragement } = feedback
  const hasErrors = errors?.length > 0

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Grammar Feedback
        </h2>
        {score != null && (
          <span className={clsx('text-2xl font-bold tabular-nums', scoreColor(score))}>
            {score}
          </span>
        )}
      </div>

      {/* Corrected version */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Corrected version</p>
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{corrected}</p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {hasErrors ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {errors.length} issue{errors.length > 1 ? 's' : ''} found:
          </p>
          {errors.map((e, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle size={13} className="text-amber-500 shrink-0" />
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', ERROR_COLORS[e.type] || ERROR_COLORS['Other'])}>
                  {e.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Original: </span>
                  <span className="font-medium text-red-600 dark:text-red-400 line-through">{e.original}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500">Fixed: </span>
                  <span className="font-medium text-green-600 dark:text-green-400">{e.correction}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{e.explanation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
          <CheckCircle2 size={16} />
          No grammar errors found!
        </div>
      )}

      {/* Encouragement */}
      {encouragement && (
        <p className="text-sm text-primary-600 dark:text-primary-400 italic border-l-2 border-primary-400 pl-3">
          {encouragement}
        </p>
      )}
    </div>
  )
}
