import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import { GCBLogo } from '../common/GCBLogo';
import { AlertCircle, CheckCircle2, FileText, Send, X } from 'lucide-react';

interface ComplaintSubmissionModalProps {
  onClose: () => void;
  onComplaintCreated: (referenceNumber: string) => void;
}

export const ComplaintSubmissionModal: React.FC<ComplaintSubmissionModalProps> = ({
  onClose,
  onComplaintCreated,
}) => {
  const { currentUser, triggerRefresh, showToast } = useAuth();

  const [category, setCategory] = useState<ComplaintCategory>('Card Services');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [branchAffected, setBranchAffected] = useState('Accra High Street Branch');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 8) {
      setError('Please provide a descriptive dispute title (at least 8 characters).');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setError('Please provide detailed information about the incident (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let createdRef = '';
      try {
        const res = await fetch('/api/complaints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({
            category,
            title,
            description,
            incidentDate,
            branchAffected,
            priority,
          }),
        });

        if (res.ok) {
          const payload = await res.json();
          createdRef = payload.data.referenceNumber;
        }
      } catch {
        // Fallback to local db if network error
      }

      if (!createdRef) {
        const created = db.submitComplaint({
          customer: currentUser,
          category,
          title,
          description,
          incidentDate,
          branchAffected,
          priority,
        });
        createdRef = created.referenceNumber;
      }

      triggerRefresh();
      showToast(`Complaint lodged successfully! Reference: ${createdRef}`, 'success', 'Dispute Lodged');
      onComplaintCreated(createdRef);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
              <GCBLogo size="sm" showText={false} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">GCB Bank — Lodge Customer Dispute</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Customer: <span className="text-white font-medium">{currentUser.fullName}</span> ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)]">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispute Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Card Services">Card Services (Debit/Credit Card)</option>
                <option value="Mobile Banking">Mobile Banking & USSD App</option>
                <option value="ATM & Cash Deposit">ATM & Cash Deposit Recycler</option>
                <option value="Account & Funds Transfer">Account & Funds Transfer</option>
                <option value="Loans & Credit">Loans & Credit Facility</option>
                <option value="General Service">General Service & Branch Experience</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Severity / Urgency Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ComplaintPriority)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Low">Low - Standard inquiry or feedback</option>
                <option value="Medium">Medium - Delayed transaction or service issue</option>
                <option value="High">High - Unauthorized charge, blocked funds, captured card</option>
              </select>
            </div>

            {/* Incident Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Incident Occurred <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={incidentDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Affected Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch or Digital Channel Affected <span className="text-rose-500">*</span>
              </label>
              <select
                value={branchAffected}
                onChange={e => setBranchAffected(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Accra High Street Branch">Accra High Street Branch</option>
                <option value="Kumasi Harper Road Branch">Kumasi Harper Road Branch</option>
                <option value="Airport City Commercial Branch">Airport City Commercial Branch</option>
                <option value="Takoradi Harbour Branch">Takoradi Harbour Branch</option>
                <option value="Digital Banking Operations (App/Web)">Digital Banking Operations (App/Web)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ATM captured card and debited GHS 500 without cash payout"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description of Problem <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Please describe exactly what transpired, including amounts, terminal locations, SMS alerts, and any teller/merchant communications..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum 20 characters required. A unique tracking reference will be generated immediately.
            </p>
          </div>

          {/* Information box */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Banking SLA Guarantee:</span> All customer grievances logged through CCTS are assigned to a designated resolution specialist within 24 business hours. You can monitor live investigation milestones via your customer portal.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering Complaint...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
