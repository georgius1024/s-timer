import React, { useState, useEffect } from 'react'
import RigidButton from './RigidButton'
import Header from './header'
import { shutUp, speak } from './speaker'

const countdownStart = 10
const restMaxTime = 30
const courseMaxTime = 150
const rangingMaxTime = 600

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

function setTitle(title, time) {
  if (title) {
    document.title = `${title} [${time}]`
  } else document.title = 'S-Timer'
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
    setTitle('')
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
      const time = Math.floor((now() - rangingStarted) / 1000)
      setRangingTime(time)
      setTitle('Пристрелка', leftPad(minutes(time)) + ':' + leftPad(seconds(time)))
      if (time >= rangingMaxTime) {
        stopRanging()
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [rangingStarted]) // eslint-disable-line

  function startRanging() {
    resetAll()
    speak('start-ranging')
    setRangingStarted(now())
  }

  function stopRanging() {
    resetAll()
    speak('stop-ranging')
  }

  useEffect(() => {
    if (!countdownStarted) {
      return
    }
    function tick() {
      const time = countdownStart - Math.floor((now() - countdownStarted) / 1000)
      setCountdownTime(time)
      setTitle('Приготовиться', time)
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
      if (courseNo === 1) {
        setTitle('Полусерия 1', leftPad(minutes(time)) + ':' + leftPad(seconds(time)))
      } else {
        setTitle('Полусерия 2', leftPad(minutes(time)) + ':' + leftPad(seconds(time)))
      }

      if (time === 60) {
        speak('1m')
      }
      if (time === 120) {
        speak('2m')
      }
      if (time === 140) {
        speak('10s')
      }
      if (time >= courseMaxTime) {
        clearInterval(timer)
        speak('stop-fire-discharge').then(() => {
          setCourseStarted(0)
          if (courseNo === 1) {
            speak('rest')
            setRestStarted(now())
          } else {
            resetAll()
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
    speak('charge')
    setCourseNo(1)
    setCountdownStarted(now())
  }

  function startSecondCourse() {
    resetAll()
    speak('charge')
    setCourseNo(2)
    setCountdownStarted(now())
  }

  function stopCourse() {
    resetAll()
    speak('stop-fire-discharge')
  }

  useEffect(() => {
    if (!restStarted) {
      return
    }
    function tick() {
      const time = Math.floor((now() - restStarted) / 1000)
      setRestTime(time)
      setTitle('Отдых', leftPad(minutes(time)) + ':' + leftPad(seconds(time)))
      if (time >= restMaxTime) {
        clearInterval(timer)
        speak('attention').then(() => {
          setRestStarted(0)
          speak('charge').then(() => {
            setCourseNo(2)
            setCountdownStarted(now())
          })
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
      setTrack(() => {
        speak(key).then(() => setTrack(''))
        return key
      })
    }
    function onCancel() {
      resetAll()
    }
    return <RigidButton key={key} active={key === track} caption={value} onClick={onClick} onCancel={onCancel} />
  })
  return (
    <div className="App">
      <Header />
      <div className="section">Отсчеты</div>

      <RigidButton active={rangingStarted} caption="Пристрелка" onClick={startRanging} onCancel={stopRanging}>
        <div className="indicator">
          {leftPad(minutes(rangingTime))}:{leftPad(seconds(rangingTime))}
        </div>
      </RigidButton>
      <RigidButton
        active={courseNo === 1 && (countdownStarted || courseStarted)}
        caption="Зачет: первая полусерия"
        onClick={startFirstCourse}
        onCancel={stopCourse}
      >
        {countdownStarted ? <div className="indicator">Приготовиться: {countdownTime}</div> : null}
        {courseStarted ? (
          <div className="indicator">
            {leftPad(minutes(courseTime))}:{leftPad(seconds(courseTime))}
          </div>
        ) : null}
      </RigidButton>
      <RigidButton active={restStarted} caption="Отдых" onClick={startRest} onCancel={stopRest}>
        <div className="indicator">
          {leftPad(minutes(restTime))}:{leftPad(seconds(restTime))}
        </div>
      </RigidButton>
      <RigidButton
        active={courseNo === 2 && (countdownStarted || courseStarted)}
        caption="Зачет: вторая полусерия"
        onClick={startSecondCourse}
        onCancel={stopCourse}
      >
        {countdownStarted ? <div className="indicator">Приготовиться: {countdownTime}</div> : null}
        {courseStarted ? (
          <div className="indicator">
            {leftPad(minutes(courseTime))}:{leftPad(seconds(courseTime))}
          </div>
        ) : null}
      </RigidButton>
      <div className="section">Команды</div>
      {trackButtons}
    </div>
  )
}

export default App
