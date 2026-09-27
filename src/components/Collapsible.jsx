import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

// A section that stays closed until it is clicked open.
//
// Built on the browser's own <details>, so it works with the keyboard and with
// screen readers without any extra code.
//
//   title:       the heading shown on the closed row
//   subtitle:    small grey text under the title
//   meta:        anything shown on the right of the closed row (counts, a progress bar)
//   defaultOpen: start open (used on its own)
//   open:        start open AND stay controlled by the page (used with onOpenChange)
function Collapsible({
  title,
  subtitle,
  meta,
  defaultOpen = false,
  open,
  onOpenChange,
  id,
  tone = '',
  children,
}) {
  const [isOpenInside, setIsOpenInside] = useState(defaultOpen)
  // When the page passes `open`, the page decides. Otherwise we remember it ourselves.
  const isOpen = open ?? isOpenInside

  function handleToggle(event) {
    const next = event.currentTarget.open
    setIsOpenInside(next)
    onOpenChange?.(next)
  }

  return (
    <details id={id} className={`collapsible ${tone}`} open={isOpen} onToggle={handleToggle}>
      <summary className="collapsible-summary">
        <ChevronRight className="collapsible-chevron" size={18} aria-hidden="true" />
        <span className="collapsible-heading">
          <span className="collapsible-title">{title}</span>
          {subtitle && <span className="collapsible-subtitle">{subtitle}</span>}
        </span>
        {meta && <span className="collapsible-meta">{meta}</span>}
      </summary>
      <div className="collapsible-body">{children}</div>
    </details>
  )
}

export default Collapsible
