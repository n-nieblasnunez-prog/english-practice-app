// Temporary debug endpoint — tests Azure Speech connection
export default async function handler(req, res) {
  const azureKey = process.env.VITE_AZURE_SPEECH_KEY
  const region   = process.env.VITE_AZURE_SPEECH_REGION || 'centralus'

  if (!azureKey) return res.status(200).json({ error: 'No Azure key found', envKeys: Object.keys(process.env).filter(k => k.includes('AZURE')) })

  // Send a tiny silent WAV (44-byte header, no samples) just to test connectivity
  const wavHeader = Buffer.alloc(44)
  wavHeader.write('RIFF', 0); wavHeader.writeUInt32LE(36, 4)
  wavHeader.write('WAVE', 8); wavHeader.write('fmt ', 12)
  wavHeader.writeUInt32LE(16, 16); wavHeader.writeUInt16LE(1, 20)
  wavHeader.writeUInt16LE(1, 22); wavHeader.writeUInt32LE(16000, 24)
  wavHeader.writeUInt32LE(32000, 28); wavHeader.writeUInt16LE(2, 32)
  wavHeader.writeUInt16LE(16, 34); wavHeader.write('data', 36)
  wavHeader.writeUInt32LE(0, 40)

  const config = Buffer.from(JSON.stringify({
    ReferenceText: 'hello',
    GradingSystem: 'HundredMark',
    Granularity: 'Word',
    EnableMiscue: true,
  })).toString('base64')

  try {
    const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Pronunciation-Assessment': config,
      },
      body: wavHeader,
    })
    const text = await response.text()
    return res.status(200).json({
      azureStatus: response.status,
      azureRegion: region,
      keyPrefix: azureKey.slice(0, 8) + '...',
      azureResponse: text
    })
  } catch (err) {
    return res.status(200).json({ fetchError: err.message })
  }
}
