import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GCBLogo } from './GCBLogo';
import { UserAvatar } from './UserAvatar';
import { 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  User, 
  AlertTriangle,
  Briefcase,
  LogOut,
  UserCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, signOut, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'customer':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Customer Portal',
          icon: <User className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'staff':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          label: 'Staff Resolution Officer',
          icon: <Briefcase className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'manager':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          label: 'Branch Manager Oversight',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          label: role,
          icon: <User className="w-3.5 h-3.5" />,
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Main Topbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Bank Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-12 rounded-xl bg-white flex items-center justify-center p-1 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors shrink-0">
              <GCBLogo size="sm" />
            </div>
            <div>
              <p className="text-xs text-slate-700 font-semibold hidden sm:block">
                Customer Complaint Tracking System • Digital Quality Assurance
              </p>
            </div>
          </div>

          {/* Authenticated User Profile & Session Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div 
              onClick={() => setActiveTab('user_profile')}
              title="Click to view and edit your profile"
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <UserAvatar
                user={currentUser}
                size="sm"
                showRoleDot
              />
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badge.bg}`}>
                    {badge.icon}
                    <span className="hidden sm:inline">{badge.label}</span>
                    <span className="sm:hidden capitalize">{currentUser.role}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded hidden md:inline">
                    {currentUser.branchCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Action Buttons */}
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
              {/* Profile Link Button */}
              <button
                onClick={() => setActiveTab('user_profile')}
                title="View & manage your profile"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs flex items-center gap-1.5 shrink-0 transition-all font-semibold shadow-2xs cursor-pointer ${
                  activeTab === 'user_profile'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-white'
                }`}
              >
                <UserCircle className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-xs">Profile</span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                title="Sign out of your active session"
                className="p-1.5 sm:p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 text-xs flex items-center gap-1.5 shrink-0 transition-colors font-semibold shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1.5 scrollbar-none">
          <nav className="flex space-x-1 shrink-0" aria-label="Tabs">
            {currentUser.role === 'customer' && (
              <>
                <button
                  onClick={() => setActiveTab('customer_dashboard')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'customer_dashboard'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  My Complaints & Disputes
                </button>
                <button
                  onClick={() => setActiveTab('submit_complaint')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'submit_complaint'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  + Lodge New Complaint
                </button>
                <button
                  onClick={() => setActiveTab('track_reference')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'track_reference'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Track by Reference #
                </button>
              </>
            )}

            {currentUser.role === 'staff' && (
              <>
                <button
                  onClick={() => setActiveTab('staff_queue')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'staff_queue'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  My Assigned Queue
                </button>
                <button
                  onClick={() => setActiveTab('staff_all_cases')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'staff_all_cases'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Branch Case Register
                </button>
              </>
            )}

            {currentUser.role === 'manager' && (
              <>
                <button
                  onClick={() => setActiveTab('manager_dashboard')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'manager_dashboard'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Executive KPI Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('manager_unassigned')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'manager_unassigned'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Unassigned Triage Queue
                </button>
                <button
                  onClick={() => setActiveTab('manager_reports')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'manager_reports'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  SLA & Caseload Reports
                </button>
              </>
            )}
          </nav>

          {/* Quick Context Indicator */}
          <div className="text-[11px] text-slate-500 font-mono hidden md:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Branch: <span className="font-semibold text-slate-700">{currentUser.branchCode}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
