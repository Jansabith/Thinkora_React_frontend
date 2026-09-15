import { FileText, Layers, Plus, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Alert from '../../components/Alert'
import FilterTabs from '../../components/FilterTabs'
import FormField from '../../components/FormField'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import QuestionForm from '../../components/QuestionForm'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { getCourses, getTopics } from '../../services/courseService'
import { bulkCreateQuestions, deleteQuestion, extractQuestionsFromPdf, getAllQuestions } from '../../services/questionService'
import { DIFFICULTIES } from '../../utils/difficulties'
import { pluralize } from '../../utils/format'

const DIFFICULTY_OPTIONS = [{ value: '', label: 'All levels' }, ...DIFFICULTIES.map(({ value, label }) => ({ value, label }))]
const EMPTY_PAGE = { count: 0, results: [], next: null }

function PdfUploadPanel({ courses, onSaved, onCancel }) {
  const [courseId, setCourseId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [previewQuestions, setPreviewQuestions] = useState(null)
  
  const loadTopics = useCallback(() => (courseId ? getTopics(courseId) : Promise.resolve([])), [courseId])
  const { data: topics } = useApiData(loadTopics)

  const handleExtract = async (event) => {
    event.preventDefault()
    if (!topicId || !file) return
    
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await extractQuestionsFromPdf(topicId, difficulty, file)
      setPreviewQuestions(response.questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await bulkCreateQuestions(topicId, previewQuestions)
      onSaved(response.message)
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  if (previewQuestions) {
    return (
      <div className="card">
        <h2>Preview Extracted Questions</h2>
        <p className="muted">Found {previewQuestions.length} questions. Please review them before saving.</p>
        
        {error && <Alert type="error">{error}</Alert>}
        
        <div className="preview-list" style={{ maxHeight: '400px', overflowY: 'auto', margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {previewQuestions.map((q, index) => (
            <div key={index} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <StatusBadge status={q.difficulty} />
              <p style={{ marginTop: '0.5rem', fontWeight: '500' }}>{q.text}</p>
              {q.answer && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '4px' }}>
                  <span className="muted" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Answer:</span>
                  {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Confirm & Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setPreviewQuestions(null)} disabled={isSubmitting}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Extract questions from PDF</h2>
      <p className="muted">Automatically pull numbered questions and answers from a PDF.</p>
      
      {error && <Alert type="error">{error}</Alert>}
      
      <form onSubmit={handleExtract}>
        <div className="form-row">
          <FormField label="Course" htmlFor="pdf-course">
            <select id="pdf-course" value={courseId} onChange={(e) => { setCourseId(e.target.value); setTopicId('') }} required>
              <option value="">Choose a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </FormField>
          <FormField label="Topic" htmlFor="pdf-topic">
            <select id="pdf-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={!courseId} required>
              <option value="">{courseId ? 'Choose a topic' : 'Choose a course first'}</option>
              {(topics ?? []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </FormField>
        </div>
        
        <div className="form-row">
          <FormField label="Difficulty" htmlFor="pdf-difficulty">
            <select id="pdf-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
              {DIFFICULTIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="PDF File" htmlFor="pdf-file">
            <input 
              type="file" 
              id="pdf-file" 
              accept="application/pdf" 
              onChange={(e) => setFile(e.target.files[0])} 
              required 
            />
          </FormField>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !topicId || !file}>
            {isSubmitting ? 'Extracting...' : 'Extract Questions'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Choose a course and a topic, then write the question.
function NewQuestionPanel({ courses, onSaved, onCancel }) {
  const [courseId, setCourseId] = useState('')
  const [topicId, setTopicId] = useState('')
  const loadTopics = useCallback(() => (courseId ? getTopics(courseId) : Promise.resolve([])), [courseId])
  const { data: topics } = useApiData(loadTopics)
  const topic = (topics ?? []).find((item) => String(item.id) === topicId)

  return (
    <div className="card">
      <h2>New practice question</h2>
      <div className="form-row">
        <FormField label="Course" htmlFor="new-question-course">
          <select
            id="new-question-course"
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value)
              setTopicId('')
            }}
          >
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Topic" htmlFor="new-question-topic">
          <select id="new-question-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)} disabled={!courseId}>
            <option value="">{courseId ? 'Choose a topic' : 'Choose a course first'}</option>
            {(topics ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {topic ? (
        <QuestionForm key={topic.id} topicId={topic.id} nextOrder={topic.question_count + 1} onSaved={onSaved} onCancel={onCancel} />
      ) : (
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// Admin: every practice question in every course, with filters.
function AdminQuestionsPage() {
  const [searchParams] = useSearchParams()
  const [courseId, setCourseId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [isCreating, setIsCreating] = useState(() => searchParams.get('new') === '1')
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState(null)

  const { data: courses } = useApiData(getCourses)
  const loadTopics = useCallback(() => (courseId ? getTopics(courseId) : Promise.resolve([])), [courseId])
  const { data: topics } = useApiData(loadTopics)

  const loadQuestions = useCallback(async () => {
    const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        getAllQuestions({ course: courseId, topic: topicId, difficulty, search, page }).catch((pageError) => {
          if (pageError.status === 404) {
            return EMPTY_PAGE
          }
          throw pageError
        }),
      ),
    )
    return {
      count: pages[0].count,
      results: pages.flatMap((page) => page.results),
      hasMore: Boolean(pages[pages.length - 1].next),
    }
  }, [courseId, topicId, difficulty, search, pageCount])

  const { data, error, isLoading, reload } = useApiData(loadQuestions, { keepPreviousData: true })

  function handleCreated() {
    setIsCreating(false)
    setMessage({ type: 'success', text: 'Question added.' })
    reload()
  }

  function handleEdited() {
    setEditingId(null)
    setMessage({ type: 'success', text: 'Question updated.' })
    reload()
  }

  async function handleDelete(question) {
    if (!window.confirm('Delete this question and all student progress on it? This cannot be undone.')) {
      return
    }
    setMessage(null)
    try {
      await deleteQuestion(question.id)
      setMessage({ type: 'success', text: 'Question deleted.' })
      reload()
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    setSearch(searchInput.trim())
    setPageCount(1)
  }

  return (
    <>
      <PageHeader title="Questions" subtitle="Every practice question in every course." backTo="/admin" backLabel="Dashboard">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setIsExtractingPdf(true)} disabled={isCreating || isExtractingPdf}>
            <FileText size={16} aria-hidden="true" /> Extract from PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)} disabled={isCreating || isExtractingPdf}>
            <Plus size={16} aria-hidden="true" /> New question
          </button>
        </div>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {isExtractingPdf && courses && (
        <PdfUploadPanel 
          courses={courses} 
          onSaved={(msg) => { setIsExtractingPdf(false); setMessage({ type: 'success', text: msg }); reload() }} 
          onCancel={() => setIsExtractingPdf(false)} 
        />
      )}

      {isCreating && courses && <NewQuestionPanel courses={courses} onSaved={handleCreated} onCancel={() => setIsCreating(false)} />}

      <div className="filters-row">
        <FormField label="Course" htmlFor="questions-course">
          <select
            id="questions-course"
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value)
              setTopicId('')
              setPageCount(1)
            }}
          >
            <option value="">All courses</option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Topic" htmlFor="questions-topic">
          <select
            id="questions-topic"
            value={topicId}
            disabled={!courseId}
            onChange={(event) => {
              setTopicId(event.target.value)
              setPageCount(1)
            }}
          >
            <option value="">{courseId ? 'All topics' : 'Choose a course first'}</option>
            {(topics ?? []).map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </FormField>
        <form className="search-form" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="Search question text"
            aria-label="Search questions"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} aria-hidden="true" /> Search
          </button>
        </form>
      </div>

      <FilterTabs
        options={DIFFICULTY_OPTIONS}
        value={difficulty}
        onChange={(value) => {
          setDifficulty(value)
          setPageCount(1)
        }}
        label="Filter by difficulty"
      />

      {isLoading && !data && <Loading message="Loading questions..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {data && (
        <div className={isLoading ? 'chart-refreshing' : undefined}>
          <p className="muted">{pluralize(data.count, 'question')}</p>
          {data.results.length === 0 && <p className="empty-state">No questions match these filters.</p>}

          {data.results.map((question) =>
            editingId === question.id ? (
              <QuestionForm key={question.id} initialQuestion={question} topicId={question.topic} onSaved={handleEdited} onCancel={() => setEditingId(null)} />
            ) : (
              <div key={question.id} className="card question-card">
                <div className="question-header">
                  <Link to={`/admin/topics/${question.topic}/questions`} className="question-location">
                    <Layers size={14} aria-hidden="true" /> {question.course_title} › {question.topic_title}
                  </Link>
                  <StatusBadge status={question.difficulty} />
                  <div className="question-actions">
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => setEditingId(question.id)} disabled={editingId !== null}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-small" onClick={() => handleDelete(question)}>
                      Delete
                    </button>
                  </div>
                </div>
                <p className="question-text">{question.text}</p>
                {question.answer ? (
                  <details>
                    <summary className="muted">Show answer</summary>
                    <pre className="answer-box">{question.answer}</pre>
                  </details>
                ) : (
                  <p className="field-hint">No answer added.</p>
                )}
              </div>
            ),
          )}

          {data.hasMore && (
            <div className="load-more">
              <button type="button" className="btn btn-secondary" onClick={() => setPageCount((count) => count + 1)} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load more questions'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default AdminQuestionsPage
