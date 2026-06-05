// Vercel serverless function — proxies pronunciation assessment to Azure Speech
// Audio is received as base64-encoded JSON to avoid binary streaming issues.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const azureKey = process.env.VITE_AZURE_SPEECH_KEY
  const region   = process.env.VITE_AZURE_SPEECH_REGION || 'centralus'

  if (!azureKey) return res.status(500).json({ error: 'Azure Speech key not configured on server' })

  try {
    const { audioBase64, referenceText } = req.body

    if (!audioBase64) return res.status(400).json({ error: 'No audio data received' })
    if (!referenceText) return res.status(400).json({ error: 'referenceText is required' })

    // Azure has a ~400 character limit for reference text
    const truncatedRef = referenceText.slice(0, 400)

    // Decode base64 audio back to binary Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    // Azure requires base64url encoding (RFC 4648) for the Pronunciation-Assessment header
    const configJson = JSON.stringify({
      ReferenceText: truncatedRef,
      GradingSystem: 'HundredMark',
      Granularity: 'Word',
      EnableMiscue: true,
    })
    // Standard base64 as required by Azure REST API
    const config = Buffer.from(configJson).toString('base64')
    // Verify WAV header
    const sampleRate    = audioBuffer.length >= 28 ? audioBuffer.readUInt32LE(24) : 0
    const bitsPerSample = audioBuffer.length >= 36 ? audioBuffer.readUInt16LE(34) : 0
    const channels      = audioBuffer.length >= 24 ? audioBuffer.readUInt16LE(22) : 0
    console.log(`WAV: ${sampleRate}Hz, ${bitsPerSample}bit, ${channels}ch, ${audioBuffer.length} bytes`)
    console.log('Reference text:', truncatedRef)
    console.log('Config JSON:', configJson)

    const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Pronunciation-Assessment': config,
      },
      body: audioBuffer,
    })

    const text = await response.text()
    if (!response.ok) return res.status(response.status).json({ error: text })

    const result = JSON.parse(text)
    const best = result.NBest?.[0] || {}
    console.log('Azure RecognitionStatus:', result.RecognitionStatus)
    console.log('Azure NBest[0] keys:', Object.keys(best).join(', '))
    console.log('Scores — PronScore:', best.PronScore, 'AccuracyScore:', best.AccuracyScore, 'FluencyScore:', best.FluencyScore)

    // Normalize response — Azure returns scores directly on NBest[0], not in a nested object
    const normalized = {
      RecognitionStatus: result.RecognitionStatus,
      NBest: [{
        PronunciationAssessment: {
          PronScore:          best.PronScore          ?? best.AccuracyScore ?? 0,
          AccuracyScore:      best.AccuracyScore      ?? 0,
          FluencyScore:       best.FluencyScore       ?? 0,
          CompletenessScore:  best.CompletenessScore  ?? 0,
        },
        Words: (best.Words || []).map(w => ({
          Word:  w.Word,
          PronunciationAssessment: {
            AccuracyScore: w.AccuracyScore ?? 0,
            ErrorType:     w.ErrorType    ?? 'None',
          }
        }))
      }]
    }

    return res.status(200).json(normalized)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Keep default body parser ON so req.body is parsed as JSON
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}
