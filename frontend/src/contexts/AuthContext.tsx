import axios from 'axios';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { setUnauthorizedHandler } from '@/lib/axios';
import {
  loginRequest,
  registerRequest,
} from '@/modules/auth/auth.service';
import type {
  LoginFormValues,
  RegisterFormValues,
} from '@/modules/auth/schemas';
import {
  AUTH_STORAGE_KEYS,
  type AuthUser,
  type UserRoleName,
} from '@/modules/auth/types';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginFormValues) => Promise<AuthUser>;
  register: (payload: RegisterFormValues) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredSession = (): { user: AuthUser | null; token: string | null } => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const userRaw = localStorage.getItem(AUTH_STORAGE_KEYS.user);

    if (!token || !userRaw) {
      return { user: null, token: null };
    }

    return {
      token,
      user: JSON.parse(userRaw) as AuthUser,
    };
  } catch {
    return { user: null, token: null };
  }
};

const persistSession = (token: string, user: AuthUser): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
};

const clearSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);

    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const session = readStoredSession();
    setUser(session.user);
    setToken(session.token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (payload: LoginFormValues): Promise<AuthUser> => {
    const { user: authenticatedUser, token: authToken } =
      await loginRequest(payload);

    persistSession(authToken, authenticatedUser);
    setUser(authenticatedUser);
    setToken(authToken);

    return authenticatedUser;
  }, []);

  const register = useCallback(async (payload: RegisterFormValues): Promise<void> => {
    await registerRequest(payload);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
};

export const getUserRole = (user: AuthUser | null): UserRoleName | null =>
  user?.role.nombre ?? null;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string; errors?: { field?: string; message?: string }[] }
      | undefined;

    if (payload?.errors?.[0]?.message) {
      return payload.errors[0].message;
    }

    return payload?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
