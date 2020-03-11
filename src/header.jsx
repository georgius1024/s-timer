import React from 'react'
import logo from './assets/logo.png'
function Header() {
  return (
    <div className="header">
      <img src={logo} alt="logo" />
      <div className="caption">Таймер</div>
    </div>
  )
}

export default Header
