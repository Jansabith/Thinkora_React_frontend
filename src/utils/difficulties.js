// Must match Question.Difficulty in Django (backend/questions/models.py).
export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', countField: 'easy_count' },
  { value: 'medium', label: 'Medium', countField: 'medium_count' },
  { value: 'hard', label: 'Hard', countField: 'hard_count' },
]
