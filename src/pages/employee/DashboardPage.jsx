import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import leaveService from "../../services/leaveService";
import LeaveBalanceSummary from "../../components/leave/LeaveBalanceSummary";
import ManagerDashboardSection from "../../components/manager/ManagerDashboardSection";
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

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>

      {isLoading && <p>Loading leave balance...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && balance && (
        <LeaveBalanceSummary balance={balance} />
      )}

      {isManager && <ManagerDashboardSection />}
    </div>
  );
}

export default DashboardPage;