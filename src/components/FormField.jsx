import { getErrorText } from '../services/api'

// A label, the input (children), and a hint or error message underneath.
function FormField({ label, htmlFor, error, hint, children }) {
  const errorText = getErrorText(error)

  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !errorText && <p className="field-hint">{hint}</p>}
      {errorText && <p className="field-error">{errorText}</p>}
    </div>
  )
}

export default FormField
