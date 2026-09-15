import { useEffect } from 'react'

// A column title that is only there for screen readers (for example a hidden "Open") gives no label.
function readColumnTitle(headerCell) {
  const hiddenText = headerCell.querySelector('.sr-only')
  const text = headerCell.textContent.trim()
  return hiddenText && hiddenText.textContent.trim() === text ? '' : text
}

// Copies each column title into data-label on the cells below it.
function labelTables(root) {
  for (const table of root.querySelectorAll('.table-wrapper:not(.table-scroll) table')) {
    const titles = [...table.querySelectorAll('thead th')].map(readColumnTitle)
    for (const row of table.querySelectorAll('tbody tr')) {
      let column = 0
      for (const cell of row.children) {
        const title = titles[column] ?? ''
        if (cell.dataset.label !== title) {
          cell.dataset.label = title
        }
        column += cell.colSpan || 1
      }
    }
  }
}

// On phones every table row is shown as a small card (see base.css), so each value needs its
// column name next to it. This keeps the labels up to date when pages load or change their tables.
// Tables inside ".table-scroll" keep the normal layout and scroll sideways instead.
export function useStackedTableLabels(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return undefined
    }
    let frame = 0
    labelTables(root)
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => labelTables(root))
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [rootRef])
}
