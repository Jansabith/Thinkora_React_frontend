import { useState } from 'react'
import { getFieldErrors } from '../services/api'
import { createTopic, updateTopic } from '../services/courseService'
import Alert from './Alert'
import FormField from './FormField'

// Create a new topic (initialTopic has no id) or edit an existing one.
// courses: when given, the admin chooses the course (used on the all-topics page).
function TopicForm({ initialTopic, courseId, courses, onSaved, onCancel }) {
  const isNew = !initialTopic.id
  const needsCourseChoice = isNew && Array.isArray(courses)
  const [topic, setTopic] = useState(initialTopic)
  const [selectedCourseId, setSelectedCourseId] = useState(courseId ? String(courseId) : '')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setTopic((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    const targetCourseId = needsCourseChoice ? selectedCourseId : courseId
    if (isNew && !targetCourseId) {
      setFieldErrors({ course: 'Choose a course for this topic.' })
      return
    }

    setIsSaving(true)
    const data = { 
      title: topic.title, 
      description: topic.description, 
      order: Number(topic.order),
      syllabus_points: Array.isArray(topic.syllabus_points) ? topic.syllabus_points.filter(p => p.trim() !== '') : []
    }

    try {
      const savedTopic = isNew ? await createTopic(targetCourseId, data) : await updateTopic(topic.id, data)
      onSaved(savedTopic, isNew)
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setError(saveError.message)
      setIsSaving(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{isNew ? 'New topic' : `Edit "${initialTopic.title}"`}</h2>
      <Alert type="error">{error}</Alert>

      {needsCourseChoice && (
        <FormField label="Course" htmlFor="topic-course" error={fieldErrors.course}>
          <select id="topic-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} required>
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <div className="form-row form-row-wide">
        <FormField label="Title" htmlFor="topic-title" error={fieldErrors.title}>
          <input id="topic-title" name="title" type="text" value={topic.title} onChange={handleChange} required />
        </FormField>
        <FormField label="Order" htmlFor="topic-order" error={fieldErrors.order}>
          <input id="topic-order" name="order" type="number" min="0" value={topic.order} onChange={handleChange} />
        </FormField>
      </div>

      <FormField label="Short description (optional)" htmlFor="topic-description" error={fieldErrors.description}>
        <textarea id="topic-description" name="description" rows={2} value={topic.description} onChange={handleChange} />
      </FormField>

      <FormField label="Syllabus Points (one per line)" htmlFor="topic-syllabus" error={fieldErrors.syllabus_points}>
        <textarea 
          id="topic-syllabus" 
          name="syllabus_points" 
          rows={4} 
          placeholder="e.g.&#10;Learn variables&#10;Understand data types"
          value={Array.isArray(topic.syllabus_points) ? topic.syllabus_points.join('\n') : topic.syllabus_points || ''} 
          onChange={(e) => setTopic((current) => ({ ...current, syllabus_points: e.target.value.split('\n') }))} 
        />
      </FormField>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save topic'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default TopicForm
