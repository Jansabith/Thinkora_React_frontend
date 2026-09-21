import PageSkeleton from './Skeleton'

// Shown while a page waits for the API.
// Give it a `variant` ('cards', 'list', 'roadmap', 'stats') to show shimmer blocks
// shaped like the real content. Without one, it falls back to a small spinner.
function Loading({ message = 'Loading...', variant, count = 3 }) {
  if (variant) {
    return <PageSkeleton variant={variant} count={count} label={message} />
  }

  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {message}
    </div>
  )
}

export default Loading
