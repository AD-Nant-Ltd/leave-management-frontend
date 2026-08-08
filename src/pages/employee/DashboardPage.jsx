import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import leaveService from "../../services/leaveService";
import LeaveBalanceSummary from "../../components/leave/LeaveBalanceSummary";

function DashboardPage() {
  const { token } = useAuth();

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
    </div>
  );
}

export default DashboardPage;