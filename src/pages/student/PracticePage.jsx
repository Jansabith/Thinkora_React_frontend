import PageHeader from '../../components/PageHeader'
import QuestionBank from '../../components/QuestionBank'

// All practice questions from every course, with filters.
function PracticePage() {
  return (
    <>
      <PageHeader title="Practice" subtitle="Questions from every course. Filter by course, difficulty or what you have done." />
      <QuestionBank />
    </>
  )
}

export default PracticePage
