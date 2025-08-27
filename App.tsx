





import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassroomPage from './pages/ClassroomPage'; 
import HomeworkPage from './pages/HomeworkPage';
import AssignmentSubmissionPage from './pages/AssignmentSubmissionPage';
import AdminPage from './pages/AdminPage';
import AboutUsPage from './pages/AboutUsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ProfilePage from './pages/ProfilePage';
import TrainerPage from './pages/TrainerPage';
import TutorChatPage from './pages/TutorChatPage';
import CreateClassroomPage from './pages/CreateClassroomPage';
import StorePage from './pages/StorePage';
import GamesPage from './pages/GamesPage';
import { UserRole } from './types';
import AdaptivePathwaysPage from './pages/AdaptivePathwaysPage';
import GradingPage from './pages/GradingPage';
import GradesOverviewPage from './pages/GradesOverviewPage';
import StudyDecksPage from './pages/StudyDecksPage';
import StudyDeckDetailPage from './pages/StudyDeckDetailPage';
import StudyModePage from './pages/StudyModePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectHubPage from './pages/ProjectHubPage';
import SchoolManagerDashboard from './pages/SchoolManagerDashboard';
import ClassroomLogPage from './pages/ClassroomLogPage';


function App() {
  const { user } = useAppContext();

  const getRedirectPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.TEACHER:
        return '/teacher/dashboard';
      case UserRole.SCHOOL_MANAGER:
        return '/school-manager/dashboard';
      case UserRole.STUDENT:
      default:
        return '/student/dashboard';
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-stone-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans flex flex-col">
        <Header />
        <main className="p-4 sm:p-6 md:p-8 flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            
            {/* Routes for any logged-in user */}
            {user && (
              <>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/classroom/:classroomId" element={<ClassroomPage />} />
                <Route path="/homework/:classroomId" element={<HomeworkPage />} />
                <Route path="/classroom/:classroomId/projects" element={<ProjectsPage />} />
                <Route path="/project/:projectId" element={<ProjectHubPage />} />
                <Route path="/classroom/:classroomId/log" element={<ClassroomLogPage />} />
              </>
            )}

            {/* Student Routes */}
            {user?.role === UserRole.STUDENT && (
              <>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/assignment/:classroomId/:assignmentId" element={<AssignmentSubmissionPage />} />
                <Route path="/student/trainer" element={<TrainerPage />} />
                <Route path="/student/tutor-chat" element={<TutorChatPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/student/study-decks" element={<StudyDecksPage />} />
                <Route path="/student/study-deck/:deckId" element={<StudyDeckDetailPage />} />
                <Route path="/student/study-mode/:deckId" element={<StudyModePage />} />
              </>
            )}

            {/* Teacher Routes */}
            {user?.role === UserRole.TEACHER && (
              <>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/create" element={<CreateClassroomPage />} /> 
                <Route path="/teacher/grade/:classroomId/:assignmentId" element={<GradingPage />} />
                <Route path="/teacher/grades/:classroomId" element={<GradesOverviewPage />} />
                <Route path="/teacher/pathways/:classroomId" element={<AdaptivePathwaysPage />} />
              </>
            )}
            
            {/* School Manager Routes */}
            {user?.role === UserRole.SCHOOL_MANAGER && (
              <>
                <Route path="/school-manager/dashboard" element={<SchoolManagerDashboard />} />
              </>
            )}

            {/* Admin Routes */}
            {user?.role === UserRole.ADMIN && (
              <>
                 <Route path="/admin" element={<AdminPage />} />
              </>
            )}
            
            {/* Redirect logic */}
            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;