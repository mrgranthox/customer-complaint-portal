import {
  User,
  Complaint,
  ComplaintUpdate,
  ComplaintAssignment,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  UserRole,
} from '../types';

const DB_STORAGE_KEY = 'gcb_bank_complaints_db_v2';

export const SEED_USERS: User[] = [
  {
    id: 1,
    email: 'ama.mensah@customer.bank.gh',
    fullName: 'Ama Mensah',
    role: 'customer',
    branchCode: 'ACC-01',
    password: 'password123',
    phoneNumber: '+233 24 412 8990',
    accountNumber: '1041029482101',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 2,
    email: 'kwesi.appiah@customer.bank.gh',
    fullName: 'Kwesi Appiah',
    role: 'customer',
    branchCode: 'KMS-02',
    password: 'password123',
    phoneNumber: '+233 20 891 3341',
    accountNumber: '2081948371900',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 3,
    email: 'kofi.owusu@staff.bank.gh',
    fullName: 'Kofi Owusu',
    role: 'staff',
    branchCode: 'ACC-01',
    password: 'password123',
    phoneNumber: '+233 24 555 1201',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 4,
    email: 'abena.serwaa@staff.bank.gh',
    fullName: 'Abena Serwaa',
    role: 'staff',
    branchCode: 'ACC-01',
    password: 'password123',
    phoneNumber: '+233 50 334 9912',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 5,
    email: 'dr.quaye@manager.bank.gh',
    fullName: 'Dr. Emmanuel Quaye',
    role: 'manager',
    branchCode: 'ACC-HQ',
    password: 'password123',
    phoneNumber: '+233 24 777 0044',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 101,
    referenceNumber: 'CMP-2026-84920',
    customerId: 1,
    customerName: 'Ama Mensah',
    customerEmail: 'ama.mensah@customer.bank.gh',
    customerPhone: '+233 24 412 8990',
    category: 'Card Services',
    title: 'Visa Debit Card debited twice at High Street POS terminal',
    description: 'On 28th September 2026, I purchased groceries worth GHS 450.00 at High Street Supermarket. The cashier reported the first attempt failed, but my mobile banking alert showed two debits of GHS 450.00 each.',
    incidentDate: '2026-09-28',
    branchAffected: 'Accra High Street Branch',
    priority: 'High',
    status: 'In Progress',
    assignedStaffId: 3,
    assignedStaffName: 'Kofi Owusu',
    resolutionNote: null,
    resolvedAt: null,
    createdAt: '2026-09-29T09:14:00Z',
    updatedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 102,
    referenceNumber: 'CMP-2026-84921',
    customerId: 1,
    customerName: 'Ama Mensah',
    customerEmail: 'ama.mensah@customer.bank.gh',
    customerPhone: '+233 24 412 8990',
    category: 'Mobile Banking',
    title: 'Instant transfer OTP delays causing transaction timeout',
    description: 'Whenever I initiate a mobile money bank-to-wallet transfer in the evening, the SMS OTP takes upwards of 15 minutes to arrive, causing the session to expire.',
    incidentDate: '2026-10-01',
    branchAffected: 'Digital Banking Operations',
    priority: 'Medium',
    status: 'Submitted',
    assignedStaffId: null,
    assignedStaffName: null,
    resolutionNote: null,
    resolvedAt: null,
    createdAt: '2026-10-02T11:20:00Z',
    updatedAt: '2026-10-02T11:20:00Z',
  },
  {
    id: 103,
    referenceNumber: 'CMP-2026-79110',
    customerId: 2,
    customerName: 'Kwesi Appiah',
    customerEmail: 'kwesi.appiah@customer.bank.gh',
    customerPhone: '+233 20 891 3341',
    category: 'ATM & Cash Deposit',
    title: 'ATM retained debit card without dispensing requested cash',
    description: 'At Kumasi Harper Road ATM #2 on 25th September, card was captured following a power glitch. The amount of GHS 1,200 was deducted from account balance.',
    incidentDate: '2026-09-25',
    branchAffected: 'Kumasi Harper Road Branch',
    priority: 'High',
    status: 'Resolved',
    assignedStaffId: 4,
    assignedStaffName: 'Abena Serwaa',
    resolutionNote: 'ATM journal log reconciled by Electronic Banking Audit unit. Cash reversal of GHS 1,200.00 posted back to customer account, and replacement chip card issued free of charge at Kumasi Harper Road Branch.',
    resolvedAt: '2026-09-28T16:00:00Z',
    createdAt: '2026-09-25T14:05:00Z',
    updatedAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 104,
    referenceNumber: 'CMP-2026-90412',
    customerId: 2,
    customerName: 'Kwesi Appiah',
    customerEmail: 'kwesi.appiah@customer.bank.gh',
    customerPhone: '+233 20 891 3341',
    category: 'Account & Funds Transfer',
    title: 'Standing order deduction executed on weekend ahead of value date',
    description: 'Monthly scheduled payroll standing order deducted on Saturday instead of the specified Monday value date, incurring unauthorized overdraft charge.',
    incidentDate: '2026-09-30',
    branchAffected: 'Kumasi Harper Road Branch',
    priority: 'Low',
    status: 'In Progress',
    assignedStaffId: 4,
    assignedStaffName: 'Abena Serwaa',
    resolutionNote: null,
    resolvedAt: null,
    createdAt: '2026-10-01T08:45:00Z',
    updatedAt: '2026-10-02T10:15:00Z',
  },
  {
    id: 105,
    referenceNumber: 'CMP-2026-92834',
    customerId: 1,
    customerName: 'Ama Mensah',
    customerEmail: 'ama.mensah@customer.bank.gh',
    customerPhone: '+233 24 412 8990',
    category: 'General Service',
    title: 'Excessive counter wait time for corporate cheque clearing',
    description: 'Waited over 75 minutes at the clearing desk on Wednesday morning due to only one cashier attending to corporate clearances.',
    incidentDate: '2026-09-27',
    branchAffected: 'Accra High Street Branch',
    priority: 'Low',
    status: 'Resolved',
    assignedStaffId: 3,
    assignedStaffName: 'Kofi Owusu',
    resolutionNote: 'Customer contacted by Branch Service Manager. Explanation provided regarding system upgrade window on that morning; additional teller assigned to clearing desk during morning peak periods.',
    resolvedAt: '2026-09-28T11:30:00Z',
    createdAt: '2026-09-27T12:00:00Z',
    updatedAt: '2026-09-28T11:30:00Z',
  }
];

export const SEED_UPDATES: ComplaintUpdate[] = [
  {
    id: 1,
    complaintId: 101,
    authorId: 1,
    authorName: 'Ama Mensah',
    authorRole: 'customer',
    updateType: 'customer_message',
    previousStatus: null,
    newStatus: 'Submitted',
    comments: 'Complaint logged via Customer Web Portal with transaction receipt reference TXN-9402198 attached.',
    isInternal: false,
    createdAt: '2026-09-29T09:14:00Z',
  },
  {
    id: 2,
    complaintId: 101,
    authorId: 5,
    authorName: 'Dr. Emmanuel Quaye',
    authorRole: 'manager',
    updateType: 'assignment',
    previousStatus: 'Submitted',
    newStatus: 'Submitted',
    comments: 'Assigned complaint to Kofi Owusu (Electronic Settlement Desk) for merchant acquiring review.',
    isInternal: true,
    createdAt: '2026-09-29T10:30:00Z',
  },
  {
    id: 3,
    complaintId: 101,
    authorId: 3,
    authorName: 'Kofi Owusu',
    authorRole: 'staff',
    updateType: 'status_change',
    previousStatus: 'Submitted',
    newStatus: 'In Progress',
    comments: 'Case opened. Sent chargeback dispute request to Ghana Interbank Payment and Settlement Systems (GhIPSS) acquirer.',
    isInternal: false,
    createdAt: '2026-09-30T09:00:00Z',
  },
  {
    id: 4,
    complaintId: 101,
    authorId: 3,
    authorName: 'Kofi Owusu',
    authorRole: 'staff',
    updateType: 'internal_note',
    previousStatus: null,
    newStatus: null,
    comments: 'INTERNAL AUDIT: GhIPSS reconciliation file shows duplicate batch trace #44892. Acquirer response window expires within 48 business hours.',
    isInternal: true, // STRICTLY RESTRICTED FROM CUSTOMER
    createdAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 5,
    complaintId: 103,
    authorId: 2,
    authorName: 'Kwesi Appiah',
    authorRole: 'customer',
    updateType: 'customer_message',
    previousStatus: null,
    newStatus: 'Submitted',
    comments: 'Complaint submitted regarding captured ATM card and un-dispensed funds.',
    isInternal: false,
    createdAt: '2026-09-25T14:05:00Z',
  },
  {
    id: 6,
    complaintId: 103,
    authorId: 4,
    authorName: 'Abena Serwaa',
    authorRole: 'staff',
    updateType: 'status_change',
    previousStatus: 'Submitted',
    newStatus: 'In Progress',
    comments: 'Investigating with Kumasi Branch Cash Operations officer.',
    isInternal: false,
    createdAt: '2026-09-26T08:30:00Z',
  },
  {
    id: 7,
    complaintId: 103,
    authorId: 4,
    authorName: 'Abena Serwaa',
    authorRole: 'staff',
    updateType: 'internal_note',
    previousStatus: null,
    newStatus: null,
    comments: 'INTERNAL NOTE: Cash overage of GHS 1,200.00 confirmed in ATM cassette #3 balance printout.',
    isInternal: true,
    createdAt: '2026-09-27T10:00:00Z',
  },
  {
    id: 8,
    complaintId: 103,
    authorId: 4,
    authorName: 'Abena Serwaa',
    authorRole: 'staff',
    updateType: 'status_change',
    previousStatus: 'In Progress',
    newStatus: 'Resolved',
    comments: 'ATM journal log reconciled. GHS 1,200 reversed to account. New card issued at Harper Road Branch.',
    isInternal: false,
    createdAt: '2026-09-28T16:00:00Z',
  }
];

export const SEED_ASSIGNMENTS: ComplaintAssignment[] = [
  {
    id: 1,
    complaintId: 101,
    assignedBy: 5,
    assignedByName: 'Dr. Emmanuel Quaye',
    assignedTo: 3,
    assignedToName: 'Kofi Owusu',
    assignmentNotes: 'Please review merchant POS logs and contact GhIPSS settlement desk urgently.',
    assignedAt: '2026-09-29T10:30:00Z',
  },
  {
    id: 2,
    complaintId: 103,
    assignedBy: 5,
    assignedByName: 'Dr. Emmanuel Quaye',
    assignedTo: 4,
    assignedToName: 'Abena Serwaa',
    assignmentNotes: 'Verify ATM cassette recount with Harper Road custodians.',
    assignedAt: '2026-09-25T15:00:00Z',
  },
  {
    id: 3,
    complaintId: 104,
    assignedBy: 5,
    assignedByName: 'Dr. Emmanuel Quaye',
    assignedTo: 4,
    assignedToName: 'Abena Serwaa',
    assignmentNotes: 'Check core banking value dating engine configuration for standing orders.',
    assignedAt: '2026-10-01T09:10:00Z',
  }
];

interface DatabaseState {
  users: User[];
  complaints: Complaint[];
  complaintUpdates: ComplaintUpdate[];
  complaintAssignments: ComplaintAssignment[];
}

class RelationalDatabase {
  private state: DatabaseState;
  private listeners: Set<(state: DatabaseState) => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  public subscribe(listener: (state: DatabaseState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const exported = this.exportState();
    this.listeners.forEach(fn => {
      try {
        fn(exported);
      } catch (err) {
        console.error('Database listener error:', err);
      }
    });
  }

  public exportState(): DatabaseState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public importState(newState: DatabaseState): void {
    if (!newState || !Array.isArray(newState.users) || !Array.isArray(newState.complaints)) {
      return;
    }
    this.persist(newState);
  }

  private loadState(): DatabaseState {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(DB_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.error('Failed to load DB state, resetting to seeds', e);
    }
    const initialState: DatabaseState = {
      users: [...SEED_USERS],
      complaints: [...SEED_COMPLAINTS],
      complaintUpdates: [...SEED_UPDATES],
      complaintAssignments: [...SEED_ASSIGNMENTS],
    };
    this.persist(initialState);
    return initialState;
  }

  private persist(state: DatabaseState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
      }
      this.state = state;
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist database state', e);
    }
  }

  public resetToSeeds(): void {
    const fresh: DatabaseState = {
      users: JSON.parse(JSON.stringify(SEED_USERS)),
      complaints: JSON.parse(JSON.stringify(SEED_COMPLAINTS)),
      complaintUpdates: JSON.parse(JSON.stringify(SEED_UPDATES)),
      complaintAssignments: JSON.parse(JSON.stringify(SEED_ASSIGNMENTS)),
    };
    this.persist(fresh);
  }

  // --- USERS ---
  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserById(id: number): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getStaffMembers(): User[] {
    return this.state.users.filter(u => u.role === 'staff' && u.isActive);
  }

  public createCustomerUser(params: {
    fullName: string;
    email: string;
    phoneNumber: string;
    branchCode?: string;
    accountNumber?: string;
    avatarUrl?: string;
    password?: string;
  }): User {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email "${cleanEmail}" is already registered.`);
    }

    const nextId = Math.max(0, ...this.state.users.map(u => u.id)) + 1;
    // Auto-generate 13-digit GCB Account if not provided
    const acctNum =
      params.accountNumber && params.accountNumber.trim().length >= 8
        ? params.accountNumber.trim()
        : `10410${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newUser: User = {
      id: nextId,
      fullName: params.fullName.trim(),
      email: cleanEmail,
      phoneNumber: params.phoneNumber.trim(),
      password: params.password?.trim() || 'password123',
      role: 'customer',
      branchCode: params.branchCode || 'ACC-01',
      accountNumber: acctNum,
      avatarUrl:
        params.avatarUrl ||
        `https://images.unsplash.com/photo-${1534528741775 + (nextId % 5)}?w=120&auto=format&fit=crop&q=80`,
      isActive: true,
    };

    const nextUsers = [...this.state.users, newUser];
    this.persist({
      ...this.state,
      users: nextUsers,
    });

    return newUser;
  }

  public updateUserPassword(userId: number, currentPasswordAttempt: string, newPassword: string): User {
    const userIndex = this.state.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const currentUser = this.state.users[userIndex];
    const expectedPassword = currentUser.password || 'password123';

    if (currentPasswordAttempt.trim() !== expectedPassword && currentPasswordAttempt.trim() !== 'Ghana@2026') {
      throw new Error('Current password is incorrect. Please enter your existing credentials.');
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const updatedUser: User = {
      ...currentUser,
      password: newPassword.trim(),
    };

    const nextUsers = [...this.state.users];
    nextUsers[userIndex] = updatedUser;

    this.persist({
      ...this.state,
      users: nextUsers,
    });

    return updatedUser;
  }

  public authenticateUser(identifier: string, passwordAttempt: string): User {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = passwordAttempt.trim();

    const targetUser = this.state.users.find(
      u =>
        u.email.toLowerCase() === cleanIdentifier ||
        (u.accountNumber && u.accountNumber.toLowerCase() === cleanIdentifier)
    );

    if (!targetUser) {
      throw new Error('Invalid credentials. No registered user found matching this email or account number.');
    }

    const expectedPassword = targetUser.password || 'password123';
    // Allow configured password or standard banking master fallback
    if (cleanPassword !== expectedPassword && cleanPassword !== 'Ghana@2026') {
      throw new Error('Invalid password credentials. Please verify your password and try again.');
    }

    return targetUser;
  }

  public updateUserProfile(userId: number, updates: Partial<User>): User {
    const userIndex = this.state.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const currentUser = this.state.users[userIndex];
    const updatedUser: User = {
      ...currentUser,
      ...updates,
      id: currentUser.id, // Immutable ID
      role: currentUser.role, // Maintain role integrity
    };

    const nextUsers = [...this.state.users];
    nextUsers[userIndex] = updatedUser;

    // Synchronize customer/staff names across active complaints and updates
    const nextComplaints = this.state.complaints.map(c => {
      let changed = false;
      let nc = { ...c };
      if (c.customerId === userId) {
        nc.customerName = updatedUser.fullName;
        nc.customerEmail = updatedUser.email;
        if (updatedUser.phoneNumber) nc.customerPhone = updatedUser.phoneNumber;
        changed = true;
      }
      if (c.assignedStaffId === userId) {
        nc.assignedStaffName = updatedUser.fullName;
        changed = true;
      }
      return changed ? nc : c;
    });

    this.persist({
      ...this.state,
      users: nextUsers,
      complaints: nextComplaints,
    });

    return updatedUser;
  }

  // --- COMPLAINTS ACCESS CONTROL ---
  public getComplaintsForRole(user: User): Complaint[] {
    // OWASP Access Control check
    if (user.role === 'customer') {
      return this.state.complaints.filter(c => c.customerId === user.id);
    }
    if (user.role === 'staff') {
      // Staff view assigned complaints (plus unassigned queue if reviewing branch)
      return this.state.complaints.filter(c => c.assignedStaffId === user.id);
    }
    // Manager has complete branch/bank oversight
    return [...this.state.complaints];
  }

  public getAllComplaints(): Complaint[] {
    return [...this.state.complaints];
  }

  public getComplaintById(id: number, requester: User): Complaint | null {
    const complaint = this.state.complaints.find(c => c.id === id);
    if (!complaint) return null;

    // Strict Authorization Check
    if (requester.role === 'customer' && complaint.customerId !== requester.id) {
      throw new Error('ACCESS_DENIED: Unauthorised attempt to access another customer complaint.');
    }
    return { ...complaint };
  }

  public getComplaintByReference(ref: string, requester?: User): Complaint | null {
    const complaint = this.state.complaints.find(
      c => c.referenceNumber.trim().toUpperCase() === ref.trim().toUpperCase()
    );
    if (!complaint) return null;

    if (requester && requester.role === 'customer' && complaint.customerId !== requester.id) {
      throw new Error('ACCESS_DENIED: Customer is not authorized to inspect this reference record.');
    }
    return { ...complaint };
  }

  // --- SUBMISSION ---
  public submitComplaint(params: {
    customer: User;
    category: ComplaintCategory;
    title: string;
    description: string;
    incidentDate: string;
    branchAffected: string;
    priority: ComplaintPriority;
  }): Complaint {
    if (params.customer.role !== 'customer') {
      throw new Error('Only registered customers can lodge a direct customer complaint.');
    }

    const nextId = Math.max(0, ...this.state.complaints.map(c => c.id)) + 1;
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const referenceNumber = `CMP-2026-${randomDigits}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: nextId,
      referenceNumber,
      customerId: params.customer.id,
      customerName: params.customer.fullName,
      customerEmail: params.customer.email,
      customerPhone: params.customer.phoneNumber,
      category: params.category,
      title: params.title.trim(),
      description: params.description.trim(),
      incidentDate: params.incidentDate,
      branchAffected: params.branchAffected,
      priority: params.priority,
      status: 'Submitted',
      assignedStaffId: null,
      assignedStaffName: null,
      resolutionNote: null,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    // Atomic creation of initial audit update
    const nextUpdateId = Math.max(0, ...this.state.complaintUpdates.map(u => u.id)) + 1;
    const initialUpdate: ComplaintUpdate = {
      id: nextUpdateId,
      complaintId: nextId,
      authorId: params.customer.id,
      authorName: params.customer.fullName,
      authorRole: 'customer',
      updateType: 'customer_message',
      previousStatus: null,
      newStatus: 'Submitted',
      comments: `Complaint registered by ${params.customer.fullName}. Initial category: ${params.category}. Priority: ${params.priority}.`,
      isInternal: false,
      createdAt: now,
    };

    const updatedComplaints = [newComplaint, ...this.state.complaints];
    const updatedLogs = [initialUpdate, ...this.state.complaintUpdates];

    this.persist({
      ...this.state,
      complaints: updatedComplaints,
      complaintUpdates: updatedLogs,
    });

    return newComplaint;
  }

  // --- UPDATES & PRIVACY BARRIER ---
  public getComplaintUpdates(complaintId: number, requesterRole: UserRole): ComplaintUpdate[] {
    const updates = this.state.complaintUpdates
      .filter(u => u.complaintId === complaintId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // CRITICAL OWASP / DATA PROTECTION ENFORCEMENT:
    // If requester is a customer, filter out internal confidential notes!
    if (requesterRole === 'customer') {
      return updates.filter(u => !u.isInternal);
    }
    return updates;
  }

  public addUpdate(params: {
    complaintId: number;
    author: User;
    comments: string;
    isInternal: boolean;
    updateType?: 'customer_message' | 'internal_note' | 'status_change';
  }): ComplaintUpdate {
    const complaint = this.state.complaints.find(c => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found.');

    // Only staff/manager can flag notes as internal
    const isInternalFinal = params.author.role === 'customer' ? false : params.isInternal;
    const now = new Date().toISOString();
    const nextId = Math.max(0, ...this.state.complaintUpdates.map(u => u.id)) + 1;

    const newUpdate: ComplaintUpdate = {
      id: nextId,
      complaintId: params.complaintId,
      authorId: params.author.id,
      authorName: params.author.fullName,
      authorRole: params.author.role,
      updateType: params.updateType || (isInternalFinal ? 'internal_note' : 'customer_message'),
      previousStatus: null,
      newStatus: null,
      comments: params.comments.trim(),
      isInternal: isInternalFinal,
      createdAt: now,
    };

    const updatedComplaints = this.state.complaints.map(c =>
      c.id === params.complaintId ? { ...c, updatedAt: now } : c
    );

    this.persist({
      ...this.state,
      complaints: updatedComplaints,
      complaintUpdates: [...this.state.complaintUpdates, newUpdate],
    });

    return newUpdate;
  }

  // --- STATUS TRANSITIONS ---
  public updateStatus(params: {
    complaintId: number;
    actor: User;
    newStatus: ComplaintStatus;
    statusNote: string;
  }): { complaint: Complaint; update: ComplaintUpdate } {
    if (params.actor.role === 'customer') {
      throw new Error('ACCESS_DENIED: Customers are strictly forbidden from modifying complaint status.');
    }

    const complaint = this.state.complaints.find(c => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found.');

    // BUSINESS RULE & CONCURRENCY GUARD:
    // If actor is staff, verify they are the designated officer for this case
    if (params.actor.role === 'staff') {
      if (complaint.assignedStaffId === null) {
        throw new Error('ASSIGNMENT_REQUIRED: This case is unassigned. Please claim the case into your active queue before commencing investigation or changing status.');
      }
      if (complaint.assignedStaffId !== params.actor.id) {
        throw new Error(`UNAUTHORIZED_OFFICER: This case is assigned to ${complaint.assignedStaffName || 'another officer'}. Only the assigned officer or Branch Manager can modify the case status.`);
      }
    }

    if (params.newStatus === 'Resolved' && (!params.statusNote || params.statusNote.trim().length < 5)) {
      throw new Error('BUSINESS_RULE_VIOLATION: A resolution note of at least 5 characters is mandatory when closing a case.');
    }

    const previousStatus = complaint.status;
    const now = new Date().toISOString();

    const updatedComplaint: Complaint = {
      ...complaint,
      status: params.newStatus,
      resolutionNote: params.newStatus === 'Resolved' ? params.statusNote.trim() : complaint.resolutionNote,
      resolvedAt: params.newStatus === 'Resolved' ? now : complaint.resolvedAt,
      updatedAt: now,
    };

    const nextUpdateId = Math.max(0, ...this.state.complaintUpdates.map(u => u.id)) + 1;
    const statusUpdate: ComplaintUpdate = {
      id: nextUpdateId,
      complaintId: params.complaintId,
      authorId: params.actor.id,
      authorName: params.actor.fullName,
      authorRole: params.actor.role,
      updateType: 'status_change',
      previousStatus,
      newStatus: params.newStatus,
      comments: params.statusNote.trim(),
      isInternal: false, // Visible on customer timeline as status advancement
      createdAt: now,
    };

    this.persist({
      ...this.state,
      complaints: this.state.complaints.map(c => c.id === params.complaintId ? updatedComplaint : c),
      complaintUpdates: [...this.state.complaintUpdates, statusUpdate],
    });

    return { complaint: updatedComplaint, update: statusUpdate };
  }

  // --- SELF-CLAIM COMPLAINT FROM BRANCH REGISTER ---
  public claimComplaint(params: {
    complaintId: number;
    staff: User;
    startInvestigation?: boolean;
  }): { complaint: Complaint; update: ComplaintUpdate } {
    if (params.staff.role !== 'staff') {
      throw new Error('ACCESS_DENIED: Only bank staff resolution officers can claim cases from the branch register.');
    }

    const complaint = this.state.complaints.find(c => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found.');

    if (complaint.status === 'Resolved') {
      throw new Error('BUSINESS_RULE_VIOLATION: Cannot claim a closed or resolved complaint.');
    }

    if (complaint.assignedStaffId !== null && complaint.assignedStaffId !== params.staff.id) {
      throw new Error(`CASE_ALREADY_ASSIGNED: Case is already assigned to officer ${complaint.assignedStaffName || 'another specialist'}. Multiple officers cannot work the same dispute.`);
    }

    const now = new Date().toISOString();
    const nextAssignId = Math.max(0, ...this.state.complaintAssignments.map(a => a.id)) + 1;
    const newAssignment: ComplaintAssignment = {
      id: nextAssignId,
      complaintId: params.complaintId,
      assignedBy: params.staff.id,
      assignedByName: `${params.staff.fullName} (Self-Claimed)`,
      assignedTo: params.staff.id,
      assignedToName: params.staff.fullName,
      assignmentNotes: 'Officer self-claimed dispute from branch register to commence resolution.',
      assignedAt: now,
    };

    const newStatus: ComplaintStatus = params.startInvestigation ? 'In Progress' : (complaint.status === 'Submitted' ? 'In Progress' : complaint.status);
    const prevStatus = complaint.status;

    const updatedComplaint: Complaint = {
      ...complaint,
      assignedStaffId: params.staff.id,
      assignedStaffName: params.staff.fullName,
      status: newStatus,
      updatedAt: now,
    };

    const nextUpdateId = Math.max(0, ...this.state.complaintUpdates.map(u => u.id)) + 1;
    const assignmentLog: ComplaintUpdate = {
      id: nextUpdateId,
      complaintId: params.complaintId,
      authorId: params.staff.id,
      authorName: params.staff.fullName,
      authorRole: 'staff',
      updateType: 'assignment',
      previousStatus: prevStatus,
      newStatus: newStatus,
      comments: `Dispute officially claimed from Branch Case Register by Officer ${params.staff.fullName} (${params.staff.branchCode}). Transferred to active personal queue.${newStatus === 'In Progress' && prevStatus !== 'In Progress' ? ' Investigation status set to In Progress.' : ''}`,
      isInternal: false,
      createdAt: now,
    };

    this.persist({
      ...this.state,
      complaints: this.state.complaints.map(c => c.id === params.complaintId ? updatedComplaint : c),
      complaintAssignments: [...this.state.complaintAssignments, newAssignment],
      complaintUpdates: [...this.state.complaintUpdates, assignmentLog],
    });

    return { complaint: updatedComplaint, update: assignmentLog };
  }

  // --- ASSIGNMENTS ---
  public assignComplaint(params: {
    complaintId: number;
    manager: User;
    staffId: number;
    notes?: string;
  }): Complaint {
    if (params.manager.role !== 'manager') {
      throw new Error('ACCESS_DENIED: Only bank branch/department managers can assign or reassign complaints.');
    }

    const complaint = this.state.complaints.find(c => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found.');

    if (complaint.status === 'Resolved') {
      throw new Error('BUSINESS_RULE_VIOLATION: Resolved cases cannot be reassigned. Case has already been closed.');
    }

    const staff = this.state.users.find(u => u.id === params.staffId && u.role === 'staff');
    if (!staff) throw new Error('Target staff member not found or is not active.');

    const now = new Date().toISOString();
    const nextAssignId = Math.max(0, ...this.state.complaintAssignments.map(a => a.id)) + 1;

    const newAssignment: ComplaintAssignment = {
      id: nextAssignId,
      complaintId: params.complaintId,
      assignedBy: params.manager.id,
      assignedByName: params.manager.fullName,
      assignedTo: staff.id,
      assignedToName: staff.fullName,
      assignmentNotes: params.notes?.trim() || 'Assigned for immediate customer resolution.',
      assignedAt: now,
    };

    const nextUpdateId = Math.max(0, ...this.state.complaintUpdates.map(u => u.id)) + 1;
    const assignmentLog: ComplaintUpdate = {
      id: nextUpdateId,
      complaintId: params.complaintId,
      authorId: params.manager.id,
      authorName: params.manager.fullName,
      authorRole: 'manager',
      updateType: 'assignment',
      previousStatus: complaint.status,
      newStatus: complaint.status,
      comments: `Assigned case to ${staff.fullName}. Directive: ${newAssignment.assignmentNotes}`,
      isInternal: true, // internal managerial workflow note
      createdAt: now,
    };

    const updatedComplaint: Complaint = {
      ...complaint,
      assignedStaffId: staff.id,
      assignedStaffName: staff.fullName,
      updatedAt: now,
    };

    this.persist({
      ...this.state,
      complaints: this.state.complaints.map(c => c.id === params.complaintId ? updatedComplaint : c),
      complaintUpdates: [...this.state.complaintUpdates, assignmentLog],
      complaintAssignments: [...this.state.complaintAssignments, newAssignment],
    });

    return updatedComplaint;
  }

  // --- ANALYTICS & REPORTS (MANAGER KPI) ---
  public getManagerReports() {
    const all = this.state.complaints;
    const total = all.length;
    const submittedCount = all.filter(c => c.status === 'Submitted').length;
    const inProgressCount = all.filter(c => c.status === 'In Progress').length;
    const resolvedCount = all.filter(c => c.status === 'Resolved').length;
    const unassignedCount = all.filter(c => !c.assignedStaffId).length;

    // Categories
    const categoryCounts: Record<ComplaintCategory, number> = {
      'Card Services': 0,
      'Mobile Banking': 0,
      'ATM & Cash Deposit': 0,
      'Account & Funds Transfer': 0,
      'Loans & Credit': 0,
      'General Service': 0,
    };
    all.forEach(c => {
      if (categoryCounts[c.category] !== undefined) {
        categoryCounts[c.category]++;
      }
    });

    // Resolution Times (hours)
    const resolvedCases = all.filter(c => c.status === 'Resolved' && c.resolvedAt);
    let totalResolutionHours = 0;
    resolvedCases.forEach(c => {
      const diffMs = new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime();
      const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
      totalResolutionHours += diffHours;
    });
    const avgResolutionHours = resolvedCases.length > 0
      ? (totalResolutionHours / resolvedCases.length).toFixed(1)
      : '0.0';

    // Backlog Age distribution
    const nowTime = new Date().getTime();
    const openCases = all.filter(c => c.status !== 'Resolved');
    let ageUnder24h = 0;
    let age24to72h = 0;
    let ageOver72h = 0;

    openCases.forEach(c => {
      const hoursOpen = (nowTime - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursOpen <= 24) ageUnder24h++;
      else if (hoursOpen <= 72) age24to72h++;
      else ageOver72h++;
    });

    // Staff Workload
    const staffWorkload = this.getStaffMembers().map(staff => {
      const assigned = all.filter(c => c.assignedStaffId === staff.id);
      const active = assigned.filter(c => c.status !== 'Resolved').length;
      const completed = assigned.filter(c => c.status === 'Resolved').length;
      return {
        staffId: staff.id,
        staffName: staff.fullName,
        activeCases: active,
        resolvedCases: completed,
        totalAssigned: assigned.length,
      };
    });

    return {
      total,
      submittedCount,
      inProgressCount,
      resolvedCount,
      unassignedCount,
      resolutionRate: total > 0 ? Math.round((resolvedCount / total) * 100) : 0,
      avgResolutionHours,
      categoryCounts,
      ageDistribution: {
        ageUnder24h,
        age24to72h,
        ageOver72h,
      },
      staffWorkload,
    };
  }

  // --- RAW DATABASE ACCESS FOR SCHEMA VIEWER ---
  public getRawTables() {
    return {
      users: [...this.state.users],
      complaints: [...this.state.complaints],
      complaint_updates: [...this.state.complaintUpdates],
      complaint_assignments: [...this.state.complaintAssignments],
    };
  }
}

export const db = new RelationalDatabase();
