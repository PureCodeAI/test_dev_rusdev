import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Role, Permission } from '@/types/access';
import API_ENDPOINTS from '@/config/api';
import { logger } from '@/utils/logger';

export type AuthUser = {
  id: number;
  fullName: string;
  email?: string;
  userType?: 'entrepreneur' | 'freelancer';
  token?: string;
  roles?: Role[];
  permissions?: Permission[];
};

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  roles: Role[];
  permissions: Permission[];
  isHydrating: boolean;
  isLoadingRoles: boolean;
  isLoadingPermissions: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  loadUserRoles: () => Promise<void>;
  loadUserPermissions: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(false);
  
  // Отслеживаем последнего загруженного пользователя, чтобы избежать повторных запросов
  const loadedUserIdRef = useRef<number | null>(null);

  const STORAGE_KEY = 'auth_user';
  const TOKEN_KEY = 'auth_token';

  const logout = useCallback(() => {
    setUserState(null);
    setRoles([]);
    setPermissions([]);
    loadedUserIdRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const setUser = useCallback(
    (next: AuthUser | null) => {
      setUserState(next);
      try {
        if (next) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              id: next.id,
              fullName: next.fullName,
              email: next.email,
              userType: next.userType,
            }),
          );
          if (next.token) {
            localStorage.setItem(TOKEN_KEY, next.token);
          }
        } else {
          logout();
        }
      } catch (error) {
        logger.error('Error persisting auth user', error instanceof Error ? error : new Error(String(error)));
        logout();
      }
    },
    [logout],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed?.id) {
          setUserState({
            ...parsed,
            token: token || undefined,
          });
        } else {
          logout();
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      logger.error('Error hydrating auth user', error instanceof Error ? error : new Error(String(error)));
      logout();
    } finally {
      setIsHydrating(false);
    }
  }, [logout]);

  const loadUserRoles = useCallback(async () => {
    if (!user?.id || isLoadingRoles) return;
    
    // Предотвращаем повторную загрузку для того же пользователя
    if (loadedUserIdRef.current === user.id && roles.length > 0) {
      return;
    }
    
    setIsLoadingRoles(true);
    try {
      const token = user.token || localStorage.getItem(TOKEN_KEY);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_ENDPOINTS.roles}?user_id=${user.id}`, {
        headers,
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        const payload = Array.isArray(data) ? data : data?.roles ?? [];
        const mappedRoles = payload
          .map((ur: unknown) => {
            const item = ur as Record<string, unknown>;
            return 'role' in item ? item.role : item;
          })
          .filter((r: Role | undefined): r is Role => Boolean(r && typeof r === 'object' && 'name' in r && r.name));
        setRoles(mappedRoles);
        loadedUserIdRef.current = user.id;
      }
    } catch (error) {
      logger.error('Error loading user roles', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingRoles(false);
    }
  }, [user?.id, user?.token, isLoadingRoles, roles.length, logout]);

  const loadUserPermissions = useCallback(async () => {
    if (!user?.id || isLoadingPermissions) return;
    
    // Предотвращаем повторную загрузку для того же пользователя
    if (loadedUserIdRef.current === user.id && permissions.length > 0) {
      return;
    }
    
    setIsLoadingPermissions(true);
    try {
      const token = user.token || localStorage.getItem(TOKEN_KEY);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_ENDPOINTS.permissions}?user_id=${user.id}`, {
        headers,
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        const payload = Array.isArray(data) ? data : data?.permissions ?? [];
        setPermissions(payload);
        loadedUserIdRef.current = user.id;
      }
    } catch (error) {
      logger.error('Error loading user permissions', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [user?.id, user?.token, isLoadingPermissions, permissions.length, logout]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (roles.some((r) => r?.name === 'owner')) return true;
      return permissions.some((p) => p?.name === permission && p.has_permission !== false);
    },
    [user, roles, permissions],
  );

  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user) return false;
      return roles.some((r) => r?.name === roleName);
    },
    [user, roles],
  );

  const isOwner = useCallback((): boolean => hasRole('owner'), [hasRole]);
  const isAdmin = useCallback((): boolean => hasRole('admin') || hasRole('owner'), [hasRole]);

  useEffect(() => {
    if (user?.id && !isHydrating) {
      // Загружаем только если это новый пользователь или данные еще не загружены
      if (loadedUserIdRef.current !== user.id) {
        loadUserRoles();
        loadUserPermissions();
      }
    } else if (!user) {
      setRoles([]);
      setPermissions([]);
      loadedUserIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isHydrating]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      roles,
      permissions,
      isHydrating,
      isLoadingRoles,
      isLoadingPermissions,
      hasPermission,
      hasRole,
      isOwner,
      isAdmin,
      loadUserRoles,
      loadUserPermissions,
      logout,
    }),
    [
      user,
      setUser,
      roles,
      permissions,
      isHydrating,
      isLoadingRoles,
      isLoadingPermissions,
      hasPermission,
      hasRole,
      isOwner,
      isAdmin,
      loadUserRoles,
      loadUserPermissions,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
