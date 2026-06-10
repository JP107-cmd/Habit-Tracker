import { Outlet } from "react-router";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      if (!loading && !isLoggedIn) {
          navigate("/");
      }
  }, [loading, isLoggedIn, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!isLoggedIn) return null;

  return <Outlet />;
} 