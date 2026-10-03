import React, { useState } from 'react';
import { Complaint, ComplaintUpdate } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { GCBLogo } from '../common/GCBLogo';
import { UserAvatar } from '../common/UserAvatar';
import { 
  X, 
  CheckCircle, 
  Clock, 
  Send, 
  Building2, 
  Calendar, 
  ShieldAlert, 
  Lock, 
  User, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: number;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  onClose,
}) => {
  const { currentUser, dbVersion, triggerRefresh, showToast } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch complaint with access validation
  let complaint: Complaint | null = null;
  let updates: ComplaintUpdate[] = [];
  let accessError: string | null = null;

  try {
    complaint = db.getComplaintById(complaintId, currentUser);
    if (complaint) {
      // Crucial: getComplaintUpdates strips internal notes for role 'customer'
      updates = db.getComplaintUpdates(complaintId, currentUser.role);
    }
  } catch (err: any) {
    accessError = err?.message || 'Access Denied';
  }

  const handleSendCustomerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !complaint) return;

    setIsSending(true);
    try {
      db.addUpdate({
        complaintId: complaint.id,
        author: currentUser,
        comments: replyText.trim(),
        isInternal: false,
        updateType: 'customer_message',
      });
      setReplyText('');
      triggerRefresh();
      showToast('Your message was added to the case investigation thread.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (accessError || !complaint) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-200">
          <div className="flex items-center space-x-3 text-rose-600 mb-3">
            <ShieldAlert className="w-8 h-8" />
            <h3 className="font-bold text-lg text-slate-900">Access Denied (403 Forbidden)</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            {accessError || 'You do not have permission to view this complaint record.'}
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 mb-4">
            <span className="font-semibold text-slate-800">Security Rule Enforced:</span> OWASP Top 10 Access Control requires customer data isolation. Customers can only view records belonging to their own customer ID.
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // 3-Stage Workflow status progress
  const getStepStatus = (step: 'Submitted' | 'In Progress' | 'Resolved') => {
    if (complaint.status === 'Resolved') return 'completed';
    if (complaint.status === 'In Progress') {
      if (step === 'Submitted') return 'completed';
      if (step === 'In Progress') return 'active';
      return 'pending';
    }
    // Submitted
    if (step === 'Submitted') return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
              <GCBLogo size="sm" showText={false} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {complaint.referenceNumber}
                </span>
                <span className="text-xs text-slate-400">• {complaint.category}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1 line-clamp-1">{complaint.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Progress Tracker (3 Stages as requested in specification) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-3">
              Complaint Lifecycle Progress
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {/* Step 1: Submitted */}
              <div
                className={`p-3 rounded-lg border flex flex-col ${
                  getStepStatus('Submitted') === 'completed' || getStepStatus('Submitted') === 'active'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1. Submitted</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Step 2: In Progress */}
              <div
                className={`p-3 rounded-lg border flex flex-col ${
                  getStepStatus('In Progress') === 'completed'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                    : getStepStatus('In Progress') === 'active'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">2. In Progress</span>
                  {getStepStatus('In Progress') === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {complaint.assignedStaffName ? `Assigned: ${complaint.assignedStaffName}` : 'Under Review'}
                </span>
              </div>

              {/* Step 3: Resolved */}
              <div
                className={`p-3 rounded-lg border flex flex-col ${
                  getStepStatus('Resolved') === 'completed'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">3. Resolved</span>
                  <FileCheck
                    className={`w-4 h-4 ${
                      getStepStatus('Resolved') === 'completed' ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'Awaiting Closure'}
                </span>
              </div>
            </div>
          </div>

          {/* Incident Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Original Grievance Particulars</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  complaint.priority === 'High'
                    ? 'bg-rose-100 text-rose-800'
                    : complaint.priority === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Priority: {complaint.priority}
              </span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {complaint.description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Incident: {complaint.incidentDate}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{complaint.branchAffected}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Handler: {complaint.assignedStaffName || 'Triage Queue'}</span>
              </div>
            </div>
          </div>

          {/* Resolution Outcome (if resolved) */}
          {complaint.status === 'Resolved' && complaint.resolutionNote && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Official Bank Resolution Outcome</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">{complaint.resolutionNote}</p>
              <p className="text-[10px] text-emerald-700 mt-2 font-mono">
                Case formally closed on: {new Date(complaint.resolvedAt!).toLocaleString()}
              </p>
            </div>
          )}

          {/* Audit Timeline / Updates Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900">
                Investigation Timeline & Updates ({updates.length})
              </h4>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Internal staff notes restricted by OWASP policy
              </span>
            </div>

            <div className="space-y-3">
              {updates.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs ${
                    item.authorRole === 'customer'
                      ? 'bg-amber-50/60 border-amber-200'
                      : item.updateType === 'status_change'
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <UserAvatar
                        user={{
                          fullName: item.authorName,
                          role: item.authorRole,
                        }}
                        size="xs"
                      />
                      <span className="font-semibold text-slate-900">{item.authorName}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.2 rounded bg-white border border-slate-200">
                        {item.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{item.comments}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reply Box */}
          {complaint.status !== 'Resolved' ? (
            <form onSubmit={handleSendCustomerMessage} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Provide Clarification / Message to Assigned Officer
              </label>
              <textarea
                rows={2}
                placeholder="Type additional information, transaction reference, or reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-slate-500 bg-slate-100 rounded-lg">
              This case is marked resolved. To reopen or dispute this outcome, please contact your branch manager.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Unique ID: {complaint.referenceNumber}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
