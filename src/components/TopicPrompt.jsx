import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import { getRandomTopic } from '../utils/topics'
import clsx from 'clsx'

const LEVEL_COLORS = {
  simple:       'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  advanced:     'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default function TopicPrompt() {
  const [current, setCurrent] = useState(null)

  const roll = () => setCurrent(getRandomTopic())

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Topic Prompt
        </span>
        <button
          onClick={roll}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full
                     bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300
                     hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          <Shuffle size={13} />
          New topic
        </button>
      </div>

      {current ? (
        <div className="animate-slide-up">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
            {current.topic}
          </p>
          <span className={clsx('inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize', LEVEL_COLORS[current.level])}>
            {current.level}
          </span>
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          Tap "New topic" for a conversation prompt
        </p>
      )}
    </div>
  )
}
