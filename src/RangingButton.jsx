import React, { useState, useEffect } from 'react'
import { speak, shutUp } from './speaker'

function leftPad(value) {
  if (value < 10) {
    return '0' + value
  } else {
    return value
  }
}

function RangingButton({ interval = 100 }) {
  const [started, setStarted] = useState(0)
  const [onHold, setOnHold] = useState(false)
  const [secs, setSecs] = useState(0)
  function minutes() {
    return Math.floor(secs / 60) % 60
  }
  function seconds() {
    return secs % 60
  }

  useEffect(() => {
    if (!started) {
      return
    }
    function tick() {
      const ms = new Date().valueOf() - started
      setSecs(Math.floor(ms / 1000))
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      setSecs(0)
      clearInterval(timer)
    }
  }, [started])

  function mouseDown() {
    if (started) {
      setStarted(0)
      shutUp()
      speak('stop-ranging')
    } else {
      setOnHold(true)
    }

    setTimeout(() => {
      setOnHold(onHold => {
        if (onHold) {
          shutUp()
          speak('start-ranging')
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
  const classes = ['voice-button', started ? 'playing' : 'muted', onHold ? 'on-hold' : ''].join(' ')

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
      <div className="caption">Пристрелка</div>
      {started > 0 && (
        <div className="indicator">
          {leftPad(minutes())}:{leftPad(seconds())}
        </div>
      )}
    </button>
  )
}
export default RangingButton
