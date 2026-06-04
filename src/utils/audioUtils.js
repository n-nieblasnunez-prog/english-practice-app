/**
 * Converts any audio blob (webm, ogg, mp4) to 16-bit PCM WAV at 16 kHz
 * using the Web Audio API. Azure Speech requires this exact format.
 */
export async function convertToWav(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer()

  // Decode the compressed audio
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
  const decoded = await audioCtx.decodeAudioData(arrayBuffer)
  await audioCtx.close()

  // Mix down to mono at 16 kHz
  const numChannels = 1
  const sampleRate = 16000
  const numSamples = decoded.length
  const channelData = decoded.getChannelData(0) // use left/mono channel

  // Build WAV file in memory
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)      // file size - 8
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)                       // PCM chunk size
  view.setUint16(20, 1, true)                        // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // byte rate
  view.setUint16(32, numChannels * 2, true)          // block align
  view.setUint16(34, 16, true)                       // bits per sample
  writeString(36, 'data')
  view.setUint32(40, numSamples * 2, true)

  // Convert float32 samples to int16
  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}
