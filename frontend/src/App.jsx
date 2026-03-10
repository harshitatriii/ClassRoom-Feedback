import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import RoleRoute from './components/ui/RoleRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import StudentDashboard from './pages/student/StudentDashboard';
import FeedbackForm from './pages/student/FeedbackForm';
import FeedbackHistory from './pages/student/FeedbackHistory';

import FacultyDashboard from './pages/faculty/FacultyDashboard';
import CourseAnalytics from './pages/faculty/CourseAnalytics';

import AdminDashboard from './pages/admin/AdminDashboard';
import CourseManagement from './pages/admin/CourseManagement';

import CourseList from './pages/shared/CourseList';
import CourseDetail from './pages/shared/CourseDetail';
import FeedbackDetail from './pages/shared/FeedbackDetail';
import ProfilePage from './pages/shared/ProfilePage';
import NotFound from './pages/shared/NotFound';

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user?.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardRedirect />} />

              <Route path="subjects" element={<CourseList />} />
              <Route path="subjects/:id" element={<CourseDetail />} />
              <Route path="feedback/:id" element={<FeedbackDetail />} />
              <Route path="profile" element={<ProfilePage />} />

              <Route element={<RoleRoute roles={['student']} />}>
                <Route path="student/dashboard" element={<StudentDashboard />} />
                <Route path="student/feedback/new" element={<FeedbackForm />} />
                <Route path="student/feedback" element={<FeedbackHistory />} />
              </Route>

              <Route element={<RoleRoute roles={['faculty']} />}>
                <Route path="faculty/dashboard" element={<FacultyDashboard />} />
                <Route path="faculty/analytics/:subjectId" element={<CourseAnalytics />} />
              </Route>

              <Route element={<RoleRoute roles={['admin']} />}>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/subjects" element={<CourseManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
