import { apiRequest } from './api'

export function getVideos(topicId) {
  return apiRequest(`/topics/${topicId}/videos/`)
}

export function createVideo(topicId, data) {
  return apiRequest(`/topics/${topicId}/videos/`, { method: 'POST', body: data })
}

export function updateVideo(videoId, data) {
  return apiRequest(`/videos/${videoId}/`, { method: 'PATCH', body: data })
}

export function deleteVideo(videoId) {
  return apiRequest(`/videos/${videoId}/`, { method: 'DELETE' })
}
