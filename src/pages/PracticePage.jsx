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
import { RotateCcw } from 'lucide-react'

export default function PracticePage() {
  const [mode, setMode] = useState('casual')
  const recorder = useRecorder()
  const practice = usePractice()

  const handleStopAndTranscribe = () => {
    // Pass a callback so we get the blob the moment onstop fires — no setTimeout race condition
    recorder.stopRecording(async (blob) => {
      await practice.transcribe(blob)
    })
  }

  const handleAnalyze = () => {
    // Use the ref so we always have the latest blob even across re-renders
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

      {/* Mode selector */}
      <ModeSelector mode={mode} onChange={setMode} />

      {/* Topic prompt */}
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
          {recorder.error && (
            <p className="text-sm text-red-500">{recorder.error}</p>
          )}
          {practice.error && (
            <p className="text-sm text-red-500">{practice.error}</p>
          )}
        </div>
      )}

      {/* After recording: show audio playback + transcript editor */}
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
