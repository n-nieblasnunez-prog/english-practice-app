/**
 * Converts any audio blob to 16-bit PCM WAV at exactly 16 kHz mono.
 * Resamples manually if the browser's AudioContext doesn't honour 16 kHz.
 */
export async function convertToWav(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer()

  // Decode at whatever rate the browser gives us
  const decodeCtx = new (window.AudioContext || window.webkitAudioContext)()
  const decoded = await decodeCtx.decodeAudioData(arrayBuffer)
  await decodeCtx.close()

  const TARGET_RATE = 16000
  let samples

  if (decoded.sampleRate === TARGET_RATE) {
    // Already at target rate — just grab channel 0
    samples = decoded.getChannelData(0)
  } else {
    // Resample using OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(
      1,                                                        // mono
      Math.ceil(decoded.duration * TARGET_RATE),               // output length
      TARGET_RATE
    )
    const source = offlineCtx.createBufferSource()
    source.buffer = decoded
    source.connect(offlineCtx.destination)
    source.start(0)
    const resampled = await offlineCtx.startRendering()
    samples = resampled.getChannelData(0)
  }

  console.log(`WAV conversion: ${decoded.sampleRate}Hz → ${TARGET_RATE}Hz, ${samples.length} samples`)

  // Build WAV file
  const numSamples = samples.length
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4,  36 + numSamples * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16,           true) // PCM chunk size
  view.setUint16(20, 1,            true) // PCM format
  view.setUint16(22, 1,            true) // mono
  view.setUint32(24, TARGET_RATE,  true) // sample rate
  view.setUint32(28, TARGET_RATE * 2, true) // byte rate
  view.setUint16(32, 2,            true) // block align
  view.setUint16(34, 16,           true) // bits per sample
  writeStr(36, 'data')
  view.setUint32(40, numSamples * 2, true)

  // Float32 → Int16
  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}
