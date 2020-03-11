import React, { useState, useEffect } from 'react'
import { speak, shutUp } from './speaker'

function leftPad(value) {
  if (value < 10) {
    return '0' + value
  } else {
    return value
  }
}
const countdownStart = 3
function PhaseButton({ interval = 100, onComplete, id, caption }) {
  const [onHold, setOnHold] = useState(false)
  const [countdownIsStarted, setCountdownIsStarted] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [fireStarted, setFireStarted] = useState(0)
  const [fireTime, setFireTime] = useState(0)

  function minutes() {
    return Math.floor(fireTime / 60) % 60
  }
  function seconds() {
    return fireTime % 60
  }

  useEffect(() => {
    if (!countdownIsStarted) {
      return
    }
    function tick() {
      const time = countdownStart - Math.floor((new Date().valueOf() - countdownIsStarted) / 1000)
      setCountdown(time)
      if (time <= 0) {
        speak('fire')
        setCountdownIsStarted(0)
        setFireStarted(new Date().valueOf())
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [countdownIsStarted])

  useEffect(() => {
    if (!fireStarted) {
      return
    }
    function tick() {
      const time = Math.floor((new Date().valueOf() - fireStarted) / 1000)
      setFireTime(time)
      if (time > 5) {
        setFireStarted(0)
        speak('stop-fire-discharge').then(() => {
          if (onComplete && typeof onComplete === 'function') {
            onComplete()
          }
        })
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [fireStarted, onComplete])

  function mouseDown() {
    if (countdownIsStarted) {
      setCountdownIsStarted(0)
      shutUp()
    } else if (fireStarted) {
      speak('stop-fire-discharge')
      setFireStarted(0)
    } else {
      setOnHold(true)
    }

    setTimeout(() => {
      setOnHold(onHold => {
        if (onHold) {
          shutUp()
          speak('charge')
          setCountdownIsStarted(new Date().valueOf())
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
    speak('charge')
    setCountdownIsStarted(new Date().valueOf())
  }
  const classes = [
    'voice-button',
    countdownIsStarted || fireStarted ? 'playing' : 'muted',
    onHold ? 'on-hold' : ''
  ].join(' ')

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
      <div className="caption">{caption}</div>
      {countdownIsStarted > 0 && <div className="indicator">{countdown}</div>}

      {fireStarted > 0 && (
        <div className="indicator">
          {leftPad(minutes())}:{leftPad(seconds())}
        </div>
      )}
    </button>
  )
}
export default PhaseButton
