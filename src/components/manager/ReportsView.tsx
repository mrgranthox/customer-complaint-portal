import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { 
  BarChart3, 
  Clock, 
  Download, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  PieChart 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { dbVersion, showToast } = useAuth();
  const reports = db.getManagerReports();
  const allComplaints = db.getAllComplaints();

  const handleExportCSV = () => {
    const headers = [
      'Reference Number',
      'Customer',
      'Category',
      'Priority',
      'Status',
      'Assigned Staff',
      'Lodged Date',
      'Resolved Date',
      'Resolution Summary',
    ];

    const rows = allComplaints.map(c => [
      c.referenceNumber,
      `"${c.customerName}"`,
      `"${c.category}"`,
      c.priority,
      c.status,
      `"${c.assignedStaffName || 'Unassigned'}"`,
      c.createdAt,
      c.resolvedAt || 'N/A',
      `"${(c.resolutionNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GCB_Bank_Complaint_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive Complaint Report exported successfully as CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Complaints SLA & Operations Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational turnaround velocity, case category clusters, and staff caseload distribution.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Formal Audit CSV</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Mean Turnaround Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{reports.avgResolutionHours} hrs</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated across {reports.resolvedCount} closed complaints
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{reports.resolutionRate}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${reports.resolutionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold">Backlog Age Over 72h</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-amber-600">{reports.ageDistribution.ageOver72h}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cases exceeding standard 3-day SLA threshold
          </p>
        </div>
      </div>

      {/* Category Breakdown & Backlog Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>Grievance Distribution by Category</span>
            </h3>
            <span className="text-xs text-slate-400">{reports.total} total cases</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(reports.categoryCounts).map(([cat, count]) => {
              const pct = reports.total > 0 ? Math.round((count / reports.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{cat}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Case Age Distribution Histogram */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Unresolved Backlog Age Histogram</span>
            </h3>
            <span className="text-xs text-slate-400">Open cases only</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Monitors case aging against the Bank of Ghana consumer protection standards requiring prompt response intervals.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-emerald-800">Fresh (Under 24 Hours)</span>
                <span className="font-bold text-slate-800">{reports.ageDistribution.ageUnder24h} cases</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (reports.ageDistribution.ageUnder24h / Math.max(1, reports.submittedCount + reports.inProgressCount)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-amber-800">Aging (24 to 72 Hours)</span>
                <span className="font-bold text-slate-800">{reports.ageDistribution.age24to72h} cases</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (reports.ageDistribution.age24to72h / Math.max(1, reports.submittedCount + reports.inProgressCount)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-rose-800">Overdue SLA (&gt; 72 Hours)</span>
                <span className="font-bold text-slate-800">{reports.ageDistribution.ageOver72h} cases</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (reports.ageDistribution.ageOver72h / Math.max(1, reports.submittedCount + reports.inProgressCount)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Caseload & Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Officer Caseload & Resolution Velocity</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workload distribution across active resolution officers in the branch.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Officer Name</th>
                <th className="py-3 px-6">Active Cases</th>
                <th className="py-3 px-6">Resolved Cases</th>
                <th className="py-3 px-6">Total Handled</th>
                <th className="py-3 px-6">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reports.staffWorkload.map(staff => {
                const rate = staff.totalAssigned > 0 ? Math.round((staff.resolvedCases / staff.totalAssigned) * 100) : 0;
                return (
                  <tr key={staff.staffId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{staff.staffName}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {staff.activeCases} active
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {staff.resolvedCases} closed
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold">{staff.totalAssigned}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{rate}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
