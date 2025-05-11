import React, { useEffect, useState, useRef } from 'react'
import icon from './assets/volume-high.svg'
export default function Button({ track, caption }) {
  const [playing, setPlaying] = useState(false)
  const [onHold, setOnHold] = useState(false)
  const audio = useRef(track)
  useEffect(() => {
    audio.current['src'] = require('./assets/audio/' + track + '.ogg')
    audio.current['muted'] = true
    audio.current['play']().catch(() => null)
  }, [track])
  function play() {
    audio.current['muted'] = false
    audio.current['play']().catch(console.error)
    setPlaying(true)
  }
  function mousePressed() {
    setOnHold(true)
    setTimeout(() => {
      setOnHold((onHold) => {
        console.log(onHold)
        if (onHold) {
          play()
        }
        return false
      })
    }, 300)
  }
  function mouseOff() {
    setOnHold(false)
  }
  function ended() {
    setPlaying(false)
  }
  const classes = ['voice-button', playing ? 'playing' : 'muted', onHold ? 'on-hold' : ''].join(' ')
  return (
    <button className={classes} onMouseDown={mousePressed} onMouseOut={mouseOff} onMouseUp={mouseOff}>
      {caption}
      <img className="icon" src={icon} alt="speaking now" />
      <audio ref={audio} onEnded={ended} />
    </button>
  )
}
