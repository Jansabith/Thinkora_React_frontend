import { useState } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { clampTooltipX, getLabelStep, getNiceTicks } from './chartUtils'

const HEIGHT = 240
const MARGIN = { top: 16, right: 40, bottom: 30, left: 40 }
const SERIES_COLOR = 'var(--series-1)'

// One series over time: a 2px line with a light area wash, and the last value labelled.
// Hover, or focus the chart and use the arrow keys, to see a crosshair and the value of each point.
// points: [{ label: 'Sep', fullLabel: 'September 2026', value: 12 }]
function LineChart({ points, valueLabel, ariaLabel }) {
  const [containerRef, width] = useElementWidth()
  const [activeIndex, setActiveIndex] = useState(null)

  const lastIndex = points.length - 1
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1)
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const ticks = getNiceTicks(Math.max(0, ...points.map((point) => point.value)))
  const maxTick = ticks[ticks.length - 1]
  const labelStep = getLabelStep(points.length, plotWidth)

  const xFor = (index) => MARGIN.left + (lastIndex <= 0 ? plotWidth / 2 : (index / lastIndex) * plotWidth)
  const yFor = (value) => MARGIN.top + plotHeight - (value / maxTick) * plotHeight

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xFor(index)},${yFor(point.value)}`).join(' ')
  const areaPath = `${linePath} L${xFor(lastIndex)},${yFor(0)} L${xFor(0)},${yFor(0)} Z`

  function handlePointerMove(event) {
    const bounds = event.currentTarget.ownerSVGElement.getBoundingClientRect()
    const ratio = (event.clientX - bounds.left - MARGIN.left) / plotWidth
    // Snap to the nearest point: readers aim at a month, not at a 2px line.
    setActiveIndex(Math.min(Math.max(Math.round(ratio * lastIndex), 0), lastIndex))
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setActiveIndex((index) => Math.min((index ?? -1) + 1, lastIndex))
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setActiveIndex((index) => Math.max((index ?? lastIndex + 1) - 1, 0))
    } else if (event.key === 'Escape') {
      setActiveIndex(null)
    }
  }

  const active = activeIndex === null ? null : points[activeIndex]
  const last = points[lastIndex]

  return (
    <div
      className="chart-root"
      ref={containerRef}
      tabIndex={0}
      aria-label={`${ariaLabel}. Use the left and right arrow keys to read each value.`}
      onKeyDown={handleKeyDown}
      onBlur={() => setActiveIndex(null)}
    >
      {width > 0 && points.length > 0 && (
        <svg width={width} height={HEIGHT} aria-hidden="true">
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className={tick === 0 ? 'chart-baseline' : 'chart-grid'}
                x1={MARGIN.left}
                x2={MARGIN.left + plotWidth}
                y1={yFor(tick)}
                y2={yFor(tick)}
              />
              <text className="chart-axis-text" x={MARGIN.left - 10} y={yFor(tick)} dy="0.32em" textAnchor="end">
                {tick}
              </text>
            </g>
          ))}

          {points.map(
            (point, index) =>
              (lastIndex - index) % labelStep === 0 && (
                <text key={`${point.label}-${index}`} className="chart-axis-text" x={xFor(index)} y={HEIGHT - 8} textAnchor="middle">
                  {point.label}
                </text>
              ),
          )}

          <path className="chart-area" d={areaPath} />
          <path className="chart-line" d={linePath} />

          {active ? (
            <>
              <line className="chart-crosshair" x1={xFor(activeIndex)} x2={xFor(activeIndex)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
              <circle className="chart-dot" cx={xFor(activeIndex)} cy={yFor(active.value)} r="5" style={{ fill: SERIES_COLOR }} />
            </>
          ) : (
            <>
              <circle className="chart-dot" cx={xFor(lastIndex)} cy={yFor(last.value)} r="4.5" style={{ fill: SERIES_COLOR }} />
              <text className="chart-end-label" x={xFor(lastIndex) + 9} y={yFor(last.value)} dy="0.32em">
                {last.value}
              </text>
            </>
          )}

          <rect
            className="chart-hit-area"
            x={MARGIN.left - 16}
            y={MARGIN.top}
            width={plotWidth + 32}
            height={plotHeight}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActiveIndex(null)}
          />
        </svg>
      )}

      {active && (
        <div className="chart-tooltip" style={{ left: clampTooltipX(xFor(activeIndex), width), top: yFor(active.value) }} aria-live="polite">
          <div className="chart-tooltip-label">{active.fullLabel ?? active.label}</div>
          <div className="chart-tooltip-row">
            <span className="tooltip-key" style={{ background: SERIES_COLOR }} />
            <strong>{active.value}</strong> {valueLabel}
          </div>
        </div>
      )}
    </div>
  )
}

export default LineChart
