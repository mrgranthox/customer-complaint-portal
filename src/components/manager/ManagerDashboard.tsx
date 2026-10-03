import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { Complaint, ComplaintStatus } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  ChevronRight,
  Lock
} from 'lucide-react';
import { AssignModal } from './AssignModal';
import { CaseInvestigationModal } from '../staff/CaseInvestigationModal';
import { Pagination } from '../common/Pagination';

export const ManagerDashboard: React.FC = () => {
  const { currentUser, dbVersion } = useAuth();
  const reports = db.getManagerReports();
  const allComplaints = db.getAllComplaints();

  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus | 'Unassigned'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = allComplaints.filter(c => {
    let matchesStatus = true;
    if (statusFilter === 'Unassigned') {
      matchesStatus = !c.assignedStaffId && c.status !== 'Resolved';
    } else if (statusFilter !== 'All') {
      matchesStatus = c.status === statusFilter;
    }

    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedStaffName && c.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalItems = filtered.length;
  const paginatedComplaints = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Complaints Management & Oversight Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervising Officer: <strong className="text-slate-800">{currentUser.fullName}</strong> • Branch HQ Quality Assurance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {reports.unassignedCount > 0 && (
            <button
              onClick={() => setStatusFilter('Unassigned')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Triage {reports.unassignedCount} Unassigned Cases</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Cases</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{reports.total}</div>
          <span className="text-[10px] text-slate-400">All registered grievances</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700">Unassigned</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{reports.unassignedCount}</div>
          <span className="text-[10px] text-purple-400">Needs staff assignment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600">Active Backlog</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {reports.submittedCount + reports.inProgressCount}
          </div>
          <span className="text-[10px] text-blue-400">Submitted + In Progress</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600">Resolution Rate</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{reports.resolutionRate}%</div>
          <span className="text-[10px] text-emerald-500">{reports.resolvedCount} cases closed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-700">Avg Resolution</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{reports.avgResolutionHours} hrs</div>
          <span className="text-[10px] text-slate-400">SLA turnaround</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref #, customer, staff, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {(['All', 'Unassigned', 'Submitted', 'In Progress', 'Resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Oversight Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category & Subject</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Specialist</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints matching current filter.
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">
                      {item.referenceNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{item.customerName}</div>
                      <div className="text-[10px] text-slate-400">{item.branchAffected}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-[10px] font-bold text-slate-500">{item.category}</div>
                      <div className="font-semibold text-slate-800 line-clamp-1">{item.title}</div>
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4">
                      {item.assignedStaffName ? (
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span>{item.assignedStaffName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {item.status === 'Resolved' ? (
                        <span
                          title="Resolved cases are permanently closed and cannot be reassigned."
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-md border border-slate-200 cursor-not-allowed select-none inline-flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setAssignTarget(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:text-white hover:bg-purple-700 rounded-md border border-purple-300 transition-colors cursor-pointer"
                        >
                          {item.assignedStaffId ? 'Reassign' : 'Assign'}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCaseId(item.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-white hover:bg-slate-900 rounded-md border border-slate-300 transition-colors cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50/50">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="complaints"
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          complaint={assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {selectedCaseId && (
        <CaseInvestigationModal
          complaintId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
        />
      )}
    </div>
  );
};
