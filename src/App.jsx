import React, { useState, useEffect } from 'react'
import RangingButton from './RangingButton'
import PhaseButton from './PhaseButton'
import RestButton from './RestButton'
import RigidButton from './RigidButton'
import Header from './header'
import { shutUp, speak } from './speaker'

const countdownStart = 3

function leftPad(value) {
  if (value < 10) {
    return '0' + value
  } else {
    return value
  }
}
function minutes(secs) {
  return Math.floor(secs / 60) % 60
}
function seconds(secs) {
  return secs % 60
}

function now() {
  return new Date().valueOf()
}
function App() {
  const [track, setTrack] = useState('')
  const [rangingStarted, setRangingStarted] = useState(0)
  const [rangingTime, setRangingTime] = useState(0)
  const [countdownStarted, setCountdownStarted] = useState(0)
  const [countdownTime, setCountdownTime] = useState(0)
  const [courseStarted, setCourseStarted] = useState(0)
  const [courseTime, setCourseTime] = useState(0)
  const [courseNo, setCourseNo] = useState(0)

  const [restStarted, setRestStarted] = useState(0)
  const [restTime, setRestTime] = useState(0)

  function resetAll() {
    setTrack('')
    shutUp()
    setRangingStarted(0)
    setCountdownStarted(0)
    setRestStarted(0)
    setCourseStarted(0)
    setCourseNo(0)
  }

  useEffect(() => {
    if (!rangingStarted) {
      return
    }
    function tick() {
      const ms = now() - rangingStarted
      setRangingTime(Math.floor(ms / 1000))
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [rangingStarted])
  function startRanging() {
    resetAll()
    speak('start-ranging').then(() => {
      setRangingStarted(now())
    })
  }
  function stopRanging() {
    speak('stop-ranging').then(() => {
      setRangingStarted(0)
    })
  }

  useEffect(() => {
    if (!countdownStarted) {
      return
    }
    function tick() {
      const time = countdownStart - Math.floor((now() - countdownStarted) / 1000)
      setCountdownTime(time)
      if (time <= 0) {
        clearInterval(timer)
        speak('fire').then(() => {
          setCountdownStarted(0)
          setCourseStarted(now())
        })
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [countdownStarted])

  useEffect(() => {
    if (!courseStarted) {
      return
    }
    function tick() {
      const time = Math.floor((now() - courseStarted) / 1000)
      setCourseTime(time)
      if (time >= 5) {
        clearInterval(timer)
        speak('stop-fire-discharge').then(() => {
          setCourseStarted(0)
          if (courseNo === 1) {
            speak('rest').then(() => setRestStarted(now()))
          }
        })
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [courseStarted, courseNo])
  function startFirstCourse() {
    resetAll()
    speak('charge').then(() => {
      setCourseNo(1)
      setCountdownStarted(now())
    })
  }
  function startSecondCourse() {
    resetAll()
    speak('charge').then(() => {
      setCourseNo(2)
      setCountdownStarted(now())
    })
  }

  useEffect(() => {
    if (!restStarted) {
      return
    }
    function tick() {
      const time = Math.floor((now() - restStarted) / 1000)
      setRestTime(time)
      if (time >= 3) {
        clearInterval(timer)
        speak('attention').then(() => {
          setRestStarted(0)
          if (courseNo === 1) {
            speak('charge').then(() => {
              setCourseNo(2)
              setCountdownStarted(now())
            })
          }
        })
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [restStarted, courseNo])
  function startRest() {
    resetAll()
    speak('rest')
    setRestStarted(now())
  }
  function stopRest() {
    speak('attention')
    setRestStarted(0)
  }

  function rest() {
    const button = document.getElementById('rest-button')
    var event = new MouseEvent('dblclick', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    button.dispatchEvent(event)
  }
  function stage2() {
    const button = document.getElementById('stage2-button')
    var event = new MouseEvent('dblclick', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    button.dispatchEvent(event)
  }
  const buttons = {
    'start-ranging': 'Огонь пристрелка',
    'stop-ranging': 'Стоп пристрелка',
    'move-on': 'Стрелки на линию огня!',
    charge: 'Заряжай!',
    fire: 'Огонь!',
    'stop-fire-discharge': 'Стоп огонь, разрядить оружие!',
    rest: 'Время отдыха',
    'safe-free': 'Рубеж свободен',
    'fill-up': 'Заправка воздухом'
  }
  const trackButtons = Object.entries(buttons).map(([key, value]) => {
    function onClick() {
      resetAll()
      setTrack(key)
      speak(key).then(() => setTrack(''))
    }
    function onCancel() {
      resetAll()
    }
    return <RigidButton key={key} active={key === track} caption={value} onClick={onClick} onCancel={onCancel} />
  })
  return (
    <div className="App">
      <Header />

      <RigidButton active={rangingStarted} caption="Пристрелка" onClick={startRanging} onCancel={stopRanging}>
        <div className="indicator">
          {leftPad(minutes(rangingTime))}:{leftPad(seconds(rangingTime))}
        </div>
      </RigidButton>
      <RigidButton
        active={courseNo === 1 && (countdownStarted || courseStarted)}
        caption="Зачет: первая полусерия"
        onClick={startFirstCourse}
        onCancel={resetAll}
      >
        {countdownStarted ? <div className="indicator">Приготовиться: {countdownTime}</div> : null}
        {courseStarted ? (
          <div className="indicator">
            {leftPad(minutes(courseTime))}:{leftPad(seconds(courseTime))}
          </div>
        ) : null}
      </RigidButton>
      <RigidButton active={restStarted} caption="Отдых" onClick={startRest} onCancel={stopRest}>
        <div className="indicator">{restTime}</div>
      </RigidButton>
      <RigidButton
        active={courseNo === 2 && (countdownStarted || courseStarted)}
        caption="Зачет: вторая полусерия"
        onClick={startSecondCourse}
        onCancel={resetAll}
      >
        {countdownStarted ? <div className="indicator">Приготовиться: {countdownTime}</div> : null}
        {courseStarted ? (
          <div className="indicator">
            {leftPad(minutes(courseTime))}:{leftPad(seconds(courseTime))}
          </div>
        ) : null}
      </RigidButton>

      <RangingButton />
      <div className="section">Отсчет</div>
      <PhaseButton caption="Первая полусерия" id="stage1-button" onComplete={rest} />
      <RestButton id="rest-button" onComplete={stage2} />
      <PhaseButton caption="Вторая полусерия" id="stage2-button" />
      <div className="section">Команды</div>
      {trackButtons}
      {/*
      <SpeakerButton track="start-ranging" caption="Огонь пристрелка!" />
      <SpeakerButton track="stop-ranging" caption="Стоп пристрелка!" />
      <SpeakerButton track="move-on" caption="Стрелки на линию огня!" />
      <SpeakerButton track="charge" caption="Заряжай!" />
      <SpeakerButton track="fire" caption="Огонь!" />
      <SpeakerButton track="stop-fire-discharge" caption="Стоп огонь, разрядить оружие!" />
      <SpeakerButton track="rest" caption="Время отдыха!" />
      <SpeakerButton track="safe-free" caption="Рубеж свободен!" />
      <SpeakerButton track="fill-up" caption="Заправка воздухом!" />
      */}
    </div>
  )
}

export default App
