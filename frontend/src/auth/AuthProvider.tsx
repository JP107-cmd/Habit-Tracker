import { useState, useEffect, useContext, createContext, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { api } from "../components/api";

type AuthContextValue = {
    user: number | null;
    isLoggedIn: boolean;
    loading: boolean;
    refreshAuth: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  async function refreshAuth() {
    setLoading(true);
    try {
      const data = await api.get<{ id: number }>("/auth/me");
      setUser(data.id);
    } catch {
        setUser(null);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    refreshAuth(); // run once on app load
  }, []);

  async function logout() {
    try {
      await api.get("/logout");
    } catch {
      // ignore — log out locally regardless
    }
    setUser(null);
    refreshAuth()
    navigate("/");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !! user,
        loading,
        refreshAuth,
        logout,
      }}
    >
      { children }
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
