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
    <div className="app-shell">
      <header className="app-header">
        <div className="container app-header-inner">
          <span className="app-name">
            Leave Management
          </span>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;