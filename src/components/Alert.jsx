// A coloured message box. type: 'info', 'success' or 'error'
function Alert({ type = 'info', children }) {
  if (!children) {
    return null
  }
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export default Alert
