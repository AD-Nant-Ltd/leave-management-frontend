import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROLE_IDS } from "../constants/roles";

function ManagerRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (user?.role_id !== ROLE_IDS.MANAGER) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ManagerRoute;