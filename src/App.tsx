import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Discussion from './pages/Discussion';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Main Application Area */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/discussion" element={<Discussion />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
  );
};

export default App;
