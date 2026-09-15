function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {message}
    </div>
  )
}

export default Loading
