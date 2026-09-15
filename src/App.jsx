import { Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import AuthLayout from './components/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import GetAccessPage from './pages/GetAccessPage'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ActivityLogPage from './pages/admin/ActivityLogPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage'
import AdminTopicsPage from './pages/admin/AdminTopicsPage'
import DoubtsPage from './pages/admin/DoubtsPage'
import ManageCoursesPage from './pages/admin/ManageCoursesPage'
import ManageQuestionsPage from './pages/admin/ManageQuestionsPage'
import ManageTopicsPage from './pages/admin/ManageTopicsPage'
import ManageVideosPage from './pages/admin/ManageVideosPage'
import ReportsPage from './pages/admin/ReportsPage'
import StudentDetailPage from './pages/admin/StudentDetailPage'
import StudentRequestsPage from './pages/admin/StudentRequestsPage'
import StudentsPage from './pages/admin/StudentsPage'
import CreateAdminPage from './pages/main-admin/CreateAdminPage'
import ManageAdminsPage from './pages/main-admin/ManageAdminsPage'
import AllTopicsPage from './pages/student/AllTopicsPage'
import BookmarksPage from './pages/student/BookmarksPage'
import CertificateViewPage from './pages/student/CertificateViewPage'
import CertificatesPage from './pages/student/CertificatesPage'
import CourseDetailPage from './pages/student/CourseDetailPage'
import CourseRoadmapPage from './pages/student/CourseRoadmapPage'
import CourseSectionPage from './pages/student/CourseSectionPage'
import MessagesPage from './pages/student/MessagesPage'
import MyCoursesPage from './pages/student/MyCoursesPage'
import MyProgressPage from './pages/student/MyProgressPage'
import PracticePage from './pages/student/PracticePage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import TeacherAssignedPage from './pages/student/TeacherAssignedPage'
import TopicQuestionsPage from './pages/student/TopicQuestionsPage'
import TopicVideosPage from './pages/student/TopicVideosPage'
import { ADMIN_ROLES } from './utils/auth'

function App() {
  return (
    <Routes>
      {/* Public home page */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Login and Get Access: split screen */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="admin/login" element={<LoginPage isAdminLogin />} />
        <Route path="get-access" element={<GetAccessPage />} />
      </Route>

      {/* Everything below needs a logged-in user and uses the sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Students */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="student" element={<StudentDashboardPage />} />
            <Route path="student/courses" element={<MyCoursesPage />} />
            <Route path="student/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="student/courses/:courseId/roadmap" element={<CourseRoadmapPage />} />
            <Route path="student/courses/:courseId/:sectionKey" element={<CourseSectionPage />} />
            <Route path="student/topics" element={<AllTopicsPage />} />
            <Route path="student/topics/:topicId/questions" element={<TopicQuestionsPage />} />
            <Route path="student/topics/:topicId/videos" element={<TopicVideosPage />} />
            <Route path="student/assigned" element={<TeacherAssignedPage />} />
            <Route path="student/practice" element={<PracticePage />} />
            <Route path="student/bookmarks" element={<BookmarksPage />} />
            <Route path="student/progress" element={<MyProgressPage />} />
            <Route path="student/leaderboard" element={<LeaderboardPage />} />
            <Route path="student/certificates" element={<CertificatesPage />} />
            <Route path="student/certificates/:courseId" element={<CertificateViewPage />} />
            <Route path="student/messages" element={<MessagesPage />} />
          </Route>

          {/* Admins and Main Admin */}
          <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/activity" element={<ActivityLogPage />} />
            <Route path="admin/leaderboard" element={<LeaderboardPage />} />

            <Route element={<ProtectedRoute requiredPermission="students" />}>
              <Route path="admin/requests" element={<StudentRequestsPage />} />
              <Route path="admin/students" element={<StudentsPage />} />
              <Route path="admin/students/:studentId" element={<StudentDetailPage />} />
              <Route path="admin/doubts" element={<DoubtsPage />} />
              <Route path="admin/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="content" />}>
              <Route path="admin/courses" element={<ManageCoursesPage />} />
              <Route path="admin/courses/:courseId" element={<ManageTopicsPage />} />
              <Route path="admin/topics" element={<AdminTopicsPage />} />
              <Route path="admin/topics/:topicId/questions" element={<ManageQuestionsPage />} />
              <Route path="admin/topics/:topicId/videos" element={<ManageVideosPage />} />
              <Route path="admin/questions" element={<AdminQuestionsPage />} />
            </Route>
          </Route>

          {/* Main Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['main_admin']} />}>
            <Route path="main-admin/admins" element={<ManageAdminsPage />} />
            <Route path="main-admin/admins/new" element={<CreateAdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
