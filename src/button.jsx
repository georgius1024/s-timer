import React, { useEffect, useState } from 'react'
import icon from './assets/volume-high.svg'
export default function Button({ track }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const audio = document.createElement('audio')
    audio.setAttribute('id', 'track_' + track)
    audio['style'].display = 'none'
    audio['controls'] = false
    audio['preload'] = true
    audio['src'] = require('./assets/audio/' + track + '.ogg')
    audio['muted'] = true
    document.body.appendChild(audio)
    audio['play']().catch(() => null)
    audio.addEventListener('ended', () => setPlaying(false))
    return () => {
      document.removeChild(audio)
    }
  }, [track])
  function handler() {
    const audio = document.getElementById('track_' + track)
    audio['muted'] = false
    audio['play']().catch(console.error)

    setPlaying(true)
  }
  const classes = 'voice-button ' + (playing ? 'playing' : 'muted')
  return (
    <button className={classes} onClick={handler}>
      Click me!
      <img className="icon" src={icon} alt="speaking now" />
    </button>
  )
}
