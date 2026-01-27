import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import Login from './pages/Login';
import { AuthProvider } from './services/authContext';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
          {/* Top Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/listing/:id" element={<ProductDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateListing />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Simple Footer */}
          <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
             <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
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
      </HashRouter>
    </AuthProvider>
  );
};

export default App;