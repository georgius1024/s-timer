import React, { useRef, useEffect } from 'react'
import './ModalPanel.scss'
import classNames from 'classnames'

export default function ModalPanel(props) {
  const sidebarRef = useRef(null)

  useEffect(() => {
    if (props.show) {
      sidebarRef.current && sidebarRef.current.focus()
    }
  }, [props.show])

  const checkClick = (event) => {
    if (!props.show) {
      return
    }

    if (props.clickClose === false) {
      return
    }

    const wrongKeys = [event.buttons !== 1, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey].filter(Boolean)
    if (wrongKeys.length) {
      return
    }
    const clickInside = sidebarRef.current?.contains(event.target)
    if (!clickInside) {
      props.onClose()
    }
  }

  const keyDown = (event) => {
    if (!props.show) {
      return
    }
    const wrongKeys = [event.key !== 'Escape', event.altKey, event.ctrlKey, event.metaKey, event.shiftKey].filter(
      Boolean
    )
    if (wrongKeys.length) {
      return
    }
    event.preventDefault()
    props.onClose()
  }

  useEffect(() => {
    if (props.show) {
      //sidebarRef.current?.focus()
    }
  }, [props.show])

  const closeControl = () => (
    <div role="button" className="close-control" onClick={props.onClose}>
      &times;
    </div>
  )

  return (
    <div className="modal-panel">
      <div className={classNames('background', { show: props.show })} onMouseDown={checkClick}>
        <div
          ref={sidebarRef}
          className={classNames('modal-panel', {
            close: props.closeControl !== false
          })}
          style={{ width: `${props.width || 600}px` }}
          tabIndex={-1}
          onKeyDown={keyDown}
        >
          {props.closeControl !== false && closeControl()}
          {props.children}
        </div>
      </div>
    </div>
  )
}
