import React, { useState, useEffect } from 'react'
import packageJson from '../package.json'
import RigidButton from './RigidButton'
import FlowButton from './FlowButton'
import Header from './header'
import { shutUp, speak, preloadAndUnlockAudio } from './speaker'
import rangingSequence from './flows/ranging.json'
import course1Sequence from './flows/course-1.json'
import course2Sequence from './flows/course-2.json'

const countdownStart = 30
const restMaxTime = 30
const courseMaxTime = 150

const version = packageJson.version
const storedVersion = localStorage.getItem('version')

const isNewVersion = storedVersion !== version

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
  const [locked, setLocked] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [track, setTrack] = useState('')
  const [countdownStarted, setCountdownStarted] = useState(0)
  const [countdownTime, setCountdownTime] = useState(0)
  const [courseStarted, setCourseStarted] = useState(0)
  const [courseTime, setCourseTime] = useState(0)
  const [courseNo, setCourseNo] = useState(0)

  const [intermediateRestStarted, setIntermediateRestStarted] = useState(0)
  const [intermediateRestTime, setIntermediateRestTime] = useState(0)

  const [finalRestStarted, setFinalRestStarted] = useState(0)
  const [finalRestTime, setFinalRestTime] = useState(0)

  function resetAll() {
    setTitle('')
    setTrack('')
    shutUp()
    setCountdownStarted(0)
    setIntermediateRestStarted(0)
    setFinalRestStarted(0)
    setCourseStarted(0)
    setCourseNo(0)
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
          speak('whistle')
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
        speak('whistle').then(
          speak('stop-fire-discharge').then(() => {
            setCourseStarted(0)
            if (courseNo === 1) {
              speak('rest')
              setIntermediateRestStarted(now())
            } else {
              speak('rest')
              setFinalRestStarted(now())
            }
          })
        )
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
    speak('prepare')
    setCourseNo(1)
    setCountdownStarted(now())
  }

  function startSecondCourse() {
    resetAll()
    speak('prepare')
    setCourseNo(2)
    setCountdownStarted(now())
  }

  function stopCourse() {
    resetAll()
    speak('stop-fire-discharge')
  }

  function unlock() {
    if (locked) {
      setUnlocking(true)
      preloadAndUnlockAudio().then(() => {
        setLocked(false)
        setUnlocking(false)
      })
    }
  }

  useEffect(() => {
    if (!intermediateRestStarted) {
      return
    }
    function tick() {
      const time = Math.floor((now() - intermediateRestStarted) / 1000)
      setIntermediateRestTime(time)
      setTitle('Отдых', leftPad(minutes(time)) + ':' + leftPad(seconds(time)))
      if (time >= restMaxTime) {
        clearInterval(timer)
        speak('attention').then(() => {
          setIntermediateRestStarted(0)
          speak('prepare').then(() => {
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
  }, [intermediateRestStarted, courseNo])
  useEffect(() => {
    if (!finalRestStarted) {
      return
    }
    function tick() {
      const time = Math.floor((now() - finalRestStarted) / 1000)
      setFinalRestTime(time)
      setTitle('Отдых', leftPad(minutes(time)) + ':' + leftPad(seconds(time)))
      if (time >= restMaxTime) {
        clearInterval(timer)
        speak('attention').then(() => {
          setFinalRestStarted(0)
        })
      }
    }
    const timer = setInterval(tick, 100)
    tick()
    return () => {
      clearInterval(timer)
    }
  }, [finalRestStarted, courseNo])

  function startRest() {
    resetAll()
    speak('rest')
    setIntermediateRestStarted(now())
  }
  function stopRest() {
    speak('attention')
    setIntermediateRestStarted(0)
  }

  function startFinalRest() {
    resetAll()
    speak('rest')
    setFinalRestStarted(now())
  }
  function stopFinalRest() {
    speak('attention')
    setFinalRestStarted(0)
  }

  const buttons = {
    'start-ranging': 'Огонь пристрелка',
    'stop-ranging': 'Стоп пристрелка',
    'move-on': 'Стрелки на линию огня!',
    prepare: 'Приготовиться к стрельбе!',
    fire: 'Огонь!',
    'stop-fire-discharge': 'Стоп огонь, разрядить оружие!',
    rest: 'Время отдыха',
    'safe-free': 'Рубеж свободен',
    'fill-up': 'Заправка воздухом',
    charge: 'Заряжай!'
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

  if (locked) {
    return (
      <div className="App" onMouseDown={unlock} onTouchStart={unlock}>
        <Header />
        <div className="locked">
          <h1>Аудио заблокировано</h1>
          <p>Нажмите на экран, чтобы разблокировать</p>
        </div>
      </div>
    )
  }

  if (unlocking) {
    return (
      <div className="App">
        <Header />
        <div className="locked">
          <h1>Разблокировка...</h1>
          <p>Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Header />
      <div className="row">
        <div className="column-1">
          <div className="section">Отсчеты</div>
          <FlowButton id="rng" flow={rangingSequence} caption={'Пристрелка'} onAbort={'stop-ranging'} />
          <FlowButton
            id="core"
            flow={course1Sequence}
            caption={'Две полусерии - первые'}
            onAbort={'stop-fire-discharge'}
          />
          <FlowButton id="core" flow={course2Sequence} caption={'Две полусерии'} onAbort={'stop-fire-discharge'} />
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
          <RigidButton
            active={intermediateRestStarted}
            caption="Отдых между полусериями"
            onClick={startRest}
            onCancel={stopRest}
          >
            <div className="indicator">
              {leftPad(minutes(intermediateRestTime))}:{leftPad(seconds(intermediateRestTime))}
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
          <RigidButton
            active={finalRestStarted}
            caption="Отдых после полной серии"
            onClick={startFinalRest}
            onCancel={stopFinalRest}
          >
            <div className="indicator">
              {leftPad(minutes(finalRestTime))}:{leftPad(seconds(finalRestTime))}
            </div>
          </RigidButton>
        </div>
        <div className="column-2">
          <div className="section">Команды</div>
          {trackButtons}
        </div>
      </div>
      {isNewVersion && (
        <div className="footer">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              if (navigator.serviceWorker?.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
              }
              localStorage.setItem('version', version)
              window.location.reload(true)
            }}
          >
            <span role="img" aria-label="refresh">
              🔁
            </span>{' '}
            Обновить
          </a>
        </div>
      )}
    </div>
  )
}

export default App
