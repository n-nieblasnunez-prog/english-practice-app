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

    // Decode base64 audio back to binary Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    const config = Buffer.from(JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Word',
      EnableMiscue: true,
    })).toString('base64')

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

    return res.status(200).json(JSON.parse(text))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Keep default body parser ON so req.body is parsed as JSON
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}
