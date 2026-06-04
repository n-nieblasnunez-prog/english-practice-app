import { useState, useEffect } from 'react'
import { getSettings, saveSettings, getSessions, deleteSession } from '../utils/storage'
import { Save, Trash2, Info } from 'lucide-react'

function Field({ label, id, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600
                   rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
      />
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    azureKey: '',
    azureRegion: 'eastus',
    ...getSettings()
  })
  const [saved, setSaved] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    setSessionCount(getSessions().length)
  }, [])

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = () => {
    // Persist to localStorage so the app picks them up as VITE_ env vars are not available
    // at runtime from user input — we mirror them into a runtime config object.
    saveSettings(settings)
    // Also set them on window for the api.js helpers to pick up at runtime
    window.__EP_CONFIG__ = settings
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearSessions = () => {
    if (!confirm('Delete all practice sessions? This cannot be undone.')) return
    getSessions().forEach(s => deleteSession(s.id))
    setSessionCount(0)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* API Keys */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">API Keys</h2>
          <Info size={14} className="text-gray-400" />
        </div>

        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <Info size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Keys entered here are stored in your browser's localStorage only. For production, set them as environment variables in Vercel instead.
          </p>
        </div>

        <Field
          label="OpenAI API Key (Whisper)"
          id="openaiKey"
          type="password"
          value={settings.openaiKey}
          onChange={set('openaiKey')}
          placeholder="sk-..."
          hint="Used for speech-to-text transcription"
        />
        <Field
          label="Anthropic API Key (Claude)"
          id="anthropicKey"
          type="password"
          value={settings.anthropicKey}
          onChange={set('anthropicKey')}
          placeholder="sk-ant-..."
          hint="Used for grammar and language feedback"
        />
        <Field
          label="Azure Speech Key"
          id="azureKey"
          type="password"
          value={settings.azureKey}
          onChange={set('azureKey')}
          placeholder="Your Azure key"
          hint="Optional — enables pronunciation scoring"
        />
        <Field
          label="Azure Region"
          id="azureRegion"
          value={settings.azureRegion}
          onChange={set('azureRegion')}
          placeholder="eastus"
          hint="e.g. eastus, westeurope"
        />

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                     bg-primary-600 dark:bg-primary-500 text-white text-sm font-semibold
                     hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Data</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {sessionCount} session{sessionCount !== 1 ? 's' : ''} stored locally on this device.
        </p>
        <button
          onClick={handleClearSessions}
          disabled={sessionCount === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl
                     text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800
                     hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={14} />
          Clear all sessions
        </button>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-1">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">About</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">English Practice App v1.0</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Powered by OpenAI Whisper · Claude · Azure Speech Services
        </p>
      </div>
    </div>
  )
}
