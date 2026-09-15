import { useState } from 'react'
import { getFieldErrors } from '../services/api'
import { createVideo, updateVideo } from '../services/videoService'
import Alert from './Alert'
import FormField from './FormField'

// Add a video (initialVideo = null) or edit an existing one.
function VideoForm({ initialVideo, topicId, nextOrder, onSaved, onCancel }) {
  const isNew = !initialVideo
  const [video, setVideo] = useState(() =>
    isNew
      ? { title: '', url: '', description: '', order: nextOrder }
      : { title: initialVideo.title, url: initialVideo.url, description: initialVideo.description, order: initialVideo.order },
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setVideo((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSaving(true)

    const data = { ...video, order: Number(video.order) }

    try {
      const savedVideo = isNew ? await createVideo(topicId, data) : await updateVideo(initialVideo.id, data)
      onSaved(savedVideo, isNew)
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setError(saveError.message)
      setIsSaving(false)
    }
  }

  const formId = isNew ? 'video-new' : `video-${initialVideo.id}`

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{isNew ? 'New video' : 'Edit video'}</h2>
      <Alert type="error">{error}</Alert>

      <div className="form-row form-row-wide">
        <FormField label="Title" htmlFor={`${formId}-title`} error={fieldErrors.title}>
          <input id={`${formId}-title`} name="title" type="text" value={video.title} onChange={handleChange} required />
        </FormField>
        <FormField label="Order" htmlFor={`${formId}-order`} error={fieldErrors.order}>
          <input id={`${formId}-order`} name="order" type="number" min="0" value={video.order} onChange={handleChange} />
        </FormField>
      </div>

      <FormField
        label="Video link"
        htmlFor={`${formId}-url`}
        error={fieldErrors.url}
        hint="YouTube links play inside the page. Other links open in a new tab."
      >
        <input
          id={`${formId}-url`}
          name="url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={video.url}
          onChange={handleChange}
          required
        />
      </FormField>

      <FormField label="Description (optional)" htmlFor={`${formId}-description`} error={fieldErrors.description}>
        <textarea id={`${formId}-description`} name="description" rows={2} value={video.description} onChange={handleChange} />
      </FormField>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save video'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default VideoForm
