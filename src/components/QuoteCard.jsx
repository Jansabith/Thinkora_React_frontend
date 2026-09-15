import { useEffect, useState } from 'react'
import { QUOTES } from '../utils/brand'
import MountainScene from './MountainScene'

// A mountain illustration with a short motivational line.
// rotate: move to the next quote every few seconds (with dots to pick one).
function QuoteCard({ variant = 'dusk', quotes = QUOTES, title, subtitle, rotate = false, short = false }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!rotate) {
      return undefined
    }
    const timer = setInterval(() => setIndex((current) => (current + 1) % quotes.length), 8000)
    return () => clearInterval(timer)
  }, [rotate, quotes.length])

  return (
    <div className={`quote-card ${short ? 'quote-card-short' : ''}`}>
      <MountainScene variant={variant} stars={variant === 'night'} />
      <p className="quote-text">“{quotes[index % quotes.length]}”</p>
      {(title || rotate) && (
        <div className="quote-footer">
          {title && <strong>{title}</strong>}
          {subtitle && <span>{subtitle}</span>}
          {rotate && (
            <div className="quote-dots">
              {quotes.map((quote, quoteIndex) => (
                <button
                  key={quote}
                  type="button"
                  aria-label={`Show quote ${quoteIndex + 1}`}
                  aria-current={quoteIndex === index}
                  onClick={() => setIndex(quoteIndex)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuoteCard
