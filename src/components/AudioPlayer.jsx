export default function AudioPlayer({ src }) {
  if (!src) return null
  return (
    <audio
      src={src}
      controls
      className="w-full h-10 rounded-xl accent-primary-600"
      style={{ colorScheme: 'light dark' }}
    />
  )
}
