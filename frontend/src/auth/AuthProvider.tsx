import { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext<any | null>(null);

export default function AuthProvider({  children }: { children : any}) {
    const [user, setUser] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  async function refreshAuth() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/habits/auth/me", {
        credentials: "include",
      });
      if (!res.ok) {
        return setUser(null);
      } else {
        const data = await res.json();
        setUser(data.id);
      }
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
    await fetch("http://localhost:3000/api/habits/logout", {
      method: "GET",
      credentials: "include",
    });
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