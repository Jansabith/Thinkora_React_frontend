import PhoneInput from './PhoneInput'
import { useState } from 'react'
import { getFieldErrors } from '../services/api'
import { updateStudent } from '../services/adminService'
import Alert from './Alert'
import FormField from './FormField'
import { getCourses } from '../services/courseService'
import { useApiData } from '../hooks/useApiData'

// Admin: change a student's name and email, or give them a new password.
function StudentAccountForm({ student, onSaved }) {
  const [form, setForm] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    email: student.email,
    whatsapp_number: student.whatsapp_number ?? '',
    allowed_courses: student.allowed_courses || [],
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { data: courses } = useApiData(getCourses)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleCourseToggle(courseId) {
    setForm((current) => {
      const allowed = current.allowed_courses
      if (allowed.includes(courseId)) {
        return { ...current, allowed_courses: allowed.filter((id) => id !== courseId) }
      }
      return { ...current, allowed_courses: [...allowed, courseId] }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSaving(true)

    // Only send a password if the admin typed one.
    const { password, ...details } = form
    const data = password ? form : details

    try {
      await updateStudent(student.id, data)
      setForm((current) => ({ ...current, password: '' }))
      onSaved(password ? 'Details and new password saved. The student was logged out.' : 'Student details saved.')
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <Alert type="error">{error}</Alert>

      <div className="form-row">
        <FormField label="First name" htmlFor="student-first-name" error={fieldErrors.first_name}>
          <input id="student-first-name" name="first_name" type="text" value={form.first_name} onChange={handleChange} />
        </FormField>
        <FormField label="Last name" htmlFor="student-last-name" error={fieldErrors.last_name}>
          <input id="student-last-name" name="last_name" type="text" value={form.last_name} onChange={handleChange} />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="student-email" error={fieldErrors.email}>
        <input id="student-email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </FormField>

      <FormField
        label="WhatsApp number (optional)"
        htmlFor="student-whatsapp"
        error={fieldErrors.whatsapp_number}
        hint="Type the number without country code. Select country code on the left."
      >
        <PhoneInput
          id="student-whatsapp"
          name="whatsapp_number"
          value={form.whatsapp_number}
          onChange={handleChange}
        />
        {form.whatsapp_number && (
          <a
            href={`https://api.whatsapp.com/send/?phone=${form.whatsapp_number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="field-hint"
            style={{ color: 'var(--color-success)', marginTop: '4px', display: 'inline-block' }}
          >
            Open WhatsApp chat ↗
          </a>
        )}
      </FormField>

      <fieldset>
        <legend>Course Access</legend>
        <p className="field-hint" style={{ marginBottom: '12px' }}>
          Select the courses this student is allowed to see.
        </p>
        {courses ? (
          courses.map((course) => (
            <label key={course.id} className="checkbox-field">
              <input
                type="checkbox"
                checked={form.allowed_courses.includes(course.id)}
                onChange={() => handleCourseToggle(course.id)}
              />
              {course.title}
            </label>
          ))
        ) : (
          <p className="muted">Loading courses...</p>
        )}
      </fieldset>

      <FormField
        label="New password (optional)"
        htmlFor="student-password"
        error={fieldErrors.password}
        hint="Leave empty to keep the current password. A new password logs the student out."
      >
        <input
          id="student-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
        />
      </FormField>

      <button type="submit" className="btn btn-primary" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save student'}
      </button>
    </form>
  )
}

export default StudentAccountForm
