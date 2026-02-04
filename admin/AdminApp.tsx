import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/services/authContext';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from './AdminLogin';

const AdminApp: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col">
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#334155',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AdminApp;
