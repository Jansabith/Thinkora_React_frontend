import Alert from './Alert'

// Shown when loading data from the API fails, with a "Try again" button.
function LoadError({ error, onRetry }) {
  return (
    <Alert type="error">
      {error.message}
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </Alert>
  )
}

export default LoadError
