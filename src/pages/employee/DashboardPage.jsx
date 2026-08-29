import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import leaveService from "../../services/leaveService";
import LeaveBalanceSummary from "../../components/leave/LeaveBalanceSummary";
import ManagerDashboardSection from "../../components/manager/ManagerDashboardSection";
import AdminDashboardSection from "../../components/admin/AdminDashboardSection";
import { ROLE_IDS } from "../../constants/roles";

function DashboardPage() {
  const { token, user } = useAuth();

  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaveBalance() {
      try {
        const data = await leaveService.getLeaveBalance(token);
        setBalance(data);
      } catch {
        setError("Unable to load leave balance.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaveBalance();
  }, [token]);

  const isManager = user?.role_id === ROLE_IDS.MANAGER;
  const isAdmin = user?.role_id === ROLE_IDS.ADMIN;

  return (
    <div className="app-page">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          View your leave balance and available actions.
        </p>
      </header>

      <div className="page-content">
        {isLoading && <p>Loading leave balance...</p>}

        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        {!isLoading && !error && balance && (
          <LeaveBalanceSummary
            balance={balance}
            showEmployeeActions
          />
        )}

        {isManager && <ManagerDashboardSection />}

        {isAdmin && <AdminDashboardSection />}
      </div>
    </div>
  );
}

export default DashboardPage;