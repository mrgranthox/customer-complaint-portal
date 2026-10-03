import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { db, SEED_USERS } from './src/db/database';
import { User, ComplaintCategory, ComplaintPriority, ComplaintStatus } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // --- PERSISTENT FILE STORAGE ---
  const DATA_DIR = path.join(__dirname, 'data');
  const DB_FILE_PATH = path.join(DATA_DIR, 'ccts_database.json');

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      db.importState(parsed);
      console.log(`[Persistence] Restored database state from ${DB_FILE_PATH}`);
    } else {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db.exportState(), null, 2), 'utf-8');
      console.log(`[Persistence] Initialized new persistent storage at ${DB_FILE_PATH}`);
    }
  } catch (err) {
    console.error('[Persistence] Initialization error:', err);
  }

  // Subscribe to automatically write all updates to disk
  db.subscribe(latestState => {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(latestState, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Persistence] Error writing state to file:', err);
    }
  });

  // --- REAL-TIME SSE (SERVER-SENT EVENTS) BUS ---
  const sseClients: Set<Response> = new Set();

  const broadcastRealtime = (event: {
    type: 'COMPLAINT_CREATED' | 'STATUS_UPDATED' | 'NOTE_ADDED' | 'CASE_ASSIGNED' | 'CUSTOMER_REGISTERED' | 'DATABASE_RESET' | 'PROFILE_UPDATED' | 'SECURITY_ALERT';
    title: string;
    message: string;
    data?: any;
  }) => {
    const payload = `data: ${JSON.stringify({ ...event, id: Date.now(), timestamp: new Date().toISOString() })}\n\n`;
    for (const client of Array.from(sseClients)) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  app.get('/api/realtime/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    sseClients.add(res);

    res.write(
      `data: ${JSON.stringify({
        type: 'CONNECTED',
        title: 'Real-Time Connected',
        message: 'Connected to GCB Live Synchronization Event Stream',
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Helper to extract or fallback to active user
  const getUserFromRequest = (req: Request): User => {
    const userIdHeader = req.headers['x-user-id'] || req.query.userId;
    if (userIdHeader) {
      const parsedId = parseInt(userIdHeader as string, 10);
      const user = db.getUsers().find(u => u.id === parsedId);
      if (user) return user;
    }
    // Default to first user (Ama Mensah - Customer)
    return db.getUsers()[0];
  };

  // 1. Health Check Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'GCB Bank CCTS API',
      version: '2.5.0',
      uptime: process.uptime(),
      persistence: 'file_storage (data/ccts_database.json)',
      connectedClients: sseClients.size,
      timestamp: new Date().toISOString(),
    });
  });

  // Database Export & Sync
  app.get('/api/db/export', (req: Request, res: Response) => {
    res.json({ success: true, data: db.exportState() });
  });

  // Auth Endpoints: Login, Logout, and Current Session
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, emailOrAccount, password, userId } = req.body;
    let targetUser: User | undefined;

    const identifier = (email || emailOrAccount || '').trim();

    try {
      if (userId) {
        targetUser = db.getUsers().find(u => u.id === parseInt(userId, 10));
        if (!targetUser) {
          return res.status(401).json({
            success: false,
            error: 'User account not found in bank directory.',
          });
        }
      } else if (identifier) {
        targetUser = db.authenticateUser(identifier, password || '');
      } else {
        return res.status(400).json({
          success: false,
          error: 'Please provide your registered email address and account password.',
        });
      }

      res.json({
        success: true,
        message: `Authenticated successfully as ${targetUser.fullName}`,
        data: targetUser,
        token: `gcb_session_${targetUser.id}_${Date.now()}`,
      });
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        error: err?.message || 'Authentication failed. Please verify your credentials.',
      });
    }
  });

  // Account Creation for Customers
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { fullName, email, phoneNumber, branchCode, accountNumber, password } = req.body;

    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Full name must be at least 3 characters.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!phoneNumber || phoneNumber.trim().length < 7) {
      return res.status(400).json({ success: false, error: 'A valid phone number is required.' });
    }
    if (password && password.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    try {
      const newUser = db.createCustomerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        branchCode: branchCode || 'ACC-01',
        accountNumber: accountNumber?.trim() || undefined,
        password: password?.trim() || undefined,
      });

      broadcastRealtime({
        type: 'CUSTOMER_REGISTERED',
        title: 'New Customer Registered',
        message: `${newUser.fullName} (${newUser.accountNumber}) opened dispute profile at ${newUser.branchCode}`,
        data: newUser,
      });

      res.status(201).json({
        success: true,
        message: 'Customer account registered successfully.',
        data: newUser,
        token: `gcb_session_${newUser.id}_${Date.now()}`,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err?.message || 'Failed to register customer account.',
      });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Successfully signed out of GCB CCTS.',
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    res.json({ success: true, data: user });
  });

  // 2. Users Endpoints
  app.get('/api/users', (req: Request, res: Response) => {
    const role = req.query.role as string;
    let users = db.getUsers();
    if (role) {
      users = users.filter(u => u.role === role);
    }
    res.json({ success: true, count: users.length, data: users });
  });

  app.get('/api/users/current', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    res.json({ success: true, data: user });
  });

  app.put('/api/users/profile', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    try {
      const { fullName, phoneNumber, branchCode, accountNumber, avatarUrl, department, jobTitle, bio, address, notificationsEnabled, smsNotifications } = req.body;
      const updated = db.updateUserProfile(user.id, {
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...(phoneNumber ? { phoneNumber: phoneNumber.trim() } : {}),
        ...(branchCode ? { branchCode: branchCode.trim() } : {}),
        ...(accountNumber ? { accountNumber: accountNumber.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(jobTitle !== undefined ? { jobTitle } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(notificationsEnabled !== undefined ? { notificationsEnabled } : {}),
        ...(smsNotifications !== undefined ? { smsNotifications } : {}),
      });

      broadcastRealtime({
        type: 'PROFILE_UPDATED',
        title: 'User Profile Updated',
        message: `${updated.fullName} updated profile settings.`,
        data: updated,
      });

      res.json({ success: true, message: 'Profile updated successfully.', data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Failed to update profile.' });
    }
  });

  app.post('/api/users/change-password', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required.' });
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }

    try {
      const updatedUser = db.updateUserPassword(user.id, currentPassword, newPassword);

      broadcastRealtime({
        type: 'SECURITY_ALERT',
        title: 'Account Security Updated',
        message: `${updatedUser.fullName} changed their portal password.`,
        data: { userId: user.id },
      });

      res.json({
        success: true,
        message: 'Password changed and saved successfully.',
        data: updatedUser,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Failed to update password.' });
    }
  });

  app.get('/api/users/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const user = db.getUsers().find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  });

  // 3. Complaints Endpoints
  app.get('/api/complaints', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const { status, category, search } = req.query;

    let complaints = db.getComplaintsForRole(user);

    if (status && status !== 'All') {
      complaints = complaints.filter(c => c.status === status);
    }
    if (category && category !== 'All') {
      complaints = complaints.filter(c => c.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      complaints = complaints.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.referenceNumber.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      requestingRole: user.role,
      count: complaints.length,
      data: complaints,
    });
  });

  app.get('/api/complaints/:id', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const idParam = req.params.id;

    let complaint = null;
    const numericId = parseInt(idParam, 10);
    if (!isNaN(numericId)) {
      try {
        complaint = db.getComplaintById(numericId, user);
      } catch (err: any) {
        return res.status(403).json({
          success: false,
          error: err?.message || 'Access Denied (IDOR Protection)',
        });
      }
    } else {
      // Lookup by reference number
      complaint = db.getComplaintByReference(idParam);
      if (complaint && user.role === 'customer' && complaint.customerId !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You do not have permission to view this complaint.',
        });
      }
    }

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const updates = db.getComplaintUpdates(complaint.id, user.role);
    res.json({ success: true, data: complaint, updates });
  });

  // 4. Create New Complaint Endpoint
  app.post('/api/complaints', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const { title, description, category, incidentDate, branchAffected, priority } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Title must be at least 5 characters long.' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Description must be at least 10 characters long.' });
    }

    try {
      const created = db.submitComplaint({
        customer: user,
        category: (category as ComplaintCategory) || 'General Service',
        title: title.trim(),
        description: description.trim(),
        incidentDate: incidentDate || new Date().toISOString().split('T')[0],
        branchAffected: branchAffected || user.branchCode,
        priority: (priority as ComplaintPriority) || 'Medium',
      });

      broadcastRealtime({
        type: 'COMPLAINT_CREATED',
        title: 'New Complaint Lodged',
        message: `Case #${created.referenceNumber}: "${created.title}" by ${created.customerName}`,
        data: created,
      });

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        data: created,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to submit complaint' });
    }
  });

  // 5. Complaint Updates / Audit Log Endpoints
  app.get('/api/complaints/:id/updates', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const complaintId = parseInt(req.params.id, 10);

    try {
      const updates = db.getComplaintUpdates(complaintId, user.role);
      res.json({ success: true, count: updates.length, data: updates });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Error fetching updates' });
    }
  });

  app.post('/api/complaints/:id/updates', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const complaintId = parseInt(req.params.id, 10);
    const { comments, isInternal, updateType } = req.body;

    if (!comments || !comments.trim()) {
      return res.status(400).json({ success: false, error: 'Comments cannot be empty' });
    }

    try {
      const update = db.addUpdate({
        complaintId,
        author: user,
        comments: comments.trim(),
        isInternal: isInternal === true,
        updateType: updateType || 'investigation_note',
      });

      broadcastRealtime({
        type: 'NOTE_ADDED',
        title: update.isInternal ? 'Internal Audit Note Added' : 'Public Note Added',
        message: `Case #${complaintId}: ${user.fullName} logged an update`,
        data: update,
      });

      res.status(201).json({ success: true, data: update });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err?.message || 'Failed to add update' });
    }
  });

  // 6. Assign Complaint Endpoint (Manager authority)
  app.post('/api/complaints/:id/assign', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const complaintId = parseInt(req.params.id, 10);
    const { staffId, notes } = req.body;

    if (user.role !== 'manager') {
      return res.status(403).json({ success: false, error: 'Only branch managers can assign complaints.' });
    }

    const targetStaff = db.getUsers().find(u => u.id === parseInt(staffId, 10));
    if (!targetStaff) {
      return res.status(404).json({ success: false, error: 'Target staff member not found' });
    }

    const complaint = db.getAllComplaints().find(c => c.id === complaintId);
    if (complaint && complaint.status === 'Resolved') {
      return res.status(400).json({ success: false, error: 'Resolved cases cannot be reassigned.' });
    }

    try {
      const updated = db.assignComplaint({
        complaintId,
        manager: user,
        staffId: parseInt(staffId, 10),
        notes: notes || 'Assigned by Branch Manager',
      });

      broadcastRealtime({
        type: 'CASE_ASSIGNED',
        title: 'Case Reallocated',
        message: `Complaint #${updated.referenceNumber} assigned to ${targetStaff.fullName}`,
        data: { complaintId, staffId, staffName: targetStaff.fullName },
      });

      res.json({
        success: true,
        message: `Complaint #${complaintId} assigned to ${targetStaff.fullName}`,
        data: updated,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Failed to assign complaint' });
    }
  });

  // 6b. Self-Claim Complaint Endpoint (Staff officer claim from branch register)
  app.post('/api/complaints/:id/claim', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const complaintId = parseInt(req.params.id, 10);
    const { startInvestigation } = req.body;

    if (user.role !== 'staff') {
      return res.status(403).json({ success: false, error: 'Only staff resolution officers can self-claim cases.' });
    }

    try {
      const { complaint: claimed, update } = db.claimComplaint({
        complaintId,
        staff: user,
        startInvestigation: startInvestigation !== false,
      });

      broadcastRealtime({
        type: 'CASE_ASSIGNED',
        title: 'Dispute Claimed by Officer',
        message: `Case #${claimed.referenceNumber} claimed by Officer ${user.fullName}`,
        data: { complaintId, staffId: user.id, staffName: user.fullName, status: claimed.status },
      });

      res.json({
        success: true,
        message: `Case #${claimed.referenceNumber} successfully claimed into your active queue.`,
        data: claimed,
        update,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Failed to claim complaint' });
    }
  });

  // 7. Resolve Complaint Endpoint
  app.post('/api/complaints/:id/resolve', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const complaintId = parseInt(req.params.id, 10);
    const { resolutionNote } = req.body;

    if (user.role === 'customer') {
      return res.status(403).json({ success: false, error: 'Customers cannot mark complaints as resolved.' });
    }

    if (!resolutionNote || resolutionNote.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'A valid resolution note is required.' });
    }

    try {
      const { complaint: resolvedComplaint, update } = db.updateStatus({
        complaintId,
        actor: user,
        newStatus: 'Resolved',
        statusNote: resolutionNote.trim(),
      });

      broadcastRealtime({
        type: 'STATUS_UPDATED',
        title: 'Complaint Resolved',
        message: `Case #${resolvedComplaint.referenceNumber} marked Resolved by ${user.fullName}`,
        data: resolvedComplaint,
      });

      res.json({
        success: true,
        message: `Complaint #${complaintId} successfully marked as resolved.`,
        data: resolvedComplaint,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Failed to resolve complaint' });
    }
  });

  // 7b. General Status Update Endpoint
  app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    const complaintId = parseInt(req.params.id, 10);
    const { status, statusNote } = req.body;

    if (user.role === 'customer') {
      return res.status(403).json({ success: false, error: 'Customers cannot modify complaint status.' });
    }

    try {
      const { complaint: updatedComplaint } = db.updateStatus({
        complaintId,
        actor: user,
        newStatus: status as ComplaintStatus,
        statusNote: statusNote || `Status updated to ${status}`,
      });

      broadcastRealtime({
        type: 'STATUS_UPDATED',
        title: 'Status Progression',
        message: `Case #${updatedComplaint.referenceNumber} transitioned to "${status}"`,
        data: updatedComplaint,
      });

      res.json({
        success: true,
        message: `Complaint status updated to ${status}`,
        data: updatedComplaint,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Status update failed' });
    }
  });

  // 8. Reports & Analytics Endpoint
  app.get('/api/reports', (req: Request, res: Response) => {
    try {
      const reports = db.getManagerReports();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Error generating reports' });
    }
  });

  // 9. Reset Database Endpoint
  app.post('/api/reset', (req: Request, res: Response) => {
    try {
      db.resetToSeeds();
      res.json({ success: true, message: 'Database reset to default research seed records.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Reset failed' });
    }
  });

  // Mount Vite or serve static files
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GCB Bank CCTS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
