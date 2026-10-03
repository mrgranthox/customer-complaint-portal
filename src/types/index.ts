export type UserRole = 'customer' | 'staff' | 'manager';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  branchCode: string;
  password?: string;
  phoneNumber?: string;
  accountNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  department?: string;
  jobTitle?: string;
  bio?: string;
  address?: string;
  notificationsEnabled?: boolean;
  smsNotifications?: boolean;
  createdAt?: string;
}

export type ComplaintCategory =
  | 'Card Services'
  | 'Mobile Banking'
  | 'ATM & Cash Deposit'
  | 'Account & Funds Transfer'
  | 'Loans & Credit'
  | 'General Service';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export type ComplaintStatus = 'Submitted' | 'In Progress' | 'Resolved';

export type UpdateType = 'status_change' | 'customer_message' | 'internal_note' | 'assignment';

export interface Complaint {
  id: number;
  referenceNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  incidentDate: string;
  branchAffected: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintUpdate {
  id: number;
  complaintId: number;
  authorId: number;
  authorName: string;
  authorRole: UserRole;
  updateType: UpdateType;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus | null;
  comments: string;
  isInternal: boolean; // TRUE: only staff/manager; FALSE: visible to customer
  createdAt: string;
}

export interface ComplaintAssignment {
  id: number;
  complaintId: number;
  assignedBy: number;
  assignedByName: string;
  assignedTo: number;
  assignedToName: string;
  assignmentNotes: string;
  assignedAt: string;
}

export interface EvaluationTask {
  id: string;
  title: string;
  targetRole: UserRole;
  description: string;
  instructions: string[];
  expectedOutcome: string;
  completed: boolean;
  timeSpentSeconds: number;
  assisted: boolean;
}

export interface SecurityAuditResult {
  testId: string;
  name: string;
  rule: string;
  status: 'passed' | 'failed' | 'pending';
  details: string;
  timestamp: string;
}
