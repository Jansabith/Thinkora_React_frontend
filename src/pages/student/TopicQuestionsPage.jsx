import { useCallback, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import DifficultyTabs from '../../components/DifficultyTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import PracticeQuestionCard from '../../components/PracticeQuestionCard'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { getTopic } from '../../services/courseService'
import { getMyTopicProgress } from '../../services/progressService'
import { getQuestions } from '../../services/questionService'

// Practice questions of one topic, filtered by difficulty, with Done / Doubt buttons.
function TopicQuestionsPage() {
  const { topicId } = useParams()
  // The chosen difficulty lives in the URL (?difficulty=easy), so the browser Back button works.
  const [searchParams, setSearchParams] = useSearchParams()
  const difficulty = searchParams.get('difficulty') ?? ''

  const loadTopic = useCallback(() => getTopic(topicId), [topicId])
  const topicResult = useApiData(loadTopic)

  const loadQuestions = useCallback(() => getQuestions(topicId, difficulty), [topicId, difficulty])
  const questionsResult = useApiData(loadQuestions)

  // My saved Done / Doubt state for this topic's questions.
  const loadProgress = useCallback(() => getMyTopicProgress(topicId), [topicId])
  const progressResult = useApiData(loadProgress)

  // Changes made on this page, so the buttons update at once without reloading everything.
  const [progressChanges, setProgressChanges] = useState({})

  function handleDifficultyChange(value) {
    setSearchParams(value ? { difficulty: value } : {})
  }

  function handleProgressChange(updatedProgress) {
    setProgressChanges((current) => ({ ...current, [updatedProgress.question]: updatedProgress }))
  }

  if (topicResult.isLoading) {
    return <Loading message="Loading topic..." />
  }
  if (topicResult.error) {
    return <LoadError error={topicResult.error} onRetry={topicResult.reload} />
  }

  const topic = topicResult.data
  const questions = questionsResult.data

  // Saved progress from Django, updated with the changes made on this page.
  const progressByQuestion = {}
  for (const record of progressResult.data ?? []) {
    progressByQuestion[record.question] = record
  }
  Object.assign(progressByQuestion, progressChanges)
  const doneCount = Object.values(progressByQuestion).filter((record) => record.is_done).length

  const isListLoading = questionsResult.isLoading || progressResult.isLoading
  const listError = questionsResult.error ?? progressResult.error

  function retryList() {
    questionsResult.reload()
    progressResult.reload()
  }

  return (
    <>
      <PageHeader
        title={topic.title}
        subtitle={`${topic.course_title} · Practice Questions · Mark questions as done. Stuck? Ask a doubt.`}
        backTo={`/student/courses/${topic.course}/questions`}
        backLabel="All topics"
      />

      {topic.description && <p className="topic-description">{topic.description}</p>}

      <div className="card topic-progress-summary">
        <span>
          You have finished <strong>{doneCount}</strong> of <strong>{topic.question_count}</strong> questions in this topic.
        </span>
        <ProgressBar value={doneCount} max={topic.question_count} label="Your progress in this topic" />
      </div>

      <DifficultyTabs selected={difficulty} counts={topic} onSelect={handleDifficultyChange} />

      {isListLoading && <Loading message="Loading questions..." />}
      {!isListLoading && listError && <LoadError error={listError} onRetry={retryList} />}

      {!isListLoading && !listError && questions.length === 0 && (
        <p className="empty-state">No {difficulty} questions in this topic yet.</p>
      )}

      {!isListLoading &&
        !listError &&
        questions.map((question, index) => (
          <PracticeQuestionCard
            key={question.id}
            question={question}
            number={index + 1}
            progress={progressByQuestion[question.id]}
            onProgressChange={handleProgressChange}
          />
        ))}
    </>
  )
}

export default TopicQuestionsPage
