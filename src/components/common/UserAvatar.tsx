import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { UserRole } from '../../types';

interface UserAvatarProps {
  user?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string | null;
    role?: UserRole;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showRoleDot?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showRoleDot = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Reset image failure state if avatarUrl changes
  useEffect(() => {
    setImageFailed(false);
  }, [user?.avatarUrl]);

  // Extract initials cleanly, ignoring common titles
  const getInitials = (name?: string, email?: string): string => {
    if (!name && !email) return '';
    const cleanName = (name || email || '')
      .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Rev\.)\s+/i, '')
      .trim();

    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (cleanName[0] || 'U').toUpperCase();
  };

  const initials = getInitials(user?.fullName, user?.email);

  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-3xl font-extrabold',
  }[size];

  const dotSizeClasses = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2',
    '2xl': 'w-5 h-5 ring-4',
  }[size];

  // Distinctive role backgrounds for when no image is available
  const getRoleGradient = (role?: UserRole) => {
    switch (role) {
      case 'customer':
        return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-300/40 shadow-xs';
      case 'staff':
        return 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-300/40 shadow-xs';
      case 'manager':
        return 'bg-gradient-to-br from-purple-600 to-purple-900 text-white border-purple-300/40 shadow-xs';
      default:
        return 'bg-gradient-to-br from-slate-600 to-slate-800 text-white border-slate-300/40 shadow-xs';
    }
  };

  const getRoleDotColor = (role?: UserRole) => {
    switch (role) {
      case 'customer':
        return 'bg-amber-400';
      case 'staff':
        return 'bg-blue-400';
      case 'manager':
        return 'bg-purple-400';
      default:
        return 'bg-emerald-400';
    }
  };

  const hasValidImage = Boolean(user?.avatarUrl && user.avatarUrl.trim() !== '' && !imageFailed);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none rounded-full ${sizeClasses} ${className}`}>
      {hasValidImage ? (
        <img
          src={user?.avatarUrl || ''}
          alt={user?.fullName || 'User Profile Photo'}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="w-full h-full rounded-full object-cover border border-slate-200/80 shadow-2xs"
        />
      ) : (
        <div
          className={`w-full h-full ${getRoleGradient(
            user?.role
          )} rounded-full flex items-center justify-center border font-sans tracking-wide shadow-2xs`}
          aria-label={user?.fullName || 'User Profile'}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <UserIcon className="w-1/2 h-1/2 text-white/90" />
          )}
        </div>
      )}

      {showRoleDot && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${dotSizeClasses} ${getRoleDotColor(
            user?.role
          )}`}
          title={`Role: ${user?.role || 'user'}`}
        />
      )}
    </div>
  );
};
