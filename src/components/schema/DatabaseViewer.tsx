import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { Database, Table, Key, ShieldCheck, Download, Code, CheckCircle2 } from 'lucide-react';

export const DatabaseViewer: React.FC = () => {
  const { dbVersion, showToast } = useAuth();
  const rawTables = db.getRawTables();
  const [selectedTable, setSelectedTable] = useState<'users' | 'complaints' | 'complaint_updates' | 'complaint_assignments'>('complaints');

  const handleDownloadSQL = () => {
    let sql = `-- =========================================================\n`;
    sql += `-- BANK CUSTOMER COMPLAINT TRACKING SYSTEM (CCTS) SQL DUMP\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n`;
    sql += `-- =========================================================\n\n`;

    // 1. users
    sql += `-- Table: users\n`;
    sql += `INSERT INTO users (id, email, full_name, role, branch_code, phone_number) VALUES\n`;
    sql += rawTables.users
      .map(
        u =>
          `  (${u.id}, '${u.email}', '${u.fullName.replace(/'/g, "''")}', '${u.role}', '${u.branchCode}', '${u.phoneNumber || ''}')`
      )
      .join(',\n') + ';\n\n';

    // 2. complaints
    sql += `-- Table: complaints\n`;
    sql += `INSERT INTO complaints (id, reference_number, customer_id, category, title, incident_date, branch_affected, priority, status, assigned_staff_id, resolution_note, resolved_at) VALUES\n`;
    sql += rawTables.complaints
      .map(
        c =>
          `  (${c.id}, '${c.referenceNumber}', ${c.customerId}, '${c.category}', '${c.title.replace(/'/g, "''")}', '${c.incidentDate}', '${c.branchAffected}', '${c.priority}', '${c.status}', ${c.assignedStaffId || 'NULL'}, ${c.resolutionNote ? `'${c.resolutionNote.replace(/'/g, "''")}'` : 'NULL'}, ${c.resolvedAt ? `'${c.resolvedAt}'` : 'NULL'})`
      )
      .join(',\n') + ';\n\n';

    // 3. updates
    sql += `-- Table: complaint_updates\n`;
    sql += `INSERT INTO complaint_updates (id, complaint_id, author_id, update_type, comments, is_internal, created_at) VALUES\n`;
    sql += rawTables.complaint_updates
      .map(
        u =>
          `  (${u.id}, ${u.complaintId}, ${u.authorId}, '${u.updateType}', '${u.comments.replace(/'/g, "''")}', ${u.isInternal ? 1 : 0}, '${u.createdAt}')`
      )
      .join(',\n') + ';\n\n';

    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gcb_bank_complaints_schema_${new Date().toISOString().split('T')[0]}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('MySQL database dump exported successfully.', 'success');
  };

  const getTableRows = () => {
    return rawTables[selectedTable];
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Relational Architecture & Requirements Matrix
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Database Schema Inspector & Traceability
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live inspection of the 4 relational entities conforming to MySQL 8.0 DDL and Peffers et al. (2007) design artefacts.
          </p>
        </div>

        <button
          onClick={handleDownloadSQL}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export SQL DDL & Seed Dump</span>
        </button>
      </div>

      {/* Requirements Traceability Matrix (from Project Section 6 & 9) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Requirements Traceability Matrix (RTM)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Functional Specification</th>
                <th className="py-2.5 px-3">Database Entity</th>
                <th className="py-2.5 px-3">Security & Access Rule</th>
                <th className="py-2.5 px-3">Prototype Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">FR-01</td>
                <td className="py-2.5 px-3 font-medium">Unique Complaint Registration with Reference</td>
                <td className="py-2.5 px-3 font-mono text-[11px]">complaints(reference_number)</td>
                <td className="py-2.5 px-3 text-slate-500">Unique Index, Customer Ownership</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">Verified (CMP-2026-XXXXX)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">FR-02</td>
                <td className="py-2.5 px-3 font-medium">Managerial Case Delegation to Staff</td>
                <td className="py-2.5 px-3 font-mono text-[11px]">complaint_assignments</td>
                <td className="py-2.5 px-3 text-slate-500">Manager role authorization check</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">Verified (Triage Workstation)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">FR-03</td>
                <td className="py-2.5 px-3 font-medium">Confidential Staff Investigation Notes</td>
                <td className="py-2.5 px-3 font-mono text-[11px]">complaint_updates(is_internal=1)</td>
                <td className="py-2.5 px-3 text-slate-500">OWASP Filter: Stripped for customers</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">Verified (Negative Test Pass)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">FR-04</td>
                <td className="py-2.5 px-3 font-medium">Controlled Status Transition with Resolution Note</td>
                <td className="py-2.5 px-3 font-mono text-[11px]">complaints(resolution_note, resolved_at)</td>
                <td className="py-2.5 px-3 text-slate-500">Mandatory note validation (min 5 chars)</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">Verified (Resolution Guard)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">FR-05</td>
                <td className="py-2.5 px-3 font-medium">Executive Turnaround Time & Backlog Reports</td>
                <td className="py-2.5 px-3 font-mono text-[11px]">complaints aggregation query</td>
                <td className="py-2.5 px-3 text-slate-500">Restricted to Manager role</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">Verified (SLA & Age Charts)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {(
          [
            { key: 'complaints', name: 'complaints', count: rawTables.complaints.length },
            { key: 'complaint_updates', name: 'complaint_updates', count: rawTables.complaint_updates.length },
            { key: 'complaint_assignments', name: 'complaint_assignments', count: rawTables.complaint_assignments.length },
            { key: 'users', name: 'users', count: rawTables.users.length },
          ] as const
        ).map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTable(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              selectedTable === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{tab.name}</span>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded-full text-slate-200">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Table Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="font-mono text-xs font-bold text-slate-800">
              SELECT * FROM {selectedTable};
            </span>
          </div>
          <span className="text-xs text-slate-500">{getTableRows().length} active rows</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-slate-100 sticky top-0 text-[10px] text-slate-600 uppercase border-b border-slate-200">
              <tr>
                {getTableRows().length > 0 &&
                  Object.keys(getTableRows()[0]).map(col => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {getTableRows().map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {Object.values(row).map((val: any, cIdx: number) => (
                    <td key={cIdx} className="py-2 px-3 whitespace-nowrap max-w-xs truncate">
                      {val === null || val === undefined
                        ? <span className="text-slate-400 italic">NULL</span>
                        : typeof val === 'boolean'
                        ? val ? '1' : '0'
                        : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
