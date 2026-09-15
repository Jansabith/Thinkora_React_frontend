import { Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { getCourses } from '../services/courseService'
import { getPracticeQuestions } from '../services/progressService'
import { DIFFICULTIES } from '../utils/difficulties'
import { pluralize } from '../utils/format'
import FilterTabs from './FilterTabs'
import FormField from './FormField'
import LoadError from './LoadError'
import Loading from './Loading'
import PracticeQuestionCard from './PracticeQuestionCard'

const DIFFICULTY_OPTIONS = [{ value: '', label: 'All levels' }, ...DIFFICULTIES.map(({ value, label }) => ({ value, label }))]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'done', label: 'Done' },
  { value: 'doubt', label: 'My doubts' },
  { value: 'bookmarked', label: 'Bookmarked' },
]

const EMPTY_PAGE = { count: 0, results: [], next: null }

// Questions from every course, with filters and "Load more".
// fixedStatus: always use this status filter (the Bookmarks page uses 'bookmarked').
function QuestionBank({ fixedStatus = '', emptyText = 'No questions match these filters.' }) {
  const [courseId, setCourseId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [progressChanges, setProgressChanges] = useState({})

  const { data: courses } = useApiData(getCourses)
  const statusFilter = fixedStatus || status

  const loadQuestions = useCallback(async () => {
    const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        getPracticeQuestions({ course: courseId, difficulty, search, status: statusFilter, page }).catch((pageError) => {
          // A page can disappear when the list gets shorter (for example after removing a bookmark).
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
  }, [courseId, difficulty, search, statusFilter, pageCount])

  const { data, error, isLoading, reload } = useApiData(loadQuestions, { keepPreviousData: true })

  // Any filter change starts again from page 1.
  function withFirstPage(setter) {
    return (value) => {
      setter(value)
      setPageCount(1)
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    setSearch(searchInput.trim())
    setPageCount(1)
  }

  function handleProgressChange(updatedProgress) {
    setProgressChanges((current) => ({ ...current, [updatedProgress.question]: updatedProgress }))
  }

  return (
    <>
      <div className="filters-row">
        <FormField label="Course" htmlFor="bank-course">
          <select id="bank-course" value={courseId} onChange={(event) => withFirstPage(setCourseId)(event.target.value)}>
            <option value="">All courses</option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
        <form className="search-form" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="Search questions"
            aria-label="Search questions"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} aria-hidden="true" /> Search
          </button>
        </form>
      </div>

      <div className="toolbar">
        <FilterTabs options={DIFFICULTY_OPTIONS} value={difficulty} onChange={withFirstPage(setDifficulty)} label="Filter by difficulty" />
        {!fixedStatus && <FilterTabs options={STATUS_OPTIONS} value={status} onChange={withFirstPage(setStatus)} label="Filter by status" />}
      </div>

      {isLoading && !data && <Loading message="Loading questions..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {data && (
        <div className={isLoading ? 'chart-refreshing' : undefined}>
          <p className="muted">{pluralize(data.count, 'question')}</p>
          {data.results.length === 0 && <p className="empty-state">{emptyText}</p>}
          {data.results.map((question) => (
            <PracticeQuestionCard
              key={question.id}
              question={question}
              progress={progressChanges[question.id] ?? question.progress ?? undefined}
              onProgressChange={handleProgressChange}
              showLocation
            />
          ))}
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

export default QuestionBank
