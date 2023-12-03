import React, { useState, useEffect } from 'react'
import './FlowControl.scss'
import classNames from 'classnames'
import { speak, shutUp } from './speaker'
import ModalPanel from './ModalPanel'
import Controller from './Controller'

const leftPad = (value) => (value < 10 ? `0${value}` : value)

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 1000 / 60)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${leftPad(minutes)}:${leftPad(seconds)}`
}

function FlowButton({ id, caption, flow, onTerminate }) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [passed, setPassed] = useState(0)
  const [paused, setPaused] = useState(0)
  const [controller, setController] = useState(null)
  const rehydrateFlatFlow = (flow) => {
    return flow.map((node, index) => {
      const base = index + 100
      return { ...node, id: base, parent: index > 0 ? base - 1 : null, next: base + 1 }
    })
  }
  const testFlow = [
    {
      type: 'shutup'
    },
    {
      type: 'message',
      payload: 'Начало пристрелки'
    },
    {
      type: 'command',
      payload: 'start-ranging'
    },
    {
      type: 'delay',
      payload: 2000
    },
    {
      type: 'message',
      payload: 'Конец пристрелки'
    },
    {
      type: 'command',
      payload: 'stop-ranging'
    },
    {
      type: 'exit'
    }
  ]

  const start = () => {
    setController(new Controller(rehydrateFlatFlow(testFlow)))
    setShow(true)
  }

  const confirmStop = () => {
    if (window.confirm('Прекратить отсчет времени?')) {
      stop()
    }
  }
  const stop = () => {
    controller.terminate()
    setShow(false)
  }
  const pause = () => {
    setPaused((paused) => !paused)
  }
  useEffect(() => {
    if (paused) {
      controller && controller.pause()
    } else {
      controller && controller.run()
    }
  }, [paused])

  useEffect(() => {
    if (controller) {
      controller.on('terminated', () => {
        setTimeout(() => {
          shutUp()
          setShow(false)
          onTerminate && onTerminate()
        }, 200)
      })
      controller.on('message', setMessage)
      controller.on('shutup', shutUp)
      controller.on('command', speak)
      controller.on('timer', (status) => {
        setPassed(status.passed)
      })
      controller.run()
    }
  }, [controller])

  return (
    <>
      <ModalPanel show={show} clickClose={false} onClose={confirmStop}>
        <div className="flow-control">
          <div className="display">{message}</div>
          <div className="display">{formatTime(passed)}</div>
          <button className="rigid-button pause-button" onClick={pause}>
            {paused ? 'Продолжить' : 'Пауза'}
          </button>
        </div>
      </ModalPanel>
      <button id={id} className={classNames('rigid-button')} onClick={start}>
        <div className="caption">{caption}</div>
      </button>
    </>
  )
}
export default FlowButton
