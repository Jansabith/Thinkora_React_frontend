import { useId } from 'react'

// Colour sets for the illustration. Decorative only, so they are not theme tokens.
const PALETTES = {
  dawn: {
    sky: ['#c7d6ff', '#e6dcff', '#ffd9c8'],
    sun: '#fff3d6',
    far: ['#b4c1f0', '#d5c4ef'],
    mid: ['#7e8fd8', '#a189d6'],
    near: ['#3f4f9e', '#5a49a6'],
    trees: '#26306a',
    snow: '#ffffff',
  },
  dusk: {
    sky: ['#252c78', '#7a4fa8', '#f2a57b'],
    sun: '#ffd3a3',
    far: ['#6a5fb0', '#9a6fae'],
    mid: ['#43408f', '#5d4691'],
    near: ['#231f5c', '#2c2466'],
    trees: '#150f3d',
    snow: '#f4e8ff',
  },
  night: {
    sky: ['#0a1332', '#1c2466', '#4b3a8f'],
    sun: '#dbe4ff',
    far: ['#2d3a7a', '#3e3a86'],
    mid: ['#1d2660', '#262a6e'],
    near: ['#0e1440', '#131848'],
    trees: '#070b28',
    snow: '#c9d3ff',
  },
}

const STARS = [
  [60, 40, 1.4],
  [140, 90, 1],
  [220, 30, 1.6],
  [300, 70, 1.1],
  [380, 25, 1.3],
  [460, 60, 1],
  [640, 40, 1.5],
  [720, 95, 1.1],
  [760, 30, 1.2],
  [100, 150, 0.9],
  [690, 150, 1],
]

// [x position, height] of pine trees along the bottom
const TREES = [
  [20, 70], [55, 95], [90, 60], [130, 85], [170, 55], [215, 75], [610, 70], [650, 100],
  [690, 65], [725, 90], [760, 60], [795, 80], [330, 45], [470, 50],
]

// A decorative mountain landscape drawn with SVG, so no image files are needed.
// variant: 'dawn' (light), 'dusk' (purple sunset) or 'night' (with stars)
function MountainScene({ variant = 'dawn', stars = false }) {
  const id = useId().replace(/:/g, '')
  const colors = PALETTES[variant] ?? PALETTES.dawn
  const url = (name) => `url(#${id}-${name})`

  return (
    <svg viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.sky[0]} />
          <stop offset="55%" stopColor={colors.sky[1]} />
          <stop offset="100%" stopColor={colors.sky[2]} />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors.far[0]} />
          <stop offset="100%" stopColor={colors.far[1]} />
        </linearGradient>
        <linearGradient id={`${id}-mid`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors.mid[0]} />
          <stop offset="100%" stopColor={colors.mid[1]} />
        </linearGradient>
        <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.near[0]} />
          <stop offset="100%" stopColor={colors.near[1]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={colors.sun} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="480" fill={url('sky')} />
      <circle cx="560" cy="215" r="180" fill={url('glow')} />
      <circle cx="560" cy="215" r="44" fill={colors.sun} opacity="0.95" />

      {stars &&
        STARS.map(([x, y, radius]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={radius} fill="#ffffff" opacity="0.85" />)}

      <path
        d="M0 300 L90 230 L150 262 L240 170 L320 250 L400 196 L470 240 L560 150 L650 236 L730 190 L800 232 L800 480 L0 480 Z"
        fill={url('far')}
        opacity="0.9"
      />
      <path d="M240 170 L263 191 L251 188 L240 199 L228 187 L217 191 Z" fill={colors.snow} opacity="0.8" />
      <path d="M560 150 L589 177 L573 174 L560 187 L547 174 L531 178 Z" fill={colors.snow} opacity="0.85" />
      <path d="M730 190 L748 206 L738 205 L730 213 L721 205 L712 207 Z" fill={colors.snow} opacity="0.7" />

      <path
        d="M0 360 L110 280 L190 330 L300 240 L390 320 L470 270 L560 330 L660 250 L800 330 L800 480 L0 480 Z"
        fill={url('mid')}
      />
      <path d="M300 240 L327 263 L312 260 L300 273 L288 260 L273 264 Z" fill={colors.snow} opacity="0.7" />
      <path d="M660 250 L688 275 L672 272 L660 285 L648 272 L632 276 Z" fill={colors.snow} opacity="0.7" />
      <path d="M110 280 L130 296 L119 295 L110 303 L101 295 L90 297 Z" fill={colors.snow} opacity="0.6" />

      <path
        d="M0 410 C120 360 220 380 320 400 C430 420 520 360 640 370 C710 376 760 392 800 400 L800 480 L0 480 Z"
        fill={url('near')}
      />

      <g fill={colors.trees}>
        {TREES.map(([x, height]) => (
          <path key={x} d={`M${x - height * 0.32} 452 L${x} ${452 - height} L${x + height * 0.32} 452 Z`} />
        ))}
      </g>
      <rect y="448" width="800" height="32" fill={colors.trees} />
    </svg>
  )
}

export default MountainScene
