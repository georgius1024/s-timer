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

const rehydrateFlatFlow = (flow) => {
  return flow.map((node, index) => {
    const base = index + 100
    return { ...node, id: base, parent: index > 0 ? base - 1 : null, next: base + 1 }
  })
}

function FlowButton({ id, caption, flow, onAbort }) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [passed, setPassed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [controller, setController] = useState(null)
  const start = () => {
    setShow(true)
  }

  const confirmStop = () => {
    if (window.confirm('Прекратить отсчет времени?')) {
      stop()
    }
  }

  const stop = () => {
    controller.terminate()
    if (onAbort && typeof onAbort === 'string') {
      shutUp()
      speak(onAbort)
    }
  }

  const pause = () => {
    setPaused((paused) => !paused)
  }

  useEffect(() => {
    if (paused) {
      controller && controller.pause()
    } else {
      controller && setImmediate(() => controller.run())
    }
  }, [paused, controller])

  useEffect(() => {
    if (controller) {
      controller.on('terminated', () => {
        // console.log('terminated')
        setShow(false)
      })
      controller.on('message', setMessage)
      controller.on('shutup', shutUp)
      controller.on('command', (command, next) => {
        speak(command).then(next)
      })
      controller.on('timer', ({ passed }) => {
        setPassed(passed)
      })
      controller.on('marker', (command) => {
        speak(command)
      })
    }
  }, [controller])

  useEffect(() => {
    if (show) {
      setMessage('')
      setPassed(0)
      setController(new Controller(rehydrateFlatFlow(flow)))
      setPaused(false)
    } else {
      setController(null)
    }
  }, [show, flow])

  return (
    <>
      <ModalPanel show={show} clickClose={false} onClose={confirmStop}>
        <div className="flow-control">
          <div className="display">{message}</div>
          <div className="display">{formatTime(passed)}</div>
          <button className={classNames('rigid-button pause-button', { active: paused })} onClick={pause}>
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
