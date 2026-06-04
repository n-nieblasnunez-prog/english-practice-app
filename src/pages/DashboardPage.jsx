import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { getSessions, getErrorStats, getPronunciationTrend, deleteSession } from '../utils/storage'
import { Trash2, Mic, TrendingUp, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
      <Icon size={18} className={color} />
      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  )
}

const ERROR_BADGE = [
  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
]

export default function DashboardPage() {
  // Re-read on every render so deletes are reflected
  const sessions = useMemo(() => getSessions(), [])
  const errorStats = useMemo(() => getErrorStats(sessions), [sessions])
  const trend = useMemo(() => getPronunciationTrend(sessions), [sessions])

  const avgScore = useMemo(() => {
    const scored = sessions.filter(s => s.pronunciationScore != null)
    if (!scored.length) return null
    return Math.round(scored.reduce((a, b) => a + b.pronunciationScore, 0) / scored.length)
  }, [sessions])

  const handleDelete = (id) => {
    deleteSession(id)
    // Force re-render via simple page reload approach; in a real app use state
    window.location.reload()
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Progress</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Mic}         value={sessions.length}  label="Sessions"        color="text-primary-500" />
        <StatCard icon={TrendingUp}  value={avgScore ?? '—'}  label="Avg. pronunciation" color="text-green-500" />
        <StatCard icon={AlertCircle} value={errorStats.length} label="Error types seen" color="text-amber-500" />
      </div>

      {/* Pronunciation trend chart */}
      {trend.length >= 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Pronunciation Trend
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={v => [`${v}`, 'Score']}
              />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Common errors */}
      {errorStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Most Common Errors
          </h2>
          <div className="space-y-2">
            {errorStats.map((e, i) => (
              <div key={e.type} className="flex items-center gap-2">
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full min-w-fit', ERROR_BADGE[i % ERROR_BADGE.length])}>
                  {e.type}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (e.count / errorStats[0].count) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-6 text-right">{e.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Recent Sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">No sessions yet. Start practicing!</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sessions.slice(0, 30).map(s => (
              <div key={s.id} className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(s.date).toLocaleString()} · <span className="capitalize">{s.mode}</span>
                    {s.pronunciationScore != null && (
                      <> · <span className="font-semibold text-primary-600 dark:text-primary-400">{s.pronunciationScore} pts</span></>
                    )}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate mt-0.5">{s.transcript}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0"
                  aria-label="Delete session"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
