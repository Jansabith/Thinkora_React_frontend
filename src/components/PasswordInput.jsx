import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'

// A password box with a lock icon and a button to show or hide what was typed.
function PasswordInput({ id, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="input-with-icon has-toggle">
      <Lock size={18} aria-hidden="true" />
      <input id={id} type={isVisible ? 'text' : 'password'} {...inputProps} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default PasswordInput
