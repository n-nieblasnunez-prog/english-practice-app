import { useState, useCallback } from 'react'
import { transcribeAudio, analyzeGrammar, assessPronunciation } from '../utils/api'
import { saveSession } from '../utils/storage'

export function usePractice() {
  const [step, setStep] = useState('idle') // idle | transcribing | reviewing | analyzing | done
  const [transcript, setTranscript] = useState('')
  const [grammarFeedback, setGrammarFeedback] = useState(null)
  const [pronunciationResult, setPronunciationResult] = useState(null)
  const [error, setError] = useState(null)
  const [apiErrors, setApiErrors] = useState([]) // visible per-API errors

  const transcribe = useCallback(async (audioBlob) => {
    setError(null)
    setApiErrors([])
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
    setApiErrors([])
    setStep('analyzing')
    try {
      const hasAzure = import.meta.env.VITE_AZURE_SPEECH_KEY ||
        (() => { try { return JSON.parse(localStorage.getItem('ep_settings') || '{}').azureKey } catch { return '' } })()

      const [grammar, pronunciation] = await Promise.allSettled([
        analyzeGrammar(text, mode),
        hasAzure ? assessPronunciation(audioBlob, text) : Promise.resolve(null),
      ])

      const errors = []
      const gResult = grammar.status === 'fulfilled' ? grammar.value : null
      const pResult = pronunciation.status === 'fulfilled' ? pronunciation.value : null

      if (grammar.status === 'rejected') errors.push(`Grammar: ${grammar.reason?.message || grammar.reason}`)
      if (pronunciation.status === 'rejected') errors.push(`Pronunciation: ${pronunciation.reason?.message || pronunciation.reason}`)

      setGrammarFeedback(gResult)
      setPronunciationResult(pResult)
      setApiErrors(errors)

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
    setApiErrors([])
  }, [])

  return { step, transcript, setTranscript, grammarFeedback, pronunciationResult, error, apiErrors, transcribe, analyze, reset }
}
