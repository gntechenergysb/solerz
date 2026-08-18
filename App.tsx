import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { CompareProvider } from './contexts/CompareContext';

const PanelsList = React.lazy(() => import('./pages/PanelsList'));
const PanelDetail = React.lazy(() => import('./pages/PanelDetail'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CompareProvider>
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col">
          <Navbar />

          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Homepage — lightweight landing */}
                <Route path="/" element={<HomePage />} />

                {/* Solar Panels */}
                <Route path="/solar-panels" element={<PanelsList />} />
                <Route path="/solar-panels/:slug" element={<PanelDetail />} />

                {/* Versus Comparison */}
                <Route path="/compare/:slugs" element={<ComparePage />} />

                {/* Legacy redirects */}
                <Route path="/panels" element={<Navigate to="/solar-panels" replace />} />
                <Route path="/panels/:slug" element={<LegacyPanelRedirect />} />

                {/* Catch-all */}
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
      </CompareProvider>
    </BrowserRouter>
  );
};

/** Redirect legacy /panels/:slug to /solar-panels/:slug */
const LegacyPanelRedirect: React.FC = () => {
  const slug = window.location.pathname.split('/panels/')[1] || '';
  return <Navigate to={`/solar-panels/${slug}`} replace />;
};

export default App;