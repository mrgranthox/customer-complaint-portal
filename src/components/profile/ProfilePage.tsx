import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { UserAvatar } from '../common/UserAvatar';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowLeft,
  KeyRound,
  Bell
} from 'lucide-react';

interface ProfilePageProps {
  onBack?: () => void;
}

const BANK_BRANCHES = [
  { code: 'ACC-01', name: 'Accra High Street Commercial Branch' },
  { code: 'ACC-HQ', name: 'Head Office General Operations & Triage' },
  { code: 'KMS-02', name: 'Kumasi Harper Road Regional Branch' },
  { code: 'TKR-03', name: 'Takoradi Harbour Commercial Branch' },
  { code: 'TML-04', name: 'Tamale Main Central Branch' },
  { code: 'DIG-01', name: 'Digital Banking Operations Desk' },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { currentUser, updateUserProfile, changePassword, showToast } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized with currentUser
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [branchCode, setBranchCode] = useState(currentUser.branchCode);
  const [accountNumber, setAccountNumber] = useState(currentUser.accountNumber || '');
  const [department, setDepartment] = useState(currentUser.department || (currentUser.role === 'customer' ? 'Retail Banking' : 'Card Operations'));
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || (currentUser.role === 'customer' ? 'Account Holder' : currentUser.role === 'staff' ? 'Resolution Officer' : 'Branch Manager'));
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser.avatarUrl);

  // Notification toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(currentUser.notificationsEnabled ?? true);
  const [smsNotifications, setSmsNotifications] = useState(currentUser.smsNotifications ?? true);

  // Password reset simulation state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'security'>('details');

  // Related stats
  const allComplaints = db.getAllComplaints();
  const userComplaints = currentUser.role === 'customer' 
    ? allComplaints.filter(c => c.customerId === currentUser.id)
    : allComplaints.filter(c => c.assignedStaffId === currentUser.id);

  const resolvedCount = userComplaints.filter(c => c.status === 'Resolved').length;

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image file too large. Please select a photo under 2MB.', 'error', 'File Size Limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        showToast('Profile photo updated. Remember to click "Save Profile Changes" to persist.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save changes end-to-end
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      showToast('Full name must be at least 2 characters long.', 'error');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    const updates = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      branchCode: branchCode.trim(),
      accountNumber: accountNumber.trim() || undefined,
      avatarUrl: avatarUrl ? avatarUrl.trim() : '',
      department: department.trim(),
      jobTitle: jobTitle.trim(),
      bio: bio.trim(),
      notificationsEnabled,
      smsNotifications,
    };

    const res = await updateUserProfile(updates);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  // Password update handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current account password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Password credentials securely verified, updated, and saved to your account.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation Bar with Back Button */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-xs text-slate-500 font-mono">User Profile & ID Management</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Profile Identity Bar */}
        <div className="p-6 relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
            {/* User Avatar with Camera Upload */}
            <div className="relative group shrink-0">
              <UserAvatar
                user={{
                  fullName,
                  email,
                  avatarUrl,
                  role: currentUser.role,
                }}
                size="2xl"
                showRoleDot
                className="ring-4 ring-slate-100 shadow-md"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Photo"
                className="absolute -bottom-1 -right-1 p-2 bg-slate-900 hover:bg-amber-600 text-white rounded-full shadow-md transition-colors cursor-pointer ring-2 ring-white"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{fullName}</h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${
                    currentUser.role === 'customer'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : currentUser.role === 'staff'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}
                >
                  {currentUser.role === 'customer'
                    ? 'Customer Account'
                    : currentUser.role === 'staff'
                    ? 'Resolution Officer'
                    : 'Branch Manager'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  ID: #{currentUser.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                <span>{email}</span>
                <span>•</span>
                <span>Branch: <strong className="text-slate-700">{branchCode}</strong></span>
                {accountNumber && (
                  <>
                    <span>•</span>
                    <span>Acc: <span className="font-mono text-slate-700 font-semibold">{accountNumber}</span></span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Section Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/60 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('details')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'details'
                ? 'border-amber-600 text-amber-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Particulars</span>
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'security'
                ? 'border-amber-600 text-amber-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security & Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeSubTab === 'details' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Core Personal Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Personal & Contact Information</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Editable</span>
              </h2>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telephone Contact (Ghana E.164)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Branch Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Branch Location
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 cursor-pointer"
                  >
                    {BANK_BRANCHES.map(b => (
                      <option key={b.code} value={b.code}>
                        [{b.code}] {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Card: Institutional / Banking Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Account & Portfolio Specifications</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institutional</span>
              </h2>

              {/* Account Number (for customer) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GCB Bank Account Number (13-digits)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="1041029482101"
                    className="w-full text-xs font-mono pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Department & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Unit
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Bio & Professional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biographical & Professional Notes
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Record customer preferences, contact notes, or staff portfolio details..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              {/* Security Compliance Seal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  Profile data is audited under Bank of Ghana Customer Due Diligence (CDD) and Data Protection Act (Act 843).
                </span>
              </div>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile changes saved and persisted to database successfully!</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Persisting Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Security & Password Sub-Tab */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleUpdatePassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Change Portal Access Password</span>
                <KeyRound className="w-4 h-4 text-purple-600" />
              </h2>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (default: password123)"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Update Password Credentials
              </button>
            </form>

            {/* Security Overview & Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Security & Session Telemetry</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600">Active Session Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Authenticated & Encrypted
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600">Session IP Address</span>
                  <span className="font-mono text-slate-800 font-semibold">127.0.0.1 (Secure Loopback)</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600">Role Enforcement Level</span>
                  <span className="font-semibold text-purple-700 uppercase">{currentUser.role}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600">Complaints Handled / Lodged</span>
                  <span className="font-black text-slate-900">{userComplaints.length} records</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600">Resolved Cases Rate</span>
                  <span className="font-bold text-emerald-700">
                    {userComplaints.length > 0
                      ? `${Math.round((resolvedCount / userComplaints.length) * 100)}%`
                      : '100%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Preferences Notification Strip */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Notification Dispatches</span>
              <Bell className="w-4 h-4 text-amber-600" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-xs text-slate-900">SMS Notification Alerts</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Receive SMS alerts whenever progress notes are posted.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={e => setSmsNotifications(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-xs text-slate-900">Email Notification Letters</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Send official resolution letters directly to {email}.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={e => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
