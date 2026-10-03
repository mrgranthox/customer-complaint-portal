import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { Complaint } from '../../types';
import { Search, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { ComplaintDetailModal } from './ComplaintDetailModal';

export const TrackByReferenceModal: React.FC = () => {
  const { currentUser } = useAuth();
  const [refQuery, setRefQuery] = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeComplaintId, setActiveComplaintId] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refQuery.trim()) return;

    setError(null);
    setSearchedComplaint(null);

    try {
      // Passes current user context to enforce OWASP ownership check
      const found = db.getComplaintByReference(refQuery, currentUser);
      if (!found) {
        setError(`No complaint found with reference number "${refQuery.toUpperCase()}".`);
      } else {
        setSearchedComplaint(found);
      }
    } catch (err: any) {
      setError(
        err?.message ||
        'SECURITY EXCEPTION: In accordance with OWASP Top 10 access-control policies, customers are forbidden from viewing complaints owned by other bank accounts.'
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">
          Track Complaint by Reference Number
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Enter the unique reference code (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">CMP-2026-84920</code>) issued at the time of lodging your complaint.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. CMP-2026-84920"
              value={refQuery}
              onChange={e => setRefQuery(e.target.value)}
              className="w-full text-xs font-mono pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 uppercase"
              required
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
          >
            <span>Track Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Security Rule Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            OWASP Top 10 Access Control Verification:
          </div>
          <p>
            The system verifies session identity prior to returning records. Customers cannot access records registered under other customer accounts, even if the reference number is known.
          </p>
        </div>

        {/* Error / Access Denied */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Access Restrained / Not Found</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Found Result Card */}
        {searchedComplaint && (
          <div className="mt-6 p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                {searchedComplaint.referenceNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  searchedComplaint.status === 'Resolved'
                    ? 'bg-emerald-200 text-emerald-900'
                    : searchedComplaint.status === 'In Progress'
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {searchedComplaint.status}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900">{searchedComplaint.title}</h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{searchedComplaint.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-200 text-[11px] text-slate-500">
              <span>Category: <strong>{searchedComplaint.category}</strong></span>
              <button
                onClick={() => setActiveComplaintId(searchedComplaint.id)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Open Full Investigation Timeline &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {activeComplaintId && (
        <ComplaintDetailModal
          complaintId={activeComplaintId}
          onClose={() => setActiveComplaintId(null)}
        />
      )}
    </div>
  );
};
