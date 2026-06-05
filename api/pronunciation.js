// Vercel serverless function — uses Azure Speech SDK for full pronunciation assessment
// including Fluency and Completeness scores (not available via REST API alone).
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const azureKey = process.env.VITE_AZURE_SPEECH_KEY
  const region   = process.env.VITE_AZURE_SPEECH_REGION || 'centralus'

  if (!azureKey) return res.status(500).json({ error: 'Azure Speech key not configured' })

  try {
    const { audioBase64, referenceText } = req.body
    if (!audioBase64)    return res.status(400).json({ error: 'No audio data received' })
    if (!referenceText)  return res.status(400).json({ error: 'referenceText is required' })

    const audioBuffer = Buffer.from(audioBase64, 'base64')
    const truncatedRef = referenceText.slice(0, 400)

    // --- Azure Speech SDK setup ---
    const speechConfig = sdk.SpeechConfig.fromSubscription(azureKey, region)
    speechConfig.speechRecognitionLanguage = 'en-US'

    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      truncatedRef,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true   // enableMiscue
    )

    // Feed WAV bytes via push stream
    const pushStream = sdk.AudioInputStream.createPushStream()
    // Write in chunks to avoid memory issues
    const chunkSize = 32768
    for (let i = 0; i < audioBuffer.length; i += chunkSize) {
      pushStream.write(audioBuffer.slice(i, i + chunkSize))
    }
    pushStream.close()

    const audioConfig  = sdk.AudioConfig.fromStreamInput(pushStream)
    const recognizer   = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    pronunciationConfig.applyTo(recognizer)

    // Run recognition and collect result
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        r  => { recognizer.close(); resolve(r) },
        e  => { recognizer.close(); reject(new Error(e)) }
      )
    })

    if (result.reason === sdk.ResultReason.Canceled) {
      const cancellation = sdk.CancellationDetails.fromResult(result)
      throw new Error(`Recognition canceled: ${cancellation.errorDetails}`)
    }

    const pa    = sdk.PronunciationAssessmentResult.fromResult(result)
    const words = pa.detailResult?.Words || []

    console.log(`Pronunciation scores — Overall:${pa.pronunciationScore} Accuracy:${pa.accuracyScore} Fluency:${pa.fluencyScore} Completeness:${pa.completenessScore}`)

    return res.status(200).json({
      overallScore:      Math.round(pa.pronunciationScore  ?? 0),
      accuracyScore:     Math.round(pa.accuracyScore       ?? 0),
      fluencyScore:      Math.round(pa.fluencyScore        ?? 0),
      completenessScore: Math.round(pa.completenessScore   ?? 0),
      words: words.map(w => ({
        word:     w.Word,
        accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 0),
        error:    w.PronunciationAssessment?.ErrorType ?? 'None',
      }))
    })
  } catch (err) {
    console.error('Pronunciation error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}
