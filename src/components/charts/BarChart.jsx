import { useState } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import ChartLegend from './ChartLegend'
import { clampTooltipX, getLabelStep, getNiceTicks } from './chartUtils'

const HEIGHT = 240
const MARGIN = { top: 16, right: 12, bottom: 30, left: 40 }
const BAR_GAP = 2
const MAX_BAR_WIDTH = 24

// A column with a 4px rounded top and a square bottom on the baseline.
function roundedTopBar(x, y, width, height) {
  if (height <= 0) {
    return ''
  }
  const radius = Math.min(4, width / 2, height)
  return `M${x},${y + height} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + width - radius} Q${x + width},${y} ${x + width},${y + radius} V${y + height} Z`
}

// Grouped columns: several series side by side for each category (for example each week).
// categories: [{ label: '8 Sep', fullLabel: 'Week of 8 September 2026', values: { done: 4, doubts: 1 } }]
// series:     [{ key: 'done', label: 'Questions done', color: 'var(--series-1)' }]
function BarChart({ categories, series, ariaLabel }) {
  const [containerRef, width] = useElementWidth()
  const [active, setActive] = useState(null) // { categoryIndex, seriesKey }

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1)
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const maxValue = Math.max(0, ...categories.flatMap((category) => series.map((item) => category.values[item.key] ?? 0)))
  const ticks = getNiceTicks(maxValue)
  const maxTick = ticks[ticks.length - 1]

  const bandWidth = plotWidth / Math.max(categories.length, 1)
  const barWidth = Math.max(Math.min(MAX_BAR_WIDTH, (bandWidth * 0.7 - BAR_GAP * (series.length - 1)) / series.length), 2)
  const groupWidth = barWidth * series.length + BAR_GAP * (series.length - 1)
  const labelStep = getLabelStep(categories.length, plotWidth, 56)
  const yFor = (value) => MARGIN.top + plotHeight - (value / maxTick) * plotHeight
  const barX = (categoryIndex, seriesIndex) =>
    MARGIN.left + categoryIndex * bandWidth + (bandWidth - groupWidth) / 2 + seriesIndex * (barWidth + BAR_GAP)

  let tooltip = null
  if (active) {
    const category = categories[active.categoryIndex]
    const seriesIndex = series.findIndex((item) => item.key === active.seriesKey)
    const item = series[seriesIndex]
    const value = category.values[item.key] ?? 0
    tooltip = {
      left: clampTooltipX(barX(active.categoryIndex, seriesIndex) + barWidth / 2, width),
      top: yFor(value),
      category,
      item,
      value,
    }
  }

  return (
    <div>
      <ChartLegend shape="swatch" items={series.map((item) => ({ key: item.key, label: item.label, color: item.color }))} />
      <div className="chart-root" ref={containerRef}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="group" aria-label={ariaLabel}>
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

            {categories.map((category, categoryIndex) => (
              <g key={`${category.label}-${categoryIndex}`}>
                {series.map((item, seriesIndex) => {
                  const value = category.values[item.key] ?? 0
                  const x = barX(categoryIndex, seriesIndex)
                  const isActive = active?.categoryIndex === categoryIndex && active.seriesKey === item.key
                  const show = () => setActive({ categoryIndex, seriesKey: item.key })
                  return (
                    <g key={item.key}>
                      <path
                        className={`chart-bar ${active && !isActive ? 'is-dimmed' : ''}`}
                        d={roundedTopBar(x, yFor(value), barWidth, yFor(0) - yFor(value))}
                        style={{ fill: item.color }}
                      />
                      <rect
                        className="chart-bar-hit"
                        x={x - BAR_GAP / 2}
                        y={MARGIN.top}
                        width={barWidth + BAR_GAP}
                        height={plotHeight}
                        tabIndex={0}
                        aria-label={`${category.fullLabel ?? category.label}, ${item.label}: ${value}`}
                        onPointerEnter={show}
                        onPointerLeave={() => setActive(null)}
                        onFocus={show}
                        onBlur={() => setActive(null)}
                      />
                    </g>
                  )
                })}
                {(categories.length - 1 - categoryIndex) % labelStep === 0 && (
                  <text className="chart-axis-text" x={MARGIN.left + categoryIndex * bandWidth + bandWidth / 2} y={HEIGHT - 8} textAnchor="middle">
                    {category.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        )}

        {tooltip && (
          <div className="chart-tooltip" style={{ left: tooltip.left, top: tooltip.top }}>
            <div className="chart-tooltip-label">{tooltip.category.fullLabel ?? tooltip.category.label}</div>
            <div className="chart-tooltip-row">
              <span className="tooltip-key" style={{ background: tooltip.item.color }} />
              <strong>{tooltip.value}</strong> {tooltip.item.label}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BarChart
