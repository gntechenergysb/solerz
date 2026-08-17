import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PanelsList from './pages/PanelsList';

const PanelDetail = React.lazy(() => import('./pages/PanelDetail'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col">
        <Navbar />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<PanelsList />} />
              <Route path="/panels" element={<PanelsList />} />
              <Route path="/panels/:slug" element={<PanelDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 dark:text-slate-500 text-sm">
            <p className="mb-2">
              &copy; {new Date().getFullYear()} Solerz. Photovoltaic hardware data platform.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              Data sourced from CEC modules database. For reference only.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;