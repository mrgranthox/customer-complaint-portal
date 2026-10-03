import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { ComplaintStatus } from '../../types';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  User, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { ComplaintSubmissionModal } from './ComplaintSubmissionModal';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { Pagination } from '../common/Pagination';
import { GCBLogo } from '../common/GCBLogo';

export const CustomerDashboard: React.FC = () => {
  const { currentUser, dbVersion, showToast } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Industry Standard Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Retrieve records for logged-in customer
  const complaints = db.getComplaintsForRole(currentUser);

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const submittedCount = complaints.filter(c => c.status === 'Submitted').length;

  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branchAffected.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalItems = filtered.length;
  const paginatedComplaints = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = (tab: 'All' | ComplaintStatus) => {
    setStatusFilter(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCopyReference = (e: React.MouseEvent, ref: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    showToast(`Copied reference number ${ref} to clipboard`, 'info');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-200/80 p-1 flex items-center justify-center shrink-0">
            <GCBLogo size="sm" showText={false} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Customer Care & Disputes Portal
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Active Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Account Holder: <strong className="text-slate-800">{currentUser.fullName}</strong></span>
              <span>•</span>
              <span>Acc No: <span className="font-mono text-slate-700 font-semibold">{currentUser.accountNumber || '1041029482101'}</span></span>
              <span>•</span>
              <span>Branch: <span className="font-medium text-slate-700">{currentUser.branchCode}</span></span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lodge New Complaint</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => handleFilterChange('All')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'All' 
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Lodged</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <span className="text-[10px] text-slate-400">All customer cases</span>
        </div>

        <div 
          onClick={() => handleFilterChange('Submitted')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Submitted' 
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold">Submitted</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-600">{submittedCount}</div>
          <span className="text-[10px] text-slate-400">Awaiting triage/review</span>
        </div>

        <div 
          onClick={() => handleFilterChange('In Progress')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress' 
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold">Under Investigation</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-blue-600">{inProgressCount}</div>
          <span className="text-[10px] text-slate-400">Active bank inquiry</span>
        </div>

        <div 
          onClick={() => handleFilterChange('Resolved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Resolved' 
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{resolvedCount}</div>
          <span className="text-[10px] text-slate-400">Case closed with notes</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, ref #, or category..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(['All', 'Submitted', 'In Progress', 'Resolved'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSubmitOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lodge</span>
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-800">No complaints matching filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You do not have any complaints matching your criteria. Lodge a new complaint if you experienced an issue with card, ATM, or transfer services.
            </p>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lodge Official Complaint</span>
            </button>
          </div>
        ) : (
          paginatedComplaints.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedComplaintId(item.id)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.referenceNumber}
                    </span>
                    <button
                      onClick={(e) => handleCopyReference(e, item.referenceNumber)}
                      title="Copy reference number"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    >
                      {copiedRef === item.referenceNumber ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">• {item.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : item.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>

                {item.status === 'Resolved' && item.resolutionNote && (
                  <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">Resolution Summary:</span>
                      <p className="line-clamp-1 text-emerald-900 text-xs">{item.resolutionNote}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Incident: {item.incidentDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Branch: {item.branchAffected}
                  </span>
                  {item.assignedStaffName && (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <User className="w-3 h-3 text-blue-600" />
                      Officer: {item.assignedStaffName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end md:self-center shrink-0">
                <div className="text-xs font-semibold text-amber-700 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Case & Timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Industry Standard Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="complaints"
        />
      )}

      {/* Lodging Modal */}
      {isSubmitOpen && (
        <ComplaintSubmissionModal
          onClose={() => setIsSubmitOpen(false)}
          onComplaintCreated={ref => {
            setIsSubmitOpen(false);
            const found = db.getComplaintByReference(ref, currentUser);
            if (found) setSelectedComplaintId(found.id);
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}
    </div>
  );
};
