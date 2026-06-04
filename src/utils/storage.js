const SESSIONS_KEY = 'ep_sessions'
const SETTINGS_KEY = 'ep_settings'

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveSession(session) {
  const sessions = getSessions()
  const entry = { ...session, id: Date.now(), date: new Date().toISOString() }
  sessions.unshift(entry)
  // Keep last 200 sessions
  if (sessions.length > 200) sessions.length = 200
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  return entry
}

export function deleteSession(id) {
  const sessions = getSessions().filter(s => s.id !== id)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getErrorStats(sessions) {
  const counts = {}
  sessions.forEach(s => {
    if (!s.grammarFeedback?.errors) return
    s.grammarFeedback.errors.forEach(e => {
      const type = e.type || 'Other'
      counts[type] = (counts[type] || 0) + 1
    })
  })
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

export function getPronunciationTrend(sessions) {
  return sessions
    .filter(s => s.pronunciationScore != null)
    .slice(0, 20)
    .reverse()
    .map((s, i) => ({
      session: i + 1,
      score: s.pronunciationScore,
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
}
