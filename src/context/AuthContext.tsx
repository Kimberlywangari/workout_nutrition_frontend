import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { saveToken, getToken, clearToken } from "../api/token";
import { fetchMyProfile } from "../api/profile";
import type { Role } from "../types/user";

interface AuthContextValue {
  token: string | null;
  isLoggedIn: boolean;
  role: Role | null;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!token) {
      setRole(null);
      return;
    }
    fetchMyProfile(token)
      .then((p) => setRole(p.role))
      .catch(() => setRole(null));
  }, [token]);

  function setToken(newToken: string) {
    saveToken(newToken);
    setTokenState(newToken);
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setRole(null);
  }

  const value: AuthContextValue = { token, isLoggedIn: token !== null, role, setToken, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
