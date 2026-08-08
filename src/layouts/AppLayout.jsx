import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div>
      <header className="border-bottom p-3">
        <div className="container d-flex justify-content-between align-items-center">
          <span>Leave Management</span>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;