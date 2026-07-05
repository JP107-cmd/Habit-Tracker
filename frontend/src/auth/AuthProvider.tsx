import { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router";
import { api } from "../components/api";

const AuthContext = createContext<any | null>(null);

export default function AuthProvider({  children }: { children : any}) {
    const [user, setUser] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  async function refreshAuth() {
    setLoading(true);
    try {
      const data = await api.get<any>("/auth/me");
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
    return navigate("/");
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

export function useAuth() {
    return useContext(AuthContext);
}