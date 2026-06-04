// Vercel serverless function — proxies WAV audio to Azure Speech pronunciation assessment
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const azureKey = process.env.VITE_AZURE_SPEECH_KEY
  const region   = process.env.VITE_AZURE_SPEECH_REGION || 'centralus'
  if (!azureKey) return res.status(500).json({ error: 'Azure Speech key not configured on server' })

  try {
    const { referenceText } = req.query
    if (!referenceText) return res.status(400).json({ error: 'referenceText query param required' })

    // req.body is a Buffer when bodyParser is disabled
    const audioBuffer = req.body
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ error: 'No audio data received' })
    }

    const config = Buffer.from(JSON.stringify({
      ReferenceText: decodeURIComponent(referenceText),
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

// Disable default body parser so we get raw Buffer for binary audio data
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '5mb',
  }
}
