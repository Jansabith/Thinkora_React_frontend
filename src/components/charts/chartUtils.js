// Axis ticks at "nice" round numbers: 0, 50, 100, 150, 200.
// integer: true -> never a tick like 0.5 (for counts of people or questions).
export function getNiceTicks(maxValue, tickCount = 4, { integer = true } = {}) {
  if (maxValue <= 0) {
    return [0, 1]
  }
  const roughStep = maxValue / tickCount
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const residual = roughStep / magnitude
  let niceResidual = 1
  if (residual > 5) {
    niceResidual = 10
  } else if (residual > 2) {
    niceResidual = 5
  } else if (residual > 1) {
    niceResidual = 2
  }
  let step = niceResidual * magnitude
  if (integer) {
    step = Math.max(1, Math.round(step))
  }

  const ticks = []
  for (let value = 0; value < maxValue + step; value += step) {
    ticks.push(Math.round(value * 1000) / 1000)
    if (value >= maxValue) {
      break
    }
  }
  return ticks
}

// Show only every n-th x label when labels would overlap.
export function getLabelStep(labelCount, availableWidth, minimumGap = 44) {
  const fitting = Math.max(Math.floor(availableWidth / minimumGap), 1)
  return Math.max(Math.ceil(labelCount / fitting), 1)
}

// Keep a tooltip inside the chart: returns the x position of its centre.
export function clampTooltipX(x, width, halfTooltipWidth = 70) {
  return Math.min(Math.max(x, halfTooltipWidth), Math.max(width - halfTooltipWidth, halfTooltipWidth))
}
