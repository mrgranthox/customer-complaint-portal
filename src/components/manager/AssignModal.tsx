import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { Complaint } from '../../types';
import { ShieldAlert, UserCheck, X, Send, Lock, AlertCircle } from 'lucide-react';

interface AssignModalProps {
  complaint: Complaint;
  onClose: () => void;
  onAssigned?: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({ complaint, onClose, onAssigned }) => {
  const { currentUser, triggerRefresh, showToast } = useAuth();
  const staffMembers = db.getStaffMembers();
  const isResolved = complaint.status === 'Resolved';

  const [selectedStaffId, setSelectedStaffId] = useState<number>(
    complaint.assignedStaffId || (staffMembers[0]?.id || 3)
  );
  const [directiveNotes, setDirectiveNotes] = useState(
    'Please prioritize verification with branch logs and report back within 24 hours.'
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResolved) {
      setError('Resolved cases cannot be reassigned. This dispute is already closed.');
      return;
    }
    if (!selectedStaffId) {
      setError('Please select an active resolution officer.');
      return;
    }

    setIsAssigning(true);
    setError(null);
    try {
      try {
        await fetch(`/api/complaints/${complaint.id}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({
            staffId: selectedStaffId,
            notes: directiveNotes,
          }),
        });
      } catch {
        // Fallback
      }

      db.assignComplaint({
        complaintId: complaint.id,
        manager: currentUser,
        staffId: selectedStaffId,
        notes: directiveNotes,
      });

      triggerRefresh();
      const staffObj = staffMembers.find(s => s.id === selectedStaffId);
      showToast(
        `Case ${complaint.referenceNumber} successfully assigned to ${staffObj?.fullName || 'Staff'} in real time.`,
        'success',
        'Case Assigned'
      );
      if (onAssigned) onAssigned();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Assignment failed');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">
              {complaint.assignedStaffId ? 'Reassign Complaint Officer' : 'Assign Complaint to Specialist'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-purple-700 font-bold">{complaint.referenceNumber}</span>
            <span className="text-slate-500">{complaint.category}</span>
          </div>
          <div className="font-semibold text-slate-800 line-clamp-1">{complaint.title}</div>
          <div className="text-[11px] text-slate-500">Customer: {complaint.customerName} ({complaint.branchAffected})</div>
        </div>

        {isResolved && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">Case Resolved & Closed</div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Under Bank of Ghana consumer dispute resolution directives, resolved cases cannot be reassigned or reallocated.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAssign} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Designated Staff Officer <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStaffId}
              disabled={isResolved}
              onChange={e => setSelectedStaffId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {staffMembers.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName} — {staff.email} ({staff.branchCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Managerial Directive & Special Instructions
            </label>
            <textarea
              rows={3}
              disabled={isResolved}
              value={directiveNotes}
              onChange={e => setDirectiveNotes(e.target.value)}
              placeholder="Provide specific instructions or priority directives for the investigating officer..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This note will be automatically recorded into the internal assignment audit log.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {isResolved ? 'Close' : 'Cancel'}
            </button>
            {!isResolved && (
              <button
                type="submit"
                disabled={isAssigning}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAssigning ? 'Delegating...' : 'Confirm Assignment'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
