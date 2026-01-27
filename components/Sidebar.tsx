import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { LayoutDashboard, ShoppingBag, List, Settings, LogOut, Sun, LogIn, PlusCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
        isActive(to)
          ? 'bg-emerald-50 text-emerald-600 font-medium'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive(to) ? 'text-emerald-500' : 'text-slate-400'}`} />
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-50 px-4 h-16 flex items-center justify-between">
         <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Solerz</span>
         </Link>
         {/* Simple mobile menu trigger could go here */}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-40">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm shadow-emerald-200">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Solerz</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col py-6 px-3 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Platform</p>
          
          <NavItem to="/" icon={ShoppingBag} label="Marketplace" />
          
          {user && (
            <>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              {/* Fake links for demo completeness */}
              <div className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer">
                <List className="h-5 w-5 text-slate-400" />
                <span>My Listings</span>
              </div>
              <div className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer">
                <Settings className="h-5 w-5 text-slate-400" />
                <span>Settings</span>
              </div>
            </>
          )}

          {user?.is_verified && (
             <div className="mt-6 px-3">
                <Link to="/create">
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all shadow-lg shadow-slate-200">
                     <PlusCircle className="h-4 w-4" />
                     <span>Post Asset</span>
                  </button>
                </Link>
             </div>
          )}
        </div>

        {/* User / Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {user ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                 <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                    {user.company_name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.company_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                 </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 text-sm text-slate-500 hover:text-red-600 py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center space-x-2 shadow-sm">
                <LogIn className="h-4 w-4" />
                <span>Partner Login</span>
              </button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;