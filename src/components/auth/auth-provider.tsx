"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { setAccessToken, clearTokens } from "@/lib/api/client";
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefresh } from "@/lib/api/auth";
import { usePathname } from "next/navigation";
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
  const loginType = claims.login_type;
  if (typeof userId !== "number" || typeof name !== "string" || typeof email !== "string" || typeof loginType !== "string") {
    return null;
  }
  return { user_id: userId, name, email, phone: null, login_type: loginType };
}

interface AuthState {
  normalUser: User | null;
  adminUser: User | null;
  normalAccessToken: string | null;
  adminAccessToken: string | null;
  activeLoginType: "normal" | "admin" | null;
  isLoading: boolean;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  normalUser: User | null;
  adminUser: User | null;
  activeLoginType: string | null;

  login: (email: string, password: string, loginType?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: (loginType?: string) => Promise<boolean>;
  updateUser: (user: User) => void;
  activateSession: (loginType: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [state, setState] = useState<AuthState>({
    normalUser: null,
    adminUser: null,
    normalAccessToken: null,
    adminAccessToken: null,
    activeLoginType: null,
    isLoading: true,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setSession = useCallback((loginType: string, token: string | null, user: User | null) => {
    setAccessToken(loginType, token);
    setState((prev) => {
      const next = { ...prev };
      if (loginType === "admin") {
        next.adminUser = user;
        next.adminAccessToken = token;
      } else {
        next.normalUser = user;
        next.normalAccessToken = token;
      }
      return next;
    });
  }, []);

  const setActive = useCallback((loginType: string) => {
    setState((prev) => {
      if (loginType === "admin" && prev.adminUser) {
        return { ...prev, activeLoginType: "admin" };
      }
      if (loginType === "normal" && prev.normalUser) {
        return { ...prev, activeLoginType: "normal" };
      }
      return prev;
    });
  }, []);

  const login = useCallback(async (email: string, password: string, loginType: string = "normal") => {
    const response = await apiLogin(email, password, loginType);
    const token = response.data.access_token;
    const user = extractUserFromToken(token);
    setSession(loginType, token, user);
    setState((prev) => ({ ...prev, activeLoginType: loginType as "admin" | "normal", isLoading: false }));
  }, [setSession]);

  const logout = useCallback(async () => {
    const current = stateRef.current;
    const loginType = isAdminRoute
      ? (current.adminUser ? "admin" : undefined)
      : (current.normalUser ? "normal" : undefined);
    try {
      await apiLogout(loginType);
    } catch {
      // Ignore logout errors
    }
    if (!loginType) {
      clearTokens();
      setState({
        normalUser: null,
        adminUser: null,
        normalAccessToken: null,
        adminAccessToken: null,
        activeLoginType: null,
        isLoading: false,
      });
      return;
    }
    setAccessToken(loginType, null);
    setState((prev) => {
      const updated = { ...prev };
      if (loginType === "admin") {
        updated.adminUser = null;
        updated.adminAccessToken = null;
      } else {
        updated.normalUser = null;
        updated.normalAccessToken = null;
      }
      return updated;
    });
  }, [isAdminRoute]);

  const refreshSession = useCallback(async (loginType?: string): Promise<boolean> => {
    const types = loginType ? [loginType] : ["admin", "normal"];
    let anySuccess = false;

    for (const t of types) {
      try {
        const response = await apiRefresh(t);
        const token = response.data.access_token;
        const user = extractUserFromToken(token);
        setAccessToken(t, token);
        setState((prev) => {
          const next = { ...prev };
          if (t === "admin") {
            next.adminUser = user;
            next.adminAccessToken = token;
          } else {
            next.normalUser = user;
            next.normalAccessToken = token;
          }
          return next;
        });
        anySuccess = true;
      } catch {
        setAccessToken(t, null);
        setState((prev) => {
          const next = { ...prev };
          if (t === "admin") {
            next.adminUser = null;
            next.adminAccessToken = null;
          } else {
            next.normalUser = null;
            next.normalAccessToken = null;
          }
          return next;
        });
      }
    }

    // Finalize: pick active session if none set — prefer normal
    setState((prev) => {
      const next = { ...prev, isLoading: false };
      if (prev.activeLoginType) return next;
      if (types.includes("normal") && prev.normalUser) {
        next.activeLoginType = "normal";
      }
      return next;
    });

    return anySuccess;
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => {
      if (isAdminRoute) {
        return { ...prev, adminUser: user };
      }
      return { ...prev, normalUser: user };
    });
  }, [isAdminRoute]);

  const initDone = useRef(false);
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    refreshSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The active session follows the current portal: an admin session is not
  // valid on normal routes (and vice versa). If the current portal has no
  // session, the user is treated as logged out.
  const activeLoginType = isAdminRoute
    ? (state.adminUser ? "admin" : null)
    : (state.normalUser ? "normal" : null);
  const activeUser = activeLoginType === "admin" ? state.adminUser : state.normalUser;
  const activeAccessToken = activeLoginType === "admin" ? state.adminAccessToken : state.normalAccessToken;

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        accessToken: activeAccessToken,
        isLoading: state.isLoading,
        isAuthenticated: activeUser !== null,
        normalUser: state.normalUser,
        adminUser: state.adminUser,
        activeLoginType,
        login,
        logout,
        refreshSession,
        updateUser,
        activateSession: setActive,
      }}
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