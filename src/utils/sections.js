// The sections every course has. Each section is organised by topics.
//
// To add a new section later (for example "Notes"):
//   1. Django: create an app with a model linked to Topic, plus its API.
//   2. React:  add it to this list and create a page that shows one topic's items.
export const COURSE_SECTIONS = [
  {
    key: 'questions',
    title: 'Practice Questions',
    description: 'Practise every topic with easy, medium and hard questions.',
    countField: 'question_count',
    itemName: 'question',
  },
  {
    key: 'videos',
    title: 'Videos',
    description: 'Watch video lessons, topic by topic.',
    countField: 'video_count',
    itemName: 'video',
  },
  {
    key: 'roadmap',
    title: 'Course Roadmap',
    description: 'Follow the step-by-step sequential guide to master this course.',
    countField: 'topic_count',
    itemName: 'topic',
  },
]

export function findSection(key) {
  return COURSE_SECTIONS.find((section) => section.key === key)
}
