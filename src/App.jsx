import { useEffect, useState } from 'react'
import { sample, without } from 'lodash'
import screenfull from 'screenfull'
import { FaHandPaper, FaExpand, FaCompress, FaPlus, FaMinus } from 'react-icons/fa'
import { GiFootprint } from 'react-icons/gi'

const COLORS = [
  { name: 'Red', bg: '#e3242b', fg: '#ffffff' },
  { name: 'Blue', bg: '#1f5bd8', fg: '#ffffff' },
  { name: 'Yellow', bg: '#ffd400', fg: '#1a1a1a' },
  { name: 'Green', bg: '#1aa34a', fg: '#ffffff' },
]

const LIMBS = [
  { id: 'leftHand', side: 'Left', part: 'Hand' },
  { id: 'rightHand', side: 'Right', part: 'Hand' },
  { id: 'leftFoot', side: 'Left', part: 'Foot' },
  { id: 'rightFoot', side: 'Right', part: 'Foot' },
]

const MIN_SECONDS = 1
const MAX_SECONDS = 30
const STEP_SECONDS = 0.5

function spin(state) {
  const limb = sample(without(LIMBS, state.current?.limb))
  const color = sample(without(COLORS, state.positions[limb.id], state.current?.color))
  return {
    current: { limb, color },
    positions: { ...state.positions, [limb.id]: color },
    count: state.count + 1,
  }
}

const initialState = () => spin({ positions: {}, count: 0 })

function LimbIcon({ limb }) {
  const Icon = limb.part === 'Hand' ? FaHandPaper : GiFootprint
  // The hand icon is drawn as a right hand and the footprint as a left foot;
  // mirror whichever one doesn't match the called side.
  const baseSide = limb.part === 'Hand' ? 'Right' : 'Left'
  const flip = limb.side !== baseSide ? 'scaleX(-1)' : undefined
  return <Icon className="limb-icon" style={{ transform: flip }} />
}

export default function App() {
  const [state, setState] = useState(initialState)
  const [seconds, setSeconds] = useState(3)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setState(spin), seconds * 1000)
    return () => clearInterval(id)
  }, [seconds])

  useEffect(() => {
    if (!screenfull.isEnabled) return
    const onChange = () => setIsFullscreen(screenfull.isFullscreen)
    screenfull.on('change', onChange)
    return () => screenfull.off('change', onChange)
  }, [])

  const { limb, color } = state.current

  useEffect(() => {
    document.body.style.backgroundColor = color.bg
    document.body.style.color = color.fg
  }, [color])

  return (
    <main className="app">
      {screenfull.isEnabled && (
        <button
          className="fullscreen-btn"
          onClick={() => screenfull.toggle()}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      )}

      {/* key forces the pop animation to replay on every spin */}
      <section className="call" key={state.count}>
        <div className="side">{limb.side}</div>
        <LimbIcon limb={limb} />
        <div className="part">
          {limb.part} on {color.name}
        </div>
      </section>

      <footer className="controls">
        <button
          onClick={() => setSeconds((s) => Math.max(MIN_SECONDS, s - STEP_SECONDS))}
          disabled={seconds <= MIN_SECONDS}
          aria-label="Decrease interval"
        >
          <FaMinus />
        </button>
        <span className="seconds">{seconds}s</span>
        <button
          onClick={() => setSeconds((s) => Math.min(MAX_SECONDS, s + STEP_SECONDS))}
          disabled={seconds >= MAX_SECONDS}
          aria-label="Increase interval"
        >
          <FaPlus />
        </button>
      </footer>

      <ul className="positions">
        {LIMBS.map((l) => (
          <li key={l.id}>
            <span
              className="swatch"
              style={{ backgroundColor: state.positions[l.id]?.bg ?? 'transparent' }}
            />
            {l.side} {l.part}
          </li>
        ))}
      </ul>
    </main>
  )
}
