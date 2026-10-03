import React, { useState } from 'react';
import { Complaint, ComplaintStatus, ComplaintUpdate } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { GCBLogo } from '../common/GCBLogo';
import { UserAvatar } from '../common/UserAvatar';
import {
  X,
  ShieldCheck,
  Lock,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  MessageSquare,
  FileCheck2,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface CaseInvestigationModalProps {
  complaintId: number;
  onClose: () => void;
}

export const CaseInvestigationModal: React.FC<CaseInvestigationModalProps> = ({
  complaintId,
  onClose,
}) => {
  const { currentUser, triggerRefresh, showToast } = useAuth();

  const [noteType, setNoteType] = useState<'customer_notice' | 'internal_note'>('internal_note');
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Status progression state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const complaint = db.getComplaintById(complaintId, currentUser);
  // Staff sees ALL updates including internal notes
  const updates = complaint ? db.getComplaintUpdates(complaintId, currentUser.role) : [];

  if (!complaint) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm text-center">
          <p className="text-sm font-bold text-slate-800">Complaint record not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Ownership & authorization checks
  const isAssignedToCurrentOfficer = complaint.assignedStaffId === currentUser.id;
  const isUnassigned = complaint.assignedStaffId === null;
  const isAssignedToOtherOfficer = !isUnassigned && !isAssignedToCurrentOfficer && currentUser.role === 'staff';
  const isManager = currentUser.role === 'manager';
  const canModifyWorkflow = isAssignedToCurrentOfficer || isManager;

  // Handle claiming unassigned case
  const handleClaimCase = async (startInvestigation: boolean = true) => {
    setIsClaiming(true);
    try {
      try {
        await fetch(`/api/complaints/${complaint.id}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({ startInvestigation }),
        });
      } catch {
        // Fallback to local DB
      }

      db.claimComplaint({
        complaintId: complaint.id,
        staff: currentUser,
        startInvestigation,
      });

      triggerRefresh();
      showToast(
        `Dispute ${complaint.referenceNumber} claimed into your personal queue.${startInvestigation ? ' Status updated to In Progress.' : ''}`,
        'success',
        'Case Claimed'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to claim case', 'error', 'Claim Failed');
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle adding an update or internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmittingNote(true);
    const isInternal = noteType === 'internal_note';
    const comments = noteText.trim();

    try {
      try {
        await fetch(`/api/complaints/${complaint.id}/updates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({
            comments,
            isInternal,
            updateType: isInternal ? 'internal_note' : 'customer_message',
          }),
        });
      } catch {
        // Fallback to local
      }

      db.addUpdate({
        complaintId: complaint.id,
        author: currentUser,
        comments,
        isInternal,
        updateType: isInternal ? 'internal_note' : 'customer_message',
      });

      setNoteText('');
      triggerRefresh();
      showToast(
        isInternal
          ? 'Internal investigation note recorded securely (hidden from customer).'
          : 'Public notice posted to customer portal.',
        'success',
        isInternal ? 'Internal Audit Logged' : 'Public Notice Published'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to post note', 'error');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Move to In Progress
  const handleMoveToInProgress = async () => {
    if (isUnassigned) {
      showToast('You must claim this case to your active queue before starting investigation.', 'error', 'Unassigned Case');
      return;
    }

    if (!canModifyWorkflow) {
      showToast(`This case is assigned to ${complaint.assignedStaffName}. You cannot change its status.`, 'error', 'Unauthorized');
      return;
    }

    const statusNote = `Investigation officially commenced by Officer ${currentUser.fullName} (${currentUser.branchCode}).`;
    try {
      try {
        await fetch(`/api/complaints/${complaint.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({
            status: 'In Progress',
            statusNote,
          }),
        });
      } catch {
        // Fallback
      }

      db.updateStatus({
        complaintId: complaint.id,
        actor: currentUser,
        newStatus: 'In Progress',
        statusNote,
      });
      triggerRefresh();
      showToast('Status advanced to In Progress in real time.', 'success', 'Status Progression');
    } catch (err: any) {
      showToast(err?.message || 'Status transition failed', 'error');
    }
  };

  // Resolve complaint with mandatory resolution note
  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim() || resolutionSummary.trim().length < 5) {
      setResolveError('A comprehensive resolution note (at least 5 characters) is mandatory.');
      return;
    }

    if (!canModifyWorkflow) {
      setResolveError(`Unauthorized: Case is assigned to ${complaint.assignedStaffName}.`);
      return;
    }

    setIsResolving(true);
    setResolveError(null);
    const note = resolutionSummary.trim();

    try {
      try {
        await fetch(`/api/complaints/${complaint.id}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({ resolutionNote: note }),
        });
      } catch {
        // Fallback
      }

      db.updateStatus({
        complaintId: complaint.id,
        actor: currentUser,
        newStatus: 'Resolved',
        statusNote: note,
      });
      setShowResolveModal(false);
      triggerRefresh();
      showToast(`Complaint ${complaint.referenceNumber} marked Resolved with formal resolution note.`, 'success', 'Dispute Resolved');
    } catch (err: any) {
      setResolveError(err?.message || 'Failed to resolve complaint.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center p-1 border border-white/20 shrink-0">
              <GCBLogo size="sm" showText={false} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {complaint.referenceNumber}
                </span>
                <span className="text-xs text-slate-400">• {complaint.category}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    complaint.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : complaint.status === 'In Progress'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {complaint.status}
                </span>

                {/* Handler Badge in Header */}
                {isAssignedToCurrentOfficer ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Assigned to You
                  </span>
                ) : isUnassigned ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Unassigned in Branch Register
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Officer: {complaint.assignedStaffName}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1 line-clamp-1">{complaint.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar for Status Transitions and Claiming */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-semibold">Case Status:</span>
            <span className="font-bold text-slate-800">{complaint.status}</span>
            <span className="text-slate-400">•</span>
            <span>Handler: <strong className="text-slate-800">{complaint.assignedStaffName || 'None (Unassigned)'}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* If Unassigned: Show Prominent Claim Action */}
            {isUnassigned && currentUser.role === 'staff' && (
              <button
                onClick={() => handleClaimCase(true)}
                disabled={isClaiming}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isClaiming ? 'Claiming...' : 'Claim & Start Investigation'}</span>
              </button>
            )}

            {/* If assigned to this officer / manager: Begin investigation */}
            {canModifyWorkflow && complaint.status === 'Submitted' && (
              <button
                onClick={handleMoveToInProgress}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Begin Investigation (In Progress)</span>
              </button>
            )}

            {/* If assigned to this officer / manager: Mark Resolved */}
            {canModifyWorkflow && complaint.status !== 'Resolved' && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Resolved (Provide Note)</span>
              </button>
            )}

            {complaint.status === 'Resolved' && (
              <div className="text-xs text-emerald-800 bg-emerald-100 font-semibold px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Case Closed & Resolved
              </div>
            )}
          </div>
        </div>

        {/* Workstation Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Concurrency / Ownership Warning Banners */}
          {isUnassigned && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">Unassigned Case in Branch Register</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    This dispute is currently unassigned. You must officially claim it into your personal queue before starting investigation to prevent multiple officers working on the same case simultaneously.
                  </div>
                </div>
              </div>
              {currentUser.role === 'staff' && (
                <button
                  onClick={() => handleClaimCase(true)}
                  disabled={isClaiming}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isClaiming ? 'Claiming Case...' : 'Claim to My Queue'}</span>
                </button>
              )}
            </div>
          )}

          {isAssignedToOtherOfficer && (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-3.5 flex items-center gap-3 text-slate-700 text-xs">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <strong>Assigned to Officer {complaint.assignedStaffName}.</strong> You are viewing this case in read-only observation mode. Only Officer {complaint.assignedStaffName} or a Branch Manager can alter workflow status or provide resolution notes.
              </div>
            </div>
          )}

          {/* Customer & Incident Particulars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Customer Dossier
              </span>
              <div className="font-bold text-slate-900 text-sm">{complaint.customerName}</div>
              <div className="text-slate-600">{complaint.customerEmail}</div>
              <div className="text-slate-600">{complaint.customerPhone || 'Phone unrecorded'}</div>
              <div className="pt-1 text-[11px] text-slate-400 font-mono">
                Customer ID: #{complaint.customerId}
              </div>
            </div>

            {/* Incident Particulars */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 md:col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Incident Details & Branch
              </span>
              <div className="flex flex-wrap gap-4 text-slate-700">
                <div>
                  <span className="text-slate-400 text-[11px]">Incident Date:</span>{' '}
                  <strong className="text-slate-800">{complaint.incidentDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Branch:</span>{' '}
                  <strong className="text-slate-800">{complaint.branchAffected}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Priority:</span>{' '}
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      complaint.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : complaint.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 text-xs leading-relaxed mt-2">
                {complaint.description}
              </div>
            </div>
          </div>

          {/* If Resolved: Show Resolution Summary */}
          {complaint.status === 'Resolved' && complaint.resolutionNote && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-1">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>Official Resolution Record</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">{complaint.resolutionNote}</p>
              <div className="text-[10px] text-emerald-700 font-mono mt-2">
                Recorded: {new Date(complaint.resolvedAt!).toLocaleString()}
              </div>
            </div>
          )}

          {/* Dual Note-Taking Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setNoteType('internal_note')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    noteType === 'internal_note'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential Internal Note (Staff Only)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNoteType('customer_notice')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    noteType === 'customer_notice'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Notice to Customer (Public)</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {noteType === 'internal_note'
                  ? '🔒 Encrypted from customer view'
                  : '👁️ Customer portal update'}
              </span>
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                placeholder={
                  noteType === 'internal_note'
                    ? 'Document internal bank findings (e.g. core banking journal check, cash recycler count, acquirer dispute #)...'
                    : 'Compose official progress message visible to the customer on their portal...'
                }
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {noteType === 'internal_note' ? (
                    <span className="text-amber-800 font-medium">
                      Note: Only logged-in Staff and Managers can see internal investigation notes.
                    </span>
                  ) : (
                    <span className="text-blue-800 font-medium">
                      Note: This will be immediately visible on the customer's tracking timeline.
                    </span>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSubmittingNote || !noteText.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* Chronological Audit Log (Staff View includes internal logs) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Complete Investigation History & Audit Trail ({updates.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Includes internal notes & system transitions
              </span>
            </h4>

            <div className="space-y-3">
              {updates.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs relative ${
                    item.isInternal
                      ? 'bg-amber-50/70 border-amber-300'
                      : item.authorRole === 'customer'
                      ? 'bg-blue-50/50 border-blue-200'
                      : item.updateType === 'status_change'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <UserAvatar
                        user={{
                          fullName: item.authorName,
                          role: item.authorRole,
                        }}
                        size="xs"
                      />
                      <span className="font-bold text-slate-900">{item.authorName}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.2 rounded bg-white border border-slate-200">
                        {item.authorRole}
                      </span>
                      {item.isInternal && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full border border-amber-300">
                          <Lock className="w-2.5 h-2.5" />
                          INTERNAL ONLY - RESTRICTED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-800 leading-relaxed">{item.comments}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Assigned Specialist: <strong className="text-slate-800">{complaint.assignedStaffName || 'Unassigned'}</strong></span>
            {isAssignedToCurrentOfficer && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                You are handling this case
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Mandatory Resolution Note Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Formally Close & Resolve Case #{complaint.referenceNumber}
                </h3>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with banking quality standards, you must record a complete, auditable explanation of the findings, root cause, customer contact, and remediation steps taken.
            </p>

            {resolveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resolveError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Formal Resolution Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Card reversal of GHS 850 posted to customer account; ATM journal reconciled by E-Banking audit team..."
                  value={resolutionSummary}
                  onChange={e => setResolutionSummary(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <span className="text-[10px] text-slate-400">
                  Minimum 5 characters. This note will be permanently logged in the audit registry and shown to the customer.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving || resolutionSummary.trim().length < 5}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isResolving ? 'Submitting Resolution...' : 'Confirm & Close Case'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
