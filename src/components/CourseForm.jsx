import { useState } from 'react'
import { getFieldErrors } from '../services/api'
import { createCourse, updateCourse } from '../services/courseService'
import { LEVELS } from '../utils/levels'
import Alert from './Alert'
import FormField from './FormField'

const DEFAULTS = { title: '', description: '', category: '', level: 'beginner', is_published: true }

// Create a new course (initialCourse has no id) or edit an existing one.
// categories: existing category names, suggested while typing so the same name is reused.
function CourseForm({ initialCourse, categories = [], onSaved, onCancel }) {
  const isNew = !initialCourse.id
  const [course, setCourse] = useState({ ...DEFAULTS, ...initialCourse })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setCourse((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSaving(true)

    const data = {
      title: course.title,
      description: course.description,
      category: course.category.trim(),
      level: course.level,
      is_published: course.is_published,
    }

    try {
      const savedCourse = isNew ? await createCourse(data) : await updateCourse(course.id, data)
      onSaved(savedCourse, isNew)
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setError(saveError.message)
      setIsSaving(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{isNew ? 'New course' : `Edit "${initialCourse.title}"`}</h2>
      <Alert type="error">{error}</Alert>

      <FormField label="Title" htmlFor="course-title" error={fieldErrors.title}>
        <input id="course-title" name="title" type="text" value={course.title} onChange={handleChange} required />
      </FormField>

      <div className="form-row">
        <FormField
          label="Category"
          htmlFor="course-category"
          error={fieldErrors.category}
          hint="For example Programming or Web Development. Used on the dashboard chart."
        >
          <input
            id="course-category"
            name="category"
            type="text"
            list="course-categories"
            value={course.category}
            onChange={handleChange}
            maxLength={60}
          />
          <datalist id="course-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </FormField>

        <FormField label="Level" htmlFor="course-level" error={fieldErrors.level}>
          <select id="course-level" name="level" value={course.level} onChange={handleChange}>
            {LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Description" htmlFor="course-description" error={fieldErrors.description}>
        <textarea id="course-description" name="description" rows={3} value={course.description} onChange={handleChange} />
      </FormField>

      <label className="checkbox-field">
        <input name="is_published" type="checkbox" checked={course.is_published} onChange={handleChange} />
        Published (students can see this course)
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save course'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default CourseForm
