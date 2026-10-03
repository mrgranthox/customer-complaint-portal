import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { Complaint } from '../../types';
import { UserCheck, Clock, Calendar, Building2, AlertTriangle, ChevronRight } from 'lucide-react';
import { AssignModal } from './AssignModal';
import { Pagination } from '../common/Pagination';

export const UnassignedTriage: React.FC = () => {
  const { dbVersion } = useAuth();
  const allComplaints = db.getAllComplaints();
  const unassigned = allComplaints.filter(c => !c.assignedStaffId && c.status !== 'Resolved');
  const [targetComplaint, setTargetComplaint] = useState<Complaint | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalItems = unassigned.length;
  const paginatedUnassigned = unassigned.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Managerial Triage Desk
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Unassigned Complaint Backlog ({unassigned.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming customer grievances and delegate to qualified resolution specialists to meet SLA.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>SLA Target: Assign within 4 hours</span>
        </div>
      </div>

      <div className="space-y-3">
        {unassigned.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-900">Zero Unassigned Cases!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All logged customer complaints have been assigned to designated investigation officers.
            </p>
          </div>
        ) : (
          paginatedUnassigned.map(item => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    {item.referenceNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">• {item.category}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Priority: {item.priority}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Customer: <strong className="text-slate-700">{item.customerName}</strong></span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {item.branchAffected}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Lodged: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0">
                <button
                  onClick={() => setTargetComplaint(item)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign to Staff Officer</span>
                </button>
              </div>
            </div>
          ))
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
          itemLabel="unassigned cases"
        />
      )}

      {targetComplaint && (
        <AssignModal
          complaint={targetComplaint}
          onClose={() => setTargetComplaint(null)}
        />
      )}
    </div>
  );
};
