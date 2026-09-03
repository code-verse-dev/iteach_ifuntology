import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getBasename } from "./utils/Functions";
import ProtectedRoute from "./pages/protectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RecoverPasswordPage from "./pages/auth/RecoverPasswordPage";
import VerifyOtp from "./pages/auth/VerifyOtp";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/DashboardPage";
import TeachersPage from "./pages/admin/TeachersPage";
import StudentsPage from "./pages/admin/StudentsPage";
import AssignCoursesPage from "./pages/admin/AssignCoursesPage";
import LmsManagementPage from "./pages/admin/LmsManagementPage";
import ModuleManagementPage from "./pages/admin/ModuleManagementPage";
import ModuleDetailPage from "./pages/admin/ModuleDetailPage";
import LessonDetailPage from "./pages/admin/LessonDetailPage";
import QuizManagementPage from "./pages/admin/QuizManagementPage";
import QuizDetailPage from "./pages/admin/QuizDetailPage";
import TeacherDashboard from "./pages/teacher/DashboardPage";
import MyStudentsPage from "./pages/teacher/MyStudentsPage";
import StudentDashboard from "./pages/student/DashboardPage";
import CertificatesPage from "./pages/student/CertificatesPage";
import CertificateViewPage from "./pages/student/CertificateViewPage";
import MyCoursesPage from "./pages/shared/MyCoursesPage";
import CourseDetailsPage from "./pages/shared/CourseDetailsPage";
import CareerExplorerPathwayPage from "./pages/shared/CareerExplorerPathwayPage";
import LearnerLessonPage from "./pages/shared/LearnerLessonPage";
import QuizAttemptPage from "./pages/shared/QuizAttemptPage";
import VideoLibraryPage from "./pages/shared/VideoLibraryPage";
import SurveysPage from "./pages/shared/SurveysPage";
import SurveyDetailPage from "./pages/admin/SurveyDetailPage";
import ProfilePage from "./pages/shared/ProfilePage";
import NotificationsPage from "./pages/shared/NotificationsPage";
import MessagesPage from "./pages/shared/MessagesPage";

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="iteach-theme" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={getBasename()}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/recover-password" element={<RecoverPasswordPage />} />

            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute roles={["admin"]}><TeachersPage /></ProtectedRoute>} />
            <Route path="/admin/teachers/:teacherId" element={<ProtectedRoute roles={["admin"]}><AssignCoursesPage /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute roles={["admin"]}><StudentsPage /></ProtectedRoute>} />
            <Route path="/admin/lms-management" element={<ProtectedRoute roles={["admin"]}><LmsManagementPage /></ProtectedRoute>} />
            <Route path="/admin/module-management" element={<ProtectedRoute roles={["admin"]}><ModuleManagementPage /></ProtectedRoute>} />
            <Route path="/admin/module-management/:moduleId" element={<ProtectedRoute roles={["admin"]}><ModuleDetailPage /></ProtectedRoute>} />
            <Route path="/admin/module-management/:moduleId/lesson/:lessonId" element={<ProtectedRoute roles={["admin"]}><LessonDetailPage /></ProtectedRoute>} />
            <Route path="/admin/quiz-management" element={<ProtectedRoute roles={["admin"]}><QuizManagementPage /></ProtectedRoute>} />
            <Route path="/admin/quiz-management/:quizId" element={<ProtectedRoute roles={["admin"]}><QuizDetailPage /></ProtectedRoute>} />
            <Route path="/admin/video-library-management" element={<ProtectedRoute roles={["admin"]}><VideoLibraryPage /></ProtectedRoute>} />
            <Route path="/admin/surveys-evaluations" element={<ProtectedRoute roles={["admin"]}><SurveysPage /></ProtectedRoute>} />
            <Route path="/admin/surveys-evaluations/:surveyId" element={<ProtectedRoute roles={["admin"]}><SurveyDetailPage /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute roles={["admin"]}><MessagesPage /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute roles={["admin"]}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/admin/my-profile" element={<ProtectedRoute roles={["admin"]}><ProfilePage /></ProtectedRoute>} />

            <Route path="/teacher/dashboard" element={<ProtectedRoute roles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/my-courses" element={<ProtectedRoute roles={["teacher"]}><MyCoursesPage /></ProtectedRoute>} />
            <Route path="/teacher/my-courses/:courseId" element={<ProtectedRoute roles={["teacher"]}><CourseDetailsPage /></ProtectedRoute>} />
            <Route path="/teacher/my-courses/:courseId/career-explorer-pathway" element={<ProtectedRoute roles={["teacher"]}><CareerExplorerPathwayPage /></ProtectedRoute>} />
            <Route path="/teacher/my-courses/:courseId/lesson/:moduleId/:lessonId" element={<ProtectedRoute roles={["teacher"]}><LearnerLessonPage /></ProtectedRoute>} />
            <Route path="/teacher/my-courses/:courseId/quiz/:quizId" element={<ProtectedRoute roles={["teacher"]}><QuizAttemptPage /></ProtectedRoute>} />
            <Route path="/teacher/my-students" element={<ProtectedRoute roles={["teacher"]}><MyStudentsPage /></ProtectedRoute>} />
            <Route path="/teacher/video-library" element={<ProtectedRoute roles={["teacher"]}><VideoLibraryPage /></ProtectedRoute>} />
            <Route path="/teacher/surveys" element={<ProtectedRoute roles={["teacher"]}><SurveysPage /></ProtectedRoute>} />
            <Route path="/teacher/messages" element={<ProtectedRoute roles={["teacher"]}><MessagesPage /></ProtectedRoute>} />
            <Route path="/teacher/notifications" element={<ProtectedRoute roles={["teacher"]}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/teacher/my-profile" element={<ProtectedRoute roles={["teacher"]}><ProfilePage /></ProtectedRoute>} />

            <Route path="/student/dashboard" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/learning" element={<ProtectedRoute roles={["student"]}><MyCoursesPage /></ProtectedRoute>} />
            <Route path="/student/learning/:courseId" element={<ProtectedRoute roles={["student"]}><CourseDetailsPage /></ProtectedRoute>} />
            <Route path="/student/learning/:courseId/career-explorer-pathway" element={<ProtectedRoute roles={["student"]}><CareerExplorerPathwayPage /></ProtectedRoute>} />
            <Route path="/student/learning/:courseId/lesson/:moduleId/:lessonId" element={<ProtectedRoute roles={["student"]}><LearnerLessonPage /></ProtectedRoute>} />
            <Route path="/student/learning/:courseId/quiz/:quizId" element={<ProtectedRoute roles={["student"]}><QuizAttemptPage /></ProtectedRoute>} />
            <Route path="/student/learning/:courseId/certificate" element={<ProtectedRoute roles={["student"]}><CertificateViewPage /></ProtectedRoute>} />
            <Route path="/student/certificates" element={<ProtectedRoute roles={["student"]}><CertificatesPage /></ProtectedRoute>} />
            <Route path="/student/video-library" element={<ProtectedRoute roles={["student"]}><VideoLibraryPage /></ProtectedRoute>} />
            <Route path="/student/surveys" element={<ProtectedRoute roles={["student"]}><SurveysPage /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute roles={["student"]}><MessagesPage /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute roles={["student"]}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/student/my-profile" element={<ProtectedRoute roles={["student"]}><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
