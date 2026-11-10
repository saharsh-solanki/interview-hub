import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MySchedulePage from "./pages/MySchedulePage";
import AllSchedulesPage from "./pages/AllSchedulesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ManageProfilesPage from "./pages/ManageProfilesPage";
import ManageInterviewersPage from "./pages/ManageInterviewersPage";
import ManageCompaniesPage from "./pages/ManageCompaniesPage";
import ManageRoundsPage from "./pages/ManageRoundsPage";
import ScheduleInterviewPage from "./pages/ScheduleInterviewPage";
import QuestionsPage from "./pages/QuestionsPage";

function StaffRoute({ children }) {
  const { isStaff } = useAuth();
  if (!isStaff) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MySchedulePage />} />
        <Route path="/all" element={<AllSchedulesPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/admin" element={<StaffRoute><AdminDashboardPage /></StaffRoute>} />
        <Route path="/admin/profiles" element={<StaffRoute><ManageProfilesPage /></StaffRoute>} />
        <Route path="/admin/interviewers" element={<StaffRoute><ManageInterviewersPage /></StaffRoute>} />
        <Route path="/admin/companies" element={<StaffRoute><ManageCompaniesPage /></StaffRoute>} />
        <Route path="/admin/rounds" element={<StaffRoute><ManageRoundsPage /></StaffRoute>} />
        <Route path="/admin/schedule" element={<StaffRoute><ScheduleInterviewPage /></StaffRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
