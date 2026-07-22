import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import { ThemeProvider } from './context/ThemeContext';

// Route Lazy Loading for Lightning-Fast Initial Page Loads
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Discussion = lazy(() => import('./pages/Discussion'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span>Loading Solerz Arena...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 font-sans flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950 transition-colors">
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Main Application Area with Suspense */}
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkin" element={<CheckIn />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/discussion" element={<Discussion />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #1e293b',
                borderRadius: '12px',
              }
            }}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
