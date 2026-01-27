import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { Sun, LogIn, PlusCircle, LayoutDashboard, LogOut, ChevronDown, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm group-hover:bg-emerald-600 transition-colors">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Solerz</span>
          </Link>

          {/* Center: Optional Navigation Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-slate-900 border-b-2 border-emerald-500 py-5">
              Marketplace
            </Link>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              Find Suppliers
            </a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              Community
            </a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            
            {user ? (
              <>
                {/* Create Listing Button (Visible if Verified) */}
                {user.is_verified && (
                  <Link to="/create" className="hidden sm:flex">
                     <button className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                        <PlusCircle className="h-4 w-4" />
                        <span>Post Asset</span>
                     </button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                   <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 focus:outline-none"
                   >
                      <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                         {user.company_name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.company_name}</span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                   </button>

                   {/* Dropdown Menu */}
                   {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                         <div className="px-4 py-3 border-b border-slate-50">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.company_name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                         </div>
                         <Link 
                            to="/dashboard" 
                            className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                            onClick={() => setIsProfileOpen(false)}
                         >
                            <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                         </Link>
                         <button 
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                         >
                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                         </button>
                      </div>
                   )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                 <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">
                    Log In
                 </Link>
                 <Link to="/login">
                    <button className="flex items-center space-x-1 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
                       <User className="h-4 w-4" />
                       <span>Partner Access</span>
                    </button>
                 </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;