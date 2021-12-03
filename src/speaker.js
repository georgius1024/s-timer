const tracks = [
  '1m',
  '10s',
  '2m',
  'fire',
  'stop-fire-discharge',
  'charge',
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
    audio['pause']()
    audio['currentTime'] = 0
    audio.dispatchEvent(new Event('ended'))
  })
}
function speak(phrase) {
  return new Promise((resolve, reject) => {
    const audio = document.getElementById('track_' + phrase)
    audio['muted'] = false
    audio['play']().catch(reject)
    audio.addEventListener('ended', resolve, { once: true })
  })
}
function preload() {
  tracks.forEach((track) => {
    const audio = document.createElement('audio')
    audio.setAttribute('id', 'track_' + track)
    audio['style'].display = 'none'
    audio['controls'] = false
    audio['src'] = require('./assets/audio/' + track + '.ogg')
    audio['muted'] = true
    document.body.appendChild(audio)
    audio['play']().catch(() => null)
  })
}

preload()

export { speak, shutUp }
