// Vercel serverless function — proxies WAV audio to Azure Speech pronunciation assessment
// Receives: multipart form with fields: audio (wav blob), referenceText, region
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const azureKey = process.env.VITE_AZURE_SPEECH_KEY
  const region   = process.env.VITE_AZURE_SPEECH_REGION || 'eastus'
  if (!azureKey) return res.status(500).json({ error: 'Azure Speech key not configured on server' })

  try {
    // req.body is a Buffer of the raw WAV bytes sent from the client
    // referenceText and region are passed as query params
    const { referenceText } = req.query

    if (!referenceText) return res.status(400).json({ error: 'referenceText query param required' })

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
      body: req.body,
    })

    const text = await response.text()
    if (!response.ok) return res.status(response.status).json({ error: text })

    return res.status(200).json(JSON.parse(text))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}
