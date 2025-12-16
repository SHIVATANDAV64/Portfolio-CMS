import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DashboardLayout } from './components/DashboardLayout';

// Visual Section Editors
import { HeroEditor } from './pages/editors/HeroEditor';
import { AboutEditor } from './pages/editors/AboutEditor';
import { WorkEditor } from './pages/editors/WorkEditor';
import { SkillsEditor } from './pages/editors/SkillsEditor';
import { ExperienceEditor } from './pages/editors/ExperienceEditor';
import { ServicesEditor } from './pages/editors/ServicesEditor';
import { SocialLinksEditor } from './pages/editors/SocialLinksEditor';
import { MessagesViewer } from './pages/editors/MessagesViewer';

import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirects if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard home */}
        <Route index element={<Dashboard />} />

        {/* Visual Section Editors */}
        <Route path="hero" element={<HeroEditor />} />
        <Route path="about" element={<AboutEditor />} />
        <Route path="projects" element={<WorkEditor />} />
        <Route path="skills" element={<SkillsEditor />} />
        <Route path="experience" element={<ExperienceEditor />} />
        <Route path="services" element={<ServicesEditor />} />
        <Route path="social_links" element={<SocialLinksEditor />} />
        <Route path="messages" element={<MessagesViewer />} />
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
