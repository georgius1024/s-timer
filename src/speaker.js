import audioData from '../src/audio_base64.json'

const tracks = [
  '1m',
  '10s',
  '2m',
  'fire',
  'start',
  'stop-fire-discharge',
  'charge',
  'prepare',
  'fill-up',
  'move-on',
  'rest',
  'safe-free',
  'start-ranging',
  'stop-ranging',
  'attention',
  'whistle'
]

function shutUp() {
  tracks.forEach((track) => {
    const audio = document.getElementById('track_' + track)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.dispatchEvent(new Event('ended'))
    }
  })
}

function speak(phrase) {
  return new Promise((resolve, reject) => {
    const audio = document.getElementById('track_' + phrase)
    if (!audio) return reject(new Error(`Track ${phrase} not found`))

    audio.muted = false
    audio.currentTime = 0
    audio
      .play()
      .then(() => {
        audio.addEventListener('ended', resolve, { once: true })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function preloadAndUnlockAudio() {
  return new Promise((resolve, reject) => {
    const promises = tracks.map((track) => {
      const audio = document.createElement('audio')
      audio.setAttribute('id', 'track_' + track)
      audio.style.display = 'none'
      audio.controls = false
      audio.preload = 'metadata'

      const sourceOgg = document.createElement('source')
      sourceOgg.src = audioData[track]?.ogg || ''
      sourceOgg.type = 'audio/ogg'

      const sourceMp3 = document.createElement('source')
      sourceMp3.src = audioData[track]?.mp3 || ''
      sourceMp3.type = 'audio/mpeg'

      audio.appendChild(sourceOgg)
      audio.appendChild(sourceMp3)
      document.body.appendChild(audio)
      return true
    })

    Promise.all(promises)
      .then(() => resolve())
      .catch((error) => reject(error))
  })
}

// Экспортируйте функции
export { speak, shutUp, preloadAndUnlockAudio }
