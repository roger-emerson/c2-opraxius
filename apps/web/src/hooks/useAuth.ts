import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { Permission } from '@c2/shared';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;

  return {
    user,
    isAuthenticated,
    isLoading,
    session,
  };
}

export function usePermission(permission: Permission) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check user's permissions array
    return user.permissions.some((p: Permission) => {
      // Resource and action must match
      if (p.resource !== permission.resource || p.action !== permission.action) {
        return false;
      }

      // If permission requires a specific workcenter, check if user's permission has it
      if (permission.workcenter) {
        return p.workcenter === permission.workcenter || !p.workcenter;
      }

      return true;
    });
  }, [user, permission]);
}

export function useWorkcenterAccess(workcenter: string) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    return user.workcenters.includes(workcenter);
  }, [user, workcenter]);
}

export function useRole() {
  const { user } = useAuth();
  return user?.role || null;
}

export function useWorkcenters() {
  const { user } = useAuth();
  return user?.workcenters || [];
}
