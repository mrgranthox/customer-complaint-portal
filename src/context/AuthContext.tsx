import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db, SEED_USERS } from '../db/database';

export interface ToastItem {
  id: string;
  title?: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'realtime';
  timestamp?: string;
}

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  signIn: (params: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  switchUser: (user: User) => void;
  registerCustomer: (params: {
    fullName: string;
    email: string;
    phoneNumber: string;
    branchCode?: string;
    accountNumber?: string;
    password?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  allUsers: User[];
  dbVersion: number;
  triggerRefresh: () => void;
  resetDatabase: () => void;
  toasts: ToastItem[];
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'realtime', title?: string) => void;
  dismissToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ccts_active_user_id');
      if (saved === 'logged_out') return false;
      return true;
    } catch {
      return true;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('ccts_active_user_id');
      if (saved && saved !== 'logged_out') {
        const id = Number(saved);
        const match = SEED_USERS.find(u => u.id === id);
        if (match) return match;
      }
      return SEED_USERS[0];
    } catch {
      return SEED_USERS[0];
    }
  });

  const [dbVersion, setDbVersion] = useState<number>(1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const triggerRefresh = () => {
    setDbVersion(v => v + 1);
  };

  const showToast = (
    text: string,
    type: 'success' | 'error' | 'info' | 'realtime' = 'info',
    title?: string
  ) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast: ToastItem = { id, text, type, title, timestamp: nowTime };

    setToasts(prev => [newToast, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync users & session on dbVersion update
  useEffect(() => {
    const users = db.getUsers();
    setAllUsers(users);
    const savedUserId = localStorage.getItem('ccts_active_user_id');
    if (!savedUserId || savedUserId === 'logged_out') {
      setIsAuthenticated(false);
    } else {
      const found = users.find(u => u.id === Number(savedUserId));
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [dbVersion]);

  // Initial load from server persistence
  useEffect(() => {
    fetch('/api/db/export')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          db.importState(data.data);
          setAllUsers(db.getUsers());
          triggerRefresh();
        }
      })
      .catch(() => {});
  }, []);

  // Real-time Server-Sent Events (SSE) listener
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/realtime/stream');

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'CONNECTED') return;

          // Fetch full persistent state to ensure absolute synchronization
          fetch('/api/db/export')
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data) {
                db.importState(data.data);
                triggerRefresh();
              }
            })
            .catch(() => {});

          showToast(payload.message, 'realtime', `⚡ Real-Time: ${payload.title}`);
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };

      es.onerror = () => {
        // EventSource will automatically retry connection
      };
    } catch (e) {
      console.error('EventSource connection error:', e);
    }

    return () => {
      es?.close();
    };
  }, []);

  const signIn = async (params: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPassword = (params.password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your account password.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      const targetUser: User = data.data;
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      localStorage.setItem('ccts_active_user_id', String(targetUser.id));
      showToast(`Welcome back, ${targetUser.fullName}! Signed in as ${targetUser.role.toUpperCase()}.`, 'success', 'Session Established');
      return { success: true };
    } catch {
      // Local fallback
      try {
        const targetUser = db.authenticateUser(cleanEmail, cleanPassword);
        setCurrentUser(targetUser);
        setIsAuthenticated(true);
        localStorage.setItem('ccts_active_user_id', String(targetUser.id));
        showToast(`Welcome back, ${targetUser.fullName}! Signed in as ${targetUser.role.toUpperCase()}.`, 'success', 'Session Established');
        return { success: true };
      } catch (authErr: any) {
        return {
          success: false,
          error: authErr?.message || 'Invalid credentials.',
        };
      }
    }
  };

  const registerCustomer = async (params: {
    fullName: string;
    email: string;
    phoneNumber: string;
    branchCode?: string;
    accountNumber?: string;
    password?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server registration failed');
      }

      const newUser: User = data.data;
      // Sync local db
      try {
        db.createCustomerUser(params);
      } catch {
        // already synced
      }

      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('ccts_active_user_id', String(newUser.id));
      triggerRefresh();

      showToast(
        `Welcome to GCB Bank! Your customer dispute profile is now active. Account: ${newUser.accountNumber}`,
        'success',
        'Account Registered'
      );
      return { success: true, user: newUser };
    } catch (err: any) {
      // Offline fallback
      try {
        const newUser = db.createCustomerUser(params);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('ccts_active_user_id', String(newUser.id));
        triggerRefresh();

        showToast(
          `Welcome to GCB Bank! Your customer dispute profile is now active. Account: ${newUser.accountNumber}`,
          'success',
          'Account Registered'
        );
        return { success: true, user: newUser };
      } catch (innerErr: any) {
        return { success: false, error: innerErr?.message || err?.message || 'Registration failed' };
      }
    }
  };

  const signOut = () => {
    const prevName = currentUser.fullName;
    setIsAuthenticated(false);
    localStorage.setItem('ccts_active_user_id', 'logged_out');
    showToast(`${prevName} safely signed out of GCB CCTS.`, 'info', 'Signed Out');
  };

  const updateUserProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      try {
        await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify(updates),
        });
      } catch {
        // Fallback to local storage persistence
      }

      const updated = db.updateUserProfile(currentUser.id, updates);
      setCurrentUser(updated);
      setAllUsers(db.getUsers());
      triggerRefresh();
      showToast('Profile information successfully saved and synchronized.', 'success', 'Profile Updated');
      return { success: true, user: updated };
    } catch (err: any) {
      const msg = err?.message || 'Failed to update profile';
      showToast(msg, 'error', 'Profile Error');
      return { success: false, error: msg };
    }
  };

  const changePassword = async (
    currentPasswordAttempt: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      try {
        const res = await fetch('/api/users/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(currentUser.id),
          },
          body: JSON.stringify({
            currentPassword: currentPasswordAttempt,
            newPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Password update rejected by server.');
        }
      } catch (networkErr: any) {
        // Fallback to local
        if (networkErr?.message && !networkErr.message.includes('fetch')) {
          throw networkErr;
        }
      }

      const updated = db.updateUserPassword(currentUser.id, currentPasswordAttempt, newPassword);
      setCurrentUser(updated);
      setAllUsers(db.getUsers());
      triggerRefresh();
      showToast('Account password successfully updated and persisted.', 'success', 'Password Changed');
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Failed to change password';
      showToast(msg, 'error', 'Security Error');
      return { success: false, error: msg };
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('ccts_active_user_id', String(user.id));
    showToast(`Switched active session to ${user.fullName} (${user.role.toUpperCase()})`, 'info', 'Role Switched');
  };

  const resetDatabase = async () => {
    try {
      await fetch('/api/db/reset', { method: 'POST' });
    } catch {
      // ignore
    }
    db.resetToSeeds();
    triggerRefresh();
    showToast('Database reset to fresh reference banking seed records.', 'success', 'Database Reset');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        signIn,
        signOut,
        updateUserProfile,
        changePassword,
        switchUser,
        registerCustomer,
        allUsers,
        dbVersion,
        triggerRefresh,
        resetDatabase,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

