import { useState, useRef, useCallback } from 'react'

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)

  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  // Store blob in a ref so it's accessible synchronously after stop
  const audioBlobRef = useRef(null)
  const onStopCallback = useRef(null)

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    chunks.current = []
    audioBlobRef.current = null

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 }
      })

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) || ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorder.current = recorder

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks.current, { type: recorder.mimeType || 'audio/webm' })
        audioBlobRef.current = blob
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        // Fire any registered callback with the blob directly
        if (onStopCallback.current) {
          onStopCallback.current(blob)
          onStopCallback.current = null
        }
      }

      recorder.start(250)
      setIsRecording(true)
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch (err) {
      setError(err.message || 'Microphone access denied')
    }
  }, [])

  // stopRecording accepts an optional callback that receives the blob once ready
  const stopRecording = useCallback((callback) => {
    if (callback) onStopCallback.current = callback
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
    }
    clearInterval(timerRef.current)
    setIsRecording(false)
  }, [])

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    audioBlobRef.current = null
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setError(null)
  }, [audioUrl])

  return { isRecording, audioBlob, audioBlobRef, audioUrl, duration, error, startRecording, stopRecording, reset }
}
