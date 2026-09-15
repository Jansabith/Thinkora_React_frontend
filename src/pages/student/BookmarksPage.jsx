import PageHeader from '../../components/PageHeader'
import QuestionBank from '../../components/QuestionBank'

// Questions the student bookmarked (the bookmark button on every question).
function BookmarksPage() {
  return (
    <>
      <PageHeader title="Bookmarks" subtitle="Questions you saved to come back to." />
      <QuestionBank fixedStatus="bookmarked" emptyText="No bookmarks yet. Press the bookmark icon on any question to save it here." />
    </>
  )
}

export default BookmarksPage
