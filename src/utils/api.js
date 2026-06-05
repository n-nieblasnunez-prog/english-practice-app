import { convertToWav } from './audioUtils'

// Read key from env var or from runtime settings saved by the Settings page
function getRuntimeConfig() {
  try {
    return JSON.parse(localStorage.getItem('ep_settings') || '{}')
  } catch { return {} }
}
function key(envName, settingName) {
  return import.meta.env[envName] || getRuntimeConfig()[settingName] || ''
}

// ---------------------------------------------------------------------------
// Whisper transcription — called directly (OpenAI allows browser CORS)
// ---------------------------------------------------------------------------
export async function transcribeAudio(audioBlob) {
  const apiKey = key('VITE_OPENAI_API_KEY', 'openaiKey')
  if (!apiKey) throw new Error('Missing OpenAI API key — add it in Settings')

  const form = new FormData()
  form.append('file', audioBlob, 'recording.webm')
  form.append('model', 'whisper-1')
  form.append('language', 'en')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Whisper API error ${res.status}`)
  }
  const data = await res.json()
  return data.text || ''
}

// ---------------------------------------------------------------------------
// Claude grammar feedback — routed via /api/grammar Vercel proxy
// ---------------------------------------------------------------------------
const GRAMMAR_SYSTEM = `You are a warm, encouraging English language tutor helping a native Spanish speaker improve their English.
Analyze the text for grammar errors. Return ONLY a valid JSON object with this exact shape:
{
  "corrected": "the fully corrected sentence(s)",
  "score": <0-100 grammar quality score>,
  "errors": [
    {
      "type": "Verb Tense | Preposition | Article | Subject-Verb Agreement | Sentence Structure | Word Choice | Other",
      "original": "the wrong phrase",
      "correction": "the correct phrase",
      "explanation": "short, friendly explanation in simple English"
    }
  ],
  "encouragement": "one warm sentence praising what was done well"
}
If there are no errors return an empty errors array and a score of 100.`

export async function analyzeGrammar(text, mode = 'casual') {
  const modeNote = {
    casual:  'The user is practicing casual, everyday English.',
    formal:  'The user is practicing formal or academic English. Apply stricter grammar standards.',
    grammar: 'Focus exclusively on grammar accuracy. Be thorough and detailed.'
  }[mode] || ''

  // Use server-side proxy to avoid CORS issues
  const res = await fetch('/api/grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: GRAMMAR_SYSTEM,
      messages: [
        { role: 'user', content: `${modeNote}\n\nText to analyze:\n"${text}"` }
      ]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || err.error || `Grammar API error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text || '{}'
  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(clean)
  } catch {
    return { corrected: text, score: null, errors: [], encouragement: '' }
  }
}

// ---------------------------------------------------------------------------
// Azure Pronunciation Assessment — routed via /api/pronunciation Vercel proxy
// Converts audio to WAV PCM 16kHz first, then sends raw bytes to our proxy.
// ---------------------------------------------------------------------------
export async function assessPronunciation(audioBlob, referenceText) {
  // Convert to WAV PCM 16kHz mono (required by Azure)
  const wavBlob = await convertToWav(audioBlob)

  // Convert WAV to base64 in chunks to avoid call stack overflow on large buffers
  const wavBuffer = await wavBlob.arrayBuffer()
  const bytes = new Uint8Array(wavBuffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  const audioBase64 = btoa(binary)

  const res = await fetch('/api/pronunciation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, referenceText }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Pronunciation API error ${res.status}`)
  }

  const data = await res.json()
  const pa    = data.NBest?.[0]?.PronunciationAssessment
  const words = data.NBest?.[0]?.Words || []

  return {
    accuracyScore:     Math.round(pa?.AccuracyScore     ?? 0),
    fluencyScore:      Math.round(pa?.FluencyScore      ?? 0),
    completenessScore: Math.round(pa?.CompletenessScore ?? 0),
    overallScore:      Math.round(pa?.PronScore         ?? 0),
    words: words.map(w => ({
      word:     w.Word,
      accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 0),
      error:    w.PronunciationAssessment?.ErrorType ?? 'None',
    }))
  }
}
