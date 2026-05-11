import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorsPage from './pages/DonorsPage';
import RequestsPage from './pages/RequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ConnectionRequestsPage from './pages/ConnectionRequestsPage';
import AdminPage from './pages/AdminPage';
import CompatibilityPage from './pages/CompatibilityPage';
import ThalassemiaPage from './pages/ThalassemiaPage';
import ChatWidget from './components/ui/ChatWidget';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #F3F4F6',
        borderTopColor: '#FF3B30',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/connections" element={<ProtectedRoute><ConnectionRequestsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/compatibility" element={<CompatibilityPage />} />
          <Route path="/thalassemia" element={<ProtectedRoute><ThalassemiaPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
