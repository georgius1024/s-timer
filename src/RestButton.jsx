import React, { useState, useEffect } from 'react'
import { speak, shutUp } from './speaker'

function leftPad(value) {
  if (value < 10) {
    return '0' + value
  } else {
    return value
  }
}
function RangingButton({ timeLimit = 3, interval = 100, onComplete, id }) {
  const [started, setStarted] = useState(0)
  const [onHold, setOnHold] = useState(false)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    if (!started) {
      return
    }
    const timer = setInterval(tick, 100)
    tick()
    function tick() {
      const span = Math.floor((new Date().valueOf() - started) / 1000)
      setSecs(span)
      if (span >= timeLimit) {
        setStarted(0)
        clearInterval(timer)
        speak('attention').then(() => {
          if (onComplete && typeof onComplete === 'function') {
            onComplete()
          }
        })
      }
    }
    return () => {
      clearInterval(timer)
    }
  }, [started, onComplete, timeLimit])

  function mouseDown() {
    if (started) {
      setStarted(0)
      shutUp()
    } else {
      setOnHold(true)
    }

    setTimeout(() => {
      setOnHold(onHold => {
        if (onHold) {
          shutUp()
          speak('rest')
          setStarted(new Date().valueOf())
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
  function canPlay() {
    shutUp()
    speak('rest')
    setStarted(new Date().valueOf())
  }

  const classes = ['voice-button', started ? 'playing' : 'muted', onHold ? 'on-hold' : ''].join(' ')

  return (
    <button
      id={id}
      className={classes}
      onMouseDown={mouseDown}
      onMouseOut={mouseOut}
      onMouseUp={mouseUp}
      onTouchStart={mouseDown}
      onTouchCancel={mouseOut}
      onTouchEnd={mouseUp}
      onDoubleClick={canPlay}
    >
      <div className="caption">Отдых</div>
      {started > 0 && <div className="indicator">{leftPad(secs)}</div>}
    </button>
  )
}
export default RangingButton
