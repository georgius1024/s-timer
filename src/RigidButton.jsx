import React from 'react'
import icon from './assets/volume-high.svg'
export default function RigidButton({ caption, active, onClick, onCancel, interval = 100, children }) {
  function clickHandler() {
    if (active) {
      onCancel()
    } else {
      onClick()
    }
  }
  const classes = ['rigid-button', active ? 'active' : 'inactive'].join(' ')
  return (
    <button className={classes} onClick={clickHandler}>
      <div className="caption">{caption}</div>
      {active && children ? children : <img className="icon" src={icon} alt="speaking now" />}
    </button>
  )
}
