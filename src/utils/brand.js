// The LMS name shown everywhere. Change it here to rename the whole app.
export const BRAND = {
  name: 'Thinkora',
  tagline: 'Learn · Practice · Grow',
}

// Short motivational lines for the quote cards and banners (rotated, no author).
export const QUOTES = [
  'Small steps, big futures.',
  'A better you starts here.',
  'Consistency today, success tomorrow.',
  'Knowledge today, brighter tomorrow.',
  'Practice makes progress.',
]

// The same quote for the whole day, a different one tomorrow.
export function getQuoteOfTheDay(offset = 0) {
  const dayNumber = Math.floor(Date.now() / 86400000)
  return QUOTES[(dayNumber + offset) % QUOTES.length]
}
