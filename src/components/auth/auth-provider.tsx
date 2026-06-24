"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { setAccessToken, getAccessToken } from "@/lib/api/client";
import { login as apiLogin, logout as apiLogout, refreshToken } from "@/lib/api/auth";
import type { User } from "@/types/user";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractUserFromToken(token: string): User | null {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;
  const userId = claims.user_id;
  const name = claims.name;
  const email = claims.email;
  if (typeof userId !== "number" || typeof name !== "string" || typeof email !== "string") {
    return null;
  }
  return { user_id: userId, name, email, phone: null };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    const token = response.data.access_token;
    setAccessToken(token);
    const user = extractUserFromToken(token);
    setState({
      user,
      accessToken: token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout errors
    }
    setAccessToken(null);
    setState({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await refreshToken();
      const token = response.data.access_token;
      setAccessToken(token);
      const user = extractUserFromToken(token);
      setState({
        user,
        accessToken: token,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    } catch {
      setAccessToken(null);
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (token) {
        const user = extractUserFromToken(token);
        setState({
          user,
          accessToken: token,
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }
      await refreshSession();
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, refreshSession, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
