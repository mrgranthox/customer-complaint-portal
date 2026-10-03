/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { TrackByReferenceModal } from './components/customer/TrackByReferenceModal';
import { ComplaintSubmissionModal } from './components/customer/ComplaintSubmissionModal';
import { StaffWorkstation } from './components/staff/StaffWorkstation';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { UnassignedTriage } from './components/manager/UnassignedTriage';
import { ReportsView } from './components/manager/ReportsView';
import { EvaluationLab } from './components/evaluation/EvaluationLab';
import { DatabaseViewer } from './components/schema/DatabaseViewer';
import { UserGuide } from './components/common/UserGuide';
import { ProfilePage } from './components/profile/ProfilePage';
import { GCBLogo } from './components/common/GCBLogo';
import { SignInPage } from './components/auth/SignInPage';
import { ToastContainer } from './components/common/ToastContainer';
import { ShieldCheck, Info, User, Briefcase } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('customer_dashboard');
  const [isLodgingModalOpen, setIsLodgingModalOpen] = useState(false);

  const commonTabs = ['user_profile', 'schema_erd', 'evaluation_lab', 'user_guide'];

  const getDefaultDashboardTab = () => {
    if (currentUser.role === 'customer') return 'customer_dashboard';
    if (currentUser.role === 'staff') return 'staff_queue';
    return 'manager_dashboard';
  };

  // Automatically adjust default tab when role is switched
  useEffect(() => {
    if (!isAuthenticated) return;
    if (commonTabs.includes(activeTab)) return;

    if (currentUser.role === 'customer') {
      if (!['customer_dashboard', 'submit_complaint', 'track_reference'].includes(activeTab)) {
        setActiveTab('customer_dashboard');
      }
    } else if (currentUser.role === 'staff') {
      if (!['staff_queue', 'staff_all_cases'].includes(activeTab)) {
        setActiveTab('staff_queue');
      }
    } else if (currentUser.role === 'manager') {
      if (!['manager_dashboard', 'manager_unassigned', 'manager_reports'].includes(activeTab)) {
        setActiveTab('manager_dashboard');
      }
    }
  }, [currentUser.role, isAuthenticated]);

  // If user is signed out, display official institutional login page
  if (!isAuthenticated) {
    return (
      <>
        <SignInPage />
        <ToastContainer />
      </>
    );
  }

  // Handle lodging modal shortcut tab
  const handleTabChange = (tab: string) => {
    if (tab === 'submit_complaint') {
      setIsLodgingModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Floating Toast Notification Container */}
      <ToastContainer />

      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dynamic Tab Views */}
        {activeTab === 'customer_dashboard' && <CustomerDashboard />}
        {activeTab === 'track_reference' && <TrackByReferenceModal />}

        {activeTab === 'staff_queue' && <StaffWorkstation showAllBranch={false} />}
        {activeTab === 'staff_all_cases' && <StaffWorkstation showAllBranch={true} />}

        {activeTab === 'manager_dashboard' && <ManagerDashboard />}
        {activeTab === 'manager_unassigned' && <UnassignedTriage />}
        {activeTab === 'manager_reports' && <ReportsView />}

        {activeTab === 'user_profile' && (
          <ProfilePage onBack={() => setActiveTab(getDefaultDashboardTab())} />
        )}

        {activeTab === 'evaluation_lab' && <EvaluationLab />}
        {activeTab === 'schema_erd' && <DatabaseViewer />}
        {activeTab === 'user_guide' && <UserGuide />}
      </main>

      {/* Global Lodge Modal if triggered from navigation */}
      {isLodgingModalOpen && (
        <ComplaintSubmissionModal
          onClose={() => setIsLodgingModalOpen(false)}
          onComplaintCreated={() => {
            setIsLodgingModalOpen(false);
            setActiveTab('customer_dashboard');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            {/* Bank Branding & System Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1.5 sm:gap-2.5">
              <div className="flex items-center space-x-2">
                <GCBLogo size="sm" showText={false} className="w-5 h-5 shrink-0" />
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">GCB BANK PLC</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-slate-600 font-medium text-xs">Customer Complaint Tracking System (CCTS)</span>
            </div>

            {/* Compliance & Standards Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-2 gap-y-1.5 text-[11px] text-slate-500">
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">ISO 9241 Accessible</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">OWASP 2025 Enforced</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Bank of Ghana Regulated</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} GCB Bank PLC. All rights reserved. Licensed by Bank of Ghana.
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>24/7 Helpline: <strong className="text-slate-600">0800 422 422</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>complaints@gcb.com.gh</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
