import { useState } from 'react'
import { useNavigate } from 'react-router'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import PageHeader from '../../components/PageHeader'
import { getFieldErrors } from '../../services/api'
import { createAdmin } from '../../services/adminService'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
  confirm_password: '',
  can_manage_students: true,
  can_manage_content: true,
}

function CreateAdminPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: 'The two passwords do not match.' })
      return
    }

    setIsSaving(true)
    // confirm_password is only checked here in the browser; Django does not need it.
    const { confirm_password: _unused, ...adminData } = form

    try {
      const createdAdmin = await createAdmin(adminData)
      navigate('/main-admin/admins', { state: { message: `Admin "${createdAdmin.username}" was created.` } })
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setError(saveError.message)
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Create admin" subtitle="The new admin can log in at the Admin login page." backTo="/main-admin/admins" backLabel="All admins" />

      <form className="card medium" onSubmit={handleSubmit}>
        <Alert type="error">{error}</Alert>

        <div className="form-row">
          <FormField label="First name" htmlFor="first_name" error={fieldErrors.first_name}>
            <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} />
          </FormField>
          <FormField label="Last name" htmlFor="last_name" error={fieldErrors.last_name}>
            <input id="last_name" name="last_name" type="text" value={form.last_name} onChange={handleChange} />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </FormField>

        <FormField label="Username" htmlFor="username" error={fieldErrors.username}>
          <input id="username" name="username" type="text" autoComplete="off" value={form.username} onChange={handleChange} required />
        </FormField>

        <div className="form-row">
          <FormField label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters.">
            <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
          </FormField>
          <FormField label="Confirm password" htmlFor="confirm_password" error={fieldErrors.confirm_password}>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        <fieldset>
          <legend>Access rights</legend>
          <label className="checkbox-field">
            <input name="can_manage_students" type="checkbox" checked={form.can_manage_students} onChange={handleChange} />
            Manage students (approve, reject, remove)
          </label>
          <label className="checkbox-field">
            <input name="can_manage_content" type="checkbox" checked={form.can_manage_content} onChange={handleChange} />
            Manage content (courses, topics, questions, videos)
          </label>
        </fieldset>

        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Creating...' : 'Create admin'}
        </button>
      </form>
    </>
  )
}

export default CreateAdminPage
