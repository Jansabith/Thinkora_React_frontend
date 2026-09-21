// Grey shimmer blocks shaped like the content that is still loading.
// They keep the page from jumping, and feel faster than a spinner.

export function Skeleton({ width, height = 14, radius, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}

// A few lines of fake text, the last one shorter (like a real paragraph).
export function SkeletonText({ lines = 3 }) {
  return (
    <span className="skeleton-text" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? '62%' : '100%'} />
      ))}
    </span>
  )
}

export function SkeletonCard({ lines = 2 }) {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <Skeleton width="46%" height={18} />
      <SkeletonText lines={lines} />
      <Skeleton width="100%" height={8} radius={99} />
    </div>
  )
}

// Ready-made page shapes. variant matches what the page actually renders.
const VARIANTS = {
  cards: (count) => (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  ),
  list: (count) => (
    <div className="skeleton-list">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-row">
          <Skeleton width={42} height={42} radius="50%" />
          <span className="skeleton-row-text">
            <Skeleton width="38%" height={14} />
            <Skeleton width="68%" height={12} />
          </span>
        </div>
      ))}
    </div>
  ),
  roadmap: (count) => (
    <div className="skeleton-roadmap">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-roadmap-row">
          <Skeleton width={56} height={56} radius="50%" />
          <SkeletonCard />
        </div>
      ))}
    </div>
  ),
  stats: (count) => (
    <div className="skeleton-stats">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card skeleton-card">
          <Skeleton width={38} height={38} radius="12px" />
          <Skeleton width="54%" height={26} />
          <Skeleton width="72%" height={12} />
        </div>
      ))}
    </div>
  ),
}

// <PageSkeleton variant="cards" count={3} label="Loading your courses" />
function PageSkeleton({ variant = 'cards', count = 3, label = 'Loading' }) {
  const build = VARIANTS[variant] ?? VARIANTS.cards
  return (
    <div className="skeleton-page" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {build(count)}
    </div>
  )
}

export default PageSkeleton
