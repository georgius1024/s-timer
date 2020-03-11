import React, { useState } from 'react'
import { speak, shutUp } from './speaker'
import icon from './assets/volume-high.svg'
export default function Button({ track, caption, interval = 300 }) {
  const [playing, setPlaying] = useState(false)
  const [onHold, setOnHold] = useState(false)
  function play() {
    setPlaying(true)
    shutUp()
    speak(track).then(() => setPlaying(false))
  }
  function mouseDown() {
    setOnHold(true)
    if (playing) {
      shutUp()
    }
    setTimeout(() => {
      setOnHold(onHold => {
        if (onHold) {
          play()
        }
        return false
      })
    }, interval)
  }
  function mouseOut() {
    setOnHold(false)
  }
  function mouseUp() {
    setOnHold(false)
  }
  const classes = ['voice-button', playing ? 'playing' : 'muted', onHold ? 'on-hold' : ''].join(' ')
  return (
    <button
      className={classes}
      onMouseDown={mouseDown}
      onMouseOut={mouseOut}
      onMouseUp={mouseUp}
      onTouchStart={mouseDown}
      onTouchCancel={mouseOut}
      onTouchEnd={mouseUp}
    >
      {caption}
      <img className="icon" src={icon} alt="speaking now" />
    </button>
  )
}
