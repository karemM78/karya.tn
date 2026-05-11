import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PostAdForm from './pages/PostAdForm';
import PropertyDetails from './pages/PropertyDetails';
import PublicProfile from './pages/PublicProfile';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import EditProfile from './pages/EditProfile';
import HowItWorks from './pages/HowItWorks';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminListings from './pages/AdminListings';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const OwnerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'owner' && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ 
      duration: 0.36, 
      ease: [0.2, 0, 0, 1] 
    }}
  >
    {children}
  </motion.div>
);

const MainApp = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background text-on-surface dark:text-on-background flex flex-col transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/how-it-works" element={<PageWrapper><HowItWorks /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><GuestRoute><Login /></GuestRoute></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><GuestRoute><Signup /></GuestRoute></PageWrapper>} />
            <Route path="/forgot-password" element={<PageWrapper><GuestRoute><ForgotPassword /></GuestRoute></PageWrapper>} />
            <Route path="/reset-password/:token" element={<PageWrapper><GuestRoute><ResetPassword /></GuestRoute></PageWrapper>} />
            <Route path="/dashboard" element={
              <PageWrapper>
                <OwnerRoute>
                  <Dashboard />
                </OwnerRoute>
              </PageWrapper>
            } />
            <Route path="/post-ad" element={
              <PageWrapper>
                <OwnerRoute>
                  <PostAdForm />
                </OwnerRoute>
              </PageWrapper>
            } />
            <Route path="/edit-ad/:id" element={
              <PageWrapper>
                <OwnerRoute>
                  <PostAdForm />
                </OwnerRoute>
              </PageWrapper>
            } />
            <Route path="/property/:id" element={<PageWrapper><PropertyDetails /></PageWrapper>} />
            <Route path="/profile/:id" element={<PageWrapper><PublicProfile /></PageWrapper>} />
            <Route path="/inbox" element={
              <PageWrapper>
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              </PageWrapper>
            } />
            <Route path="/chat/:userId" element={
              <PageWrapper>
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              </PageWrapper>
            } />
            <Route path="/edit-profile" element={
              <PageWrapper>
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNav />
      <footer className="bg-surface border-t border-outline/10 py-12 px-6 text-center transition-theme">
        <span className="font-manrope text-2xl font-black text-primary">karya.tn</span>
        <p className="text-sm text-on-surface-variant mt-3 font-medium">© 2024 karya.tn. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
                <Route path="*" element={<MainApp />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
