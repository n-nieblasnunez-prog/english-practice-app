import { useState, useCallback } from 'react'
import { transcribeAudio, analyzeGrammar, assessPronunciation } from '../utils/api'
import { saveSession } from '../utils/storage'

export function usePractice() {
  const [step, setStep] = useState('idle') // idle | transcribing | reviewing | analyzing | done
  const [transcript, setTranscript] = useState('')
  const [grammarFeedback, setGrammarFeedback] = useState(null)
  const [pronunciationResult, setPronunciationResult] = useState(null)
  const [error, setError] = useState(null)

  const transcribe = useCallback(async (audioBlob) => {
    setError(null)
    setStep('transcribing')
    try {
      const text = await transcribeAudio(audioBlob)
      setTranscript(text)
      setStep('reviewing')
    } catch (err) {
      setError(err.message)
      setStep('idle')
    }
  }, [])

  const analyze = useCallback(async (text, audioBlob, mode) => {
    setError(null)
    setStep('analyzing')
    try {
      // Run grammar + pronunciation in parallel
      const [grammar, pronunciation] = await Promise.allSettled([
        analyzeGrammar(text, mode),
        (() => {
          try {
            const cfg = JSON.parse(localStorage.getItem('ep_settings') || '{}')
            const hasAzure = import.meta.env.VITE_AZURE_SPEECH_KEY || cfg.azureKey
            return hasAzure ? assessPronunciation(audioBlob, text) : Promise.resolve(null)
          } catch { return Promise.resolve(null) }
        })(),
      ])

      const gResult = grammar.status === 'fulfilled' ? grammar.value : null
      const pResult = pronunciation.status === 'fulfilled' ? pronunciation.value : null

      setGrammarFeedback(gResult)
      setPronunciationResult(pResult)

      // Persist session
      saveSession({
        transcript: text,
        mode,
        grammarFeedback: gResult,
        pronunciationScore: pResult?.overallScore ?? null,
        pronunciationWords: pResult?.words ?? [],
      })

      setStep('done')
    } catch (err) {
      setError(err.message)
      setStep('reviewing')
    }
  }, [])

  const reset = useCallback(() => {
    setStep('idle')
    setTranscript('')
    setGrammarFeedback(null)
    setPronunciationResult(null)
    setError(null)
  }, [])

  return { step, transcript, setTranscript, grammarFeedback, pronunciationResult, error, transcribe, analyze, reset }
}
