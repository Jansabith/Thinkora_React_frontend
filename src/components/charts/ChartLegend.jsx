// A legend is always shown for two or more series, so colour is never the only way to tell them apart.
// items: [{ key, label, color, value (optional), detail (optional) }]
// shape: 'dot' (donut slices) or 'swatch' (bars)
function ChartLegend({ items, vertical = false, shape = 'dot' }) {
  return (
    <ul className={`chart-legend ${vertical ? 'chart-legend-vertical' : ''}`}>
      {items.map((item) => (
        <li key={item.key}>
          <span className="legend-label">
            <span className={shape === 'dot' ? 'legend-dot' : 'legend-swatch'} style={{ background: item.color }} />
            {item.label}
          </span>
          {item.value !== undefined && (
            <span className="legend-value">
              {item.value}
              {item.detail && <small>{item.detail}</small>}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default ChartLegend
