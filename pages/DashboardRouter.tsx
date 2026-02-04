import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import Dashboard from './Dashboard';
import BuyerDashboard from './BuyerDashboard';

const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading && !isAuthenticated) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user?.role === 'BUYER') return <BuyerDashboard />;
  return <Dashboard />;
};

export default DashboardRouter;
