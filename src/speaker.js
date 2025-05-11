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

function preload() {
  tracks.forEach((track) => {
    const audio = document.createElement('audio')
    audio.setAttribute('id', 'track_' + track)
    audio.style.display = 'none'
    audio.controls = false

    const sourceOgg = document.createElement('source')
    sourceOgg.src = require('./assets/audio/' + track + '.ogg')
    sourceOgg.type = 'audio/ogg'

    const sourceMp3 = document.createElement('source')
    sourceMp3.src = require('./assets/audio/' + track + '.mp3')
    sourceMp3.type = 'audio/mpeg'

    audio.appendChild(sourceOgg)
    audio.appendChild(sourceMp3)
    document.body.appendChild(audio)
  })
}

function unlockAudio() {
  return new Promise((resolve, reject) => {
    const promises = tracks.map((track) => {
      const audio = document.getElementById('track_' + track)
      if (!audio) return Promise.resolve() // Пропускаем, если трек не найден

      return new Promise((res) => {
        audio.muted = true
        audio
          .play()
          .then(() => {
            audio.pause()
            audio.currentTime = 0
            audio.muted = false
            res()
          })
          .catch(() => res()) // Игнорируем ошибки, чтобы не прерывать остальные треки
      })
    })

    Promise.all(promises)
      .then(() => resolve())
      .catch((error) => reject(error))
  })
}

preload()

export { speak, shutUp, unlockAudio }
