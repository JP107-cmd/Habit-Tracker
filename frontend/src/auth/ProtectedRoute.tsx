import { Outlet } from "react-router";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Loading from "../components/Loading";

export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      if (!loading && !isLoggedIn) {
          navigate("/");
      }
  }, [loading, isLoggedIn, navigate]);

  if (loading) return <Loading></Loading>;
  if (!isLoggedIn) return null;

  return <Outlet />;
} 