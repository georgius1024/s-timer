import React, { useState } from 'react'
import icon from './assets/volume-high.svg'
export default function RigidButton({ caption, active, onClick, onCancel, interval = 100, children }) {
  const [pressed, setPressed] = useState(false)
  function mouseDown() {
    if (active) {
      if (onCancel && typeof onCancel === 'function') {
        setPressed(false)
        onCancel()
      }
    } else {
      setPressed(true)
    }
    setTimeout(() => {
      setPressed(pressed => {
        if (pressed && onClick && typeof onClick === 'function') {
          onClick()
        }
        return false
      })
    }, interval)
  }
  function mouseOut() {
    setPressed(false)
  }
  function mouseUp() {
    setPressed(false)
  }
  const classes = ['rigid-button', active ? 'active' : 'inactive', pressed ? 'on-hold' : ''].join(' ')
  return (
    <button className={classes} onClick={onClick}>
      <div className="caption">{caption}</div>
      {active && children ? children : <img className="icon" src={icon} alt="speaking now" />}
    </button>
  )
}
