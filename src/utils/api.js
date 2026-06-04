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
// Whisper transcription
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
// Claude grammar feedback
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
  const apiKey = key('VITE_ANTHROPIC_API_KEY', 'anthropicKey')
  if (!apiKey) throw new Error('Missing Anthropic API key — add it in Settings')

  const modeNote = {
    casual: 'The user is practicing casual, everyday English.',
    formal: 'The user is practicing formal or academic English. Apply stricter grammar standards.',
    grammar: 'Focus exclusively on grammar accuracy. Be thorough and detailed.'
  }[mode] || ''

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: GRAMMAR_SYSTEM,
      messages: [
        { role: 'user', content: `${modeNote}\n\nText to analyze:\n"${text}"` }
      ]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Claude API error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text || '{}'
  try {
    // Strip markdown fences if present
    const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(clean)
  } catch {
    return { corrected: text, score: null, errors: [], encouragement: '' }
  }
}

// ---------------------------------------------------------------------------
// Azure Pronunciation Assessment
// Azure requires the audio to be WAV; we do the conversion in the hook layer.
// This helper wraps the Azure REST pronunciation assessment endpoint.
// ---------------------------------------------------------------------------
export async function assessPronunciation(wavBlob, referenceText) {
  const cfg = getRuntimeConfig()
  const azKey = key('VITE_AZURE_SPEECH_KEY', 'azureKey')
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION || cfg.azureRegion || 'eastus'
  if (!azKey) throw new Error('Missing Azure Speech key — add it in Settings')

  // Build pronunciation assessment config (base64-encoded JSON)
  const config = btoa(JSON.stringify({
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Word',
    EnableMiscue: true,
  }))

  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': azKey,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Pronunciation-Assessment': config,
    },
    body: wavBlob,
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Azure Speech error ${res.status}: ${txt}`)
  }

  const data = await res.json()
  const pa = data.NBest?.[0]?.PronunciationAssessment
  const words = data.NBest?.[0]?.Words || []

  return {
    accuracyScore:      Math.round(pa?.AccuracyScore ?? 0),
    fluencyScore:       Math.round(pa?.FluencyScore ?? 0),
    completenessScore:  Math.round(pa?.CompletenessScore ?? 0),
    overallScore:       Math.round(pa?.PronScore ?? 0),
    words: words.map(w => ({
      word:     w.Word,
      accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 0),
      error:    w.PronunciationAssessment?.ErrorType ?? 'None',
    }))
  }
}
