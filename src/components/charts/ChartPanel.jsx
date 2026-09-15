import { useState } from 'react'
import Panel from '../Panel'

// A panel with a chart and a "Chart / Table" switch.
// The table shows the same numbers, so nothing is only readable by hovering or by colour.
//   columns: [{ key: 'month', label: 'Month', numeric: false }]
//   rows:    [{ month: 'September 2026', total: 12 }]
function ChartPanel({ title, subtitle, actions, chart, columns, rows, isRefreshing = false, className = '' }) {
  const [view, setView] = useState('chart')

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      className={className}
      action={
        <div className="page-actions">
          {actions}
          <div className="view-toggle" role="group" aria-label={`Show ${title} as chart or table`}>
            <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
              Chart
            </button>
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
              Table
            </button>
          </div>
        </div>
      }
    >
      <div className={isRefreshing ? 'chart-refreshing' : undefined}>
        {view === 'chart' ? (
          chart
        ) : (
          <div className="table-wrapper table-flat">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className={column.numeric ? 'numeric' : undefined}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column) => (
                      <td key={column.key} className={column.numeric ? 'numeric' : undefined}>
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  )
}

export default ChartPanel
