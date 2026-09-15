import { useState } from 'react'

const GAP = 2 // surface-coloured space between slices

// Part-to-whole with a few slices. Show a ChartLegend with the numbers next to it.
// Hovering or focusing a slice shows its value in the centre.
// segments: [{ key, label, value, color }]
function DonutChart({ segments, centerValue, centerLabel, size = 180, thickness = 18, ariaLabel }) {
  const [activeKey, setActiveKey] = useState(null)

  const center = size / 2
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  // Each slice starts where the previous one ended.
  const arcs = []
  let offset = 0
  for (const segment of segments) {
    if (segment.value > 0) {
      const length = (segment.value / total) * circumference
      arcs.push({ ...segment, length, offset })
      offset += length
    }
  }

  const active = arcs.find((arc) => arc.key === activeKey)

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="group" aria-label={ariaLabel}>
        {arcs.length === 0 && <circle className="donut-track" cx={center} cy={center} r={radius} strokeWidth={thickness} />}
        {arcs.map((arc) => {
          const visibleLength = arcs.length === 1 ? arc.length : Math.max(arc.length - GAP, 0.5)
          return (
            <circle
              key={arc.key}
              className={`donut-segment ${activeKey === arc.key ? 'is-active' : ''}`}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={thickness}
              style={{ stroke: arc.color }}
              strokeDasharray={`${visibleLength} ${circumference - visibleLength}`}
              strokeDashoffset={-arc.offset}
              transform={`rotate(-90 ${center} ${center})`}
              tabIndex={0}
              aria-label={`${arc.label}: ${arc.value}`}
              onPointerEnter={() => setActiveKey(arc.key)}
              onPointerLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(arc.key)}
              onBlur={() => setActiveKey(null)}
            />
          )
        })}
      </svg>
      <div className="donut-center" aria-live="polite">
        <strong>{active ? active.value : centerValue}</strong>
        <span>{active ? active.label : centerLabel}</span>
      </div>
    </div>
  )
}

export default DonutChart
