import { useState } from 'react'
import FilterTabs from '../../components/FilterTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import PracticeQuestionCard from '../../components/PracticeQuestionCard'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { getAssignedQuestions } from '../../services/questionService'
import { formatDate } from '../../utils/format'

const TODO = 'todo'
const DONE = 'done'

const EMPTY_TEXT = {
  [TODO]: {
    title: 'Nothing left to do!',
    text: 'You have finished every question your teacher assigned. Well done.',
  },
  [DONE]: {
    title: 'Nothing finished yet',
    text: 'Mark a question as Done and it will move here.',
  },
}

function TeacherAssignedPage() {
  const { data: assignments, error, isLoading, reload } = useApiData(getAssignedQuestions)
  const [filter, setFilter] = useState(TODO)
  // Only the questions this student changed since the page opened.
  // Everything else comes straight from the server, so there is no copy to keep in sync.
  const [changed, setChanged] = useState({})

  function handleProgressChange(updatedProgress) {
    setChanged((current) => ({ ...current, [updatedProgress.question]: updatedProgress }))
  }

  if (isLoading) {
    return <Loading message="Loading assigned questions..." variant="list" count={5} />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const list = assignments ?? []

  // A question the student just ticked wins over what the server sent when the page loaded.
  const getProgress = (assignment) => changed[assignment.question.id] ?? assignment.progress
  const isDone = (assignment) => Boolean(getProgress(assignment)?.is_done)

  const doneCount = list.filter(isDone).length
  const todoCount = list.length - doneCount
  const shown = list.filter((assignment) => (filter === DONE ? isDone(assignment) : !isDone(assignment)))

  return (
    <>
      <PageHeader title="Teacher Assigned" subtitle="Practice questions hand-picked for you." />

      {list.length === 0 ? (
        <div className="card empty-state">
          <h2>You&apos;re all caught up!</h2>
          <p className="muted">Your teachers haven&apos;t assigned you any specific questions yet.</p>
        </div>
      ) : (
        <>
          <div className="assigned-toolbar">
            <FilterTabs
              label="Show assigned questions"
              value={filter}
              onChange={setFilter}
              options={[
                { value: TODO, label: `To do (${todoCount})` },
                { value: DONE, label: `Completed (${doneCount})` },
              ]}
            />
            <ProgressBar value={doneCount} max={list.length} label="Assigned questions finished" showPercent />
          </div>

          {shown.length === 0 ? (
            <div className="card empty-state">
              <h2>{EMPTY_TEXT[filter].title}</h2>
              <p className="muted">{EMPTY_TEXT[filter].text}</p>
            </div>
          ) : (
            <div className="questions-list">
              {shown.map((assignment, index) => (
                <PracticeQuestionCard
                  key={assignment.id}
                  question={assignment.question}
                  number={index + 1}
                  progress={getProgress(assignment)}
                  onProgressChange={handleProgressChange}
                  showLocation
                >
                  <p className="assigned-note muted">
                    Assigned by <strong>{assignment.assigned_by_name}</strong> on{' '}
                    {formatDate(assignment.assigned_at)}
                  </p>
                </PracticeQuestionCard>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default TeacherAssignedPage
