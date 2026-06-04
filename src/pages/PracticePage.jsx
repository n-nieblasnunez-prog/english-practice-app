import { useState } from 'react'
import RecordButton from '../components/RecordButton'
import ModeSelector from '../components/ModeSelector'
import TopicPrompt from '../components/TopicPrompt'
import TranscriptEditor from '../components/TranscriptEditor'
import GrammarCard from '../components/GrammarCard'
import PronunciationCard from '../components/PronunciationCard'
import AudioPlayer from '../components/AudioPlayer'
import { useRecorder } from '../hooks/useRecorder'
import { usePractice } from '../hooks/usePractice'
import { RotateCcw, AlertTriangle } from 'lucide-react'

export default function PracticePage() {
  const [mode, setMode] = useState('casual')
  const recorder = useRecorder()
  const practice = usePractice()

  const handleStopAndTranscribe = () => {
    recorder.stopRecording(async (blob) => {
      await practice.transcribe(blob)
    })
  }

  const handleAnalyze = () => {
    const blob = recorder.audioBlobRef.current || recorder.audioBlob
    practice.analyze(practice.transcript, blob, mode)
  }

  const handleReset = () => {
    recorder.reset()
    practice.reset()
  }

  const isAnalyzing = practice.step === 'analyzing'

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Practice</h1>

      <ModeSelector mode={mode} onChange={setMode} />
      <TopicPrompt />

      {/* Record area */}
      {(practice.step === 'idle' || recorder.isRecording) && (
        <div className="flex flex-col items-center py-6 gap-4">
          <RecordButton
            isRecording={recorder.isRecording}
            onStart={recorder.startRecording}
            onStop={handleStopAndTranscribe}
            duration={recorder.duration}
            disabled={practice.step === 'transcribing'}
          />
          {practice.step === 'transcribing' && (
            <p className="text-sm text-primary-600 dark:text-primary-400 animate-pulse">
              Transcribing audio…
            </p>
          )}
          {recorder.error && <p className="text-sm text-red-500">{recorder.error}</p>}
          {practice.error && <p className="text-sm text-red-500">{practice.error}</p>}
        </div>
      )}

      {/* Transcript editor */}
      {(practice.step === 'reviewing' || practice.step === 'analyzing') && (
        <>
          {recorder.audioUrl && <AudioPlayer src={recorder.audioUrl} />}
          <TranscriptEditor
            transcript={practice.transcript}
            onChange={practice.setTranscript}
            onSubmit={handleAnalyze}
            onReset={handleReset}
            loading={isAnalyzing}
          />
        </>
      )}

      {/* Results */}
      {practice.step === 'done' && (
        <>
          <GrammarCard feedback={practice.grammarFeedback} />
          <PronunciationCard result={practice.pronunciationResult} />

          {/* Show any API errors clearly */}
          {practice.apiErrors?.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <AlertTriangle size={15} />
                Some features had errors:
              </div>
              {practice.apiErrors.map((e, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-300 pl-5">{e}</p>
              ))}
            </div>
          )}

          <div className="text-center text-xs text-gray-400 dark:text-gray-500 pb-2">
            Original: <span className="italic">"{practice.transcript}"</span>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                       bg-primary-600 dark:bg-primary-500 text-white font-semibold text-sm
                       hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
          >
            <RotateCcw size={16} />
            Practice again
          </button>

          {practice.error && (
            <p className="text-sm text-red-500 text-center">{practice.error}</p>
          )}
        </>
      )}
    </div>
  )
}
