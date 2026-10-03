import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../../types';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  User,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  Lock,
  Plus
} from 'lucide-react';
import { CaseInvestigationModal } from './CaseInvestigationModal';
import { Pagination } from '../common/Pagination';

interface StaffWorkstationProps {
  showAllBranch?: boolean;
}

export const StaffWorkstation: React.FC<StaffWorkstationProps> = ({ showAllBranch = false }) => {
  const { currentUser, dbVersion, triggerRefresh, showToast } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unassigned' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // If showAllBranch: show all branch complaints; otherwise show assigned to this officer
  const allComplaints = showAllBranch ? db.getAllComplaints() : db.getComplaintsForRole(currentUser);

  const activeAssignedCount = allComplaints.filter(c => c.status !== 'Resolved').length;
  const unassignedCount = allComplaints.filter(c => c.assignedStaffId === null && c.status !== 'Resolved').length;
  const inProgressCount = allComplaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = allComplaints.filter(c => c.status === 'Resolved').length;
  const highPriorityCount = allComplaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

  const filtered = allComplaints.filter(c => {
    let matchesStatus = true;
    if (statusFilter === 'Unassigned') {
      matchesStatus = c.assignedStaffId === null && c.status !== 'Resolved';
    } else if (statusFilter !== 'All') {
      matchesStatus = c.status === statusFilter;
    }

    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branchAffected.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalItems = filtered.length;
  const paginatedCases = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Direct claim handler from list card
  const handleQuickClaim = async (e: React.MouseEvent, complaintId: number) => {
    e.stopPropagation();
    setClaimingId(complaintId);
    try {
      try {
        await fetch(`/api/complaints/${complaintId}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({ startInvestigation: true }),
        });
      } catch {
        // local DB fallback
      }

      const { complaint: claimed } = db.claimComplaint({
        complaintId,
        staff: currentUser,
        startInvestigation: true,
      });

      triggerRefresh();
      showToast(
        `Case #${claimed.referenceNumber} successfully claimed and moved to your assigned queue.`,
        'success',
        'Case Claimed'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to claim case', 'error', 'Claim Failed');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {showAllBranch ? 'Branch-Wide Case Register' : `Complaints Assigned to ${currentUser.fullName}`}
            </h1>
            {showAllBranch && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Register Oversight Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Officer ID: #{currentUser.id} • Assigned Unit: {currentUser.branchCode} Complaints Resolution Desk
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Role: Staff Resolution Officer</span>
          </div>
        </div>
      </div>

      {/* Notice Banner in Register Mode */}
      {showAllBranch && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Branch Register Concurrency Rule:</strong> To prevent multiple officers from investigating or modifying the same dispute concurrently, unassigned complaints must be claimed into an officer's personal queue prior to starting active investigation.
          </div>
        </div>
      )}

      {/* KPI Workload Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold">{showAllBranch ? 'All Branch Records' : 'Active Caseload'}</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{showAllBranch ? allComplaints.length : activeAssignedCount}</div>
          <span className="text-[10px] text-slate-400">Total cases in registry</span>
        </div>

        {showAllBranch ? (
          <div 
            onClick={() => { setStatusFilter('Unassigned'); setCurrentPage(1); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Unassigned'
                ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-semibold">Unassigned Cases</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-600">{unassignedCount}</div>
            <span className="text-[10px] text-slate-400">Available to claim</span>
          </div>
        ) : (
          <div 
            onClick={() => { setStatusFilter('In Progress'); setCurrentPage(1); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'In Progress'
                ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-semibold">Under Investigation</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-600">{inProgressCount}</div>
            <span className="text-[10px] text-slate-400">Marked In Progress</span>
          </div>
        )}

        <div 
          onClick={() => { setStatusFilter('In Progress'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress' && showAllBranch
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold">In Investigation</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-blue-600">{inProgressCount}</div>
          <span className="text-[10px] text-slate-400">Active bank inquiries</span>
        </div>

        <div 
          onClick={() => { setStatusFilter('Resolved'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{resolvedCount}</div>
          <span className="text-[10px] text-slate-400">Successfully closed</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, customer, title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Card Services">Card Services</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="ATM & Cash Deposit">ATM & Cash Deposit</option>
            <option value="Account & Funds Transfer">Account & Funds Transfer</option>
            <option value="Loans & Credit">Loans & Credit</option>
            <option value="General Service">General Service</option>
          </select>

          {/* Status Tabs */}
          <div className="flex space-x-1">
            {(showAllBranch
              ? (['All', 'Unassigned', 'Submitted', 'In Progress', 'Resolved'] as const)
              : (['All', 'Submitted', 'In Progress', 'Resolved'] as const)
            ).map(tab => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List of Cases */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-800">No cases found in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {showAllBranch
                ? 'No branch records match your filter criteria.'
                : 'You currently have zero active cases assigned in this status filter.'}
            </p>
          </div>
        ) : (
          paginatedCases.map(item => {
            const isAssignedToMe = item.assignedStaffId === currentUser.id;
            const isUnassigned = item.assignedStaffId === null;
            const isAssignedToOther = !isUnassigned && !isAssignedToMe;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCaseId(item.id)}
                className={`bg-white p-4 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  isAssignedToMe
                    ? 'border-slate-200 hover:border-emerald-400'
                    : isUnassigned
                    ? 'border-amber-200/80 hover:border-amber-400 bg-amber-50/10'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.referenceNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">• {item.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
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
                      {item.priority}
                    </span>

                    {/* Officer Assignment Indicator */}
                    {isAssignedToMe ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Assigned to You
                      </span>
                    ) : isUnassigned ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                        Unassigned (Claimable)
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Officer: {item.assignedStaffName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Customer: {item.customerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {item.branchAffected}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Lodged: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Direct Claim Button for Unassigned cases */}
                  {isUnassigned && item.status !== 'Resolved' && (
                    <button
                      type="button"
                      disabled={claimingId === item.id}
                      onClick={(e) => handleQuickClaim(e, item.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{claimingId === item.id ? 'Claiming...' : 'Claim Case'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                      isAssignedToMe
                        ? 'bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white'
                        : isUnassigned
                        ? 'bg-slate-100 group-hover:bg-slate-800 text-slate-700 group-hover:text-white'
                        : 'bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white'
                    }`}
                  >
                    <span>{isAssignedToOther ? 'View Dossier' : 'Open Dossier'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="cases"
        />
      )}

      {/* Case Investigation Modal */}
      {selectedCaseId && (
        <CaseInvestigationModal
          complaintId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
        />
      )}
    </div>
  );
};
