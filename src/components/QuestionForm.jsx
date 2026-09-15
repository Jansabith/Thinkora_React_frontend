import { useState } from 'react'
import { getFieldErrors } from '../services/api'
import { createQuestion, updateQuestion } from '../services/questionService'
import { DIFFICULTIES } from '../utils/difficulties'
import Alert from './Alert'
import FormField from './FormField'

// Create a practice question (initialQuestion = null) or edit an existing one.
function QuestionForm({ initialQuestion, topicId, defaultDifficulty, nextOrder, onSaved, onCancel }) {
  const isNew = !initialQuestion
  const [question, setQuestion] = useState(() =>
    isNew
      ? { text: '', difficulty: defaultDifficulty || 'easy', answer: '', order: nextOrder }
      : {
          text: initialQuestion.text,
          difficulty: initialQuestion.difficulty,
          answer: initialQuestion.answer,
          order: initialQuestion.order,
        },
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setQuestion((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSaving(true)

    const data = { ...question, order: Number(question.order) }

    try {
      const savedQuestion = isNew
        ? await createQuestion(topicId, data)
        : await updateQuestion(initialQuestion.id, data)
      onSaved(savedQuestion, isNew)
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setError(saveError.message)
      setIsSaving(false)
    }
  }

  const formId = isNew ? 'question-new' : `question-${initialQuestion.id}`

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{isNew ? 'New practice question' : 'Edit practice question'}</h2>
      <Alert type="error">{error}</Alert>

      <FormField label="Question" htmlFor={`${formId}-text`} error={fieldErrors.text}>
        <textarea id={`${formId}-text`} name="text" rows={4} value={question.text} onChange={handleChange} required />
      </FormField>

      <div className="form-row">
        <FormField label="Difficulty" htmlFor={`${formId}-difficulty`} error={fieldErrors.difficulty}>
          <select id={`${formId}-difficulty`} name="difficulty" value={question.difficulty} onChange={handleChange}>
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Order" htmlFor={`${formId}-order`} error={fieldErrors.order}>
          <input id={`${formId}-order`} name="order" type="number" min="0" value={question.order} onChange={handleChange} />
        </FormField>
      </div>

      <FormField
        label="Answer / solution (optional)"
        htmlFor={`${formId}-answer`}
        error={fieldErrors.answer}
        hint="Students do not see it. You can show it to a student who asks a doubt. Code keeps its spaces and line breaks."
      >
        <textarea
          id={`${formId}-answer`}
          name="answer"
          className="code-input"
          rows={6}
          value={question.answer}
          onChange={handleChange}
        />
      </FormField>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save question'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default QuestionForm
