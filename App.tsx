import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './pages/Marketplace';
import { AuthProvider } from './services/authContext';
import { Toaster } from 'react-hot-toast';
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
import DashboardRouter from './pages/DashboardRouter';
const CreateListing = React.lazy(() => import('./pages/CreateListing'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Community = React.lazy(() => import('./pages/Community'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col">
          {/* Top Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Marketplace />} />
                <Route path="/listing/:id" element={<ProductDetails />} />
                <Route path="/community" element={<Community />} />
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/create" element={<CreateListing />} />
                <Route path="/edit/:id" element={<CreateListing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>

          {/* Simple Footer */}
          <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              <p>&copy; {new Date().getFullYear()} Solerz. Malaysia's Premier Solar Exchange.</p>
            </div>
          </footer>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#334155',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' }
              }
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;