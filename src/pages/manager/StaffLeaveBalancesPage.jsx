import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import managerService from "../../services/managerService";

function StaffLeaveBalancesPage() {
  const { token } = useAuth();

  const [staffBalances, setStaffBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStaffBalances() {
      try {
        setError("");

        const staff =
          await managerService.getManagerStaffForBalanceSelection(
            token
          );

        if (staff.length === 0) {
          setStaffBalances([]);
          return;
        }

        const balances = await Promise.all(
          staff.map(async (employee) => {
            const balance =
              await managerService.getStaffLeaveBalance(
                token,
                employee.id
              );

            return {
              id: employee.id,
              first_name: employee.first_name,
              surname: employee.surname,
              annual_allowance: balance.annual_allowance,
              days_used: balance.days_used,
              days_remaining: balance.days_remaining,
            };
          })
        );

        setStaffBalances(balances);
      } catch (error) {
        const apiMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to load staff leave balances.";

        setError(apiMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadStaffBalances();
  }, [token]);

  function exportToCsv() {
    if (staffBalances.length === 0) {
      return;
    }

    const headers = [
      "Employee",
      "Annual Allowance",
      "Leave Taken",
      "Remaining Leave",
    ];

    const rows = staffBalances.map((employee) => [
      `${employee.first_name} ${employee.surname}`,
      employee.annual_allowance,
      employee.days_used,
      employee.days_remaining,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");

            return `"${stringValue.replaceAll('"', '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      "staff-leave-balances.csv"
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-page">
      <header className="page-header page-header-with-action">
        <div>
          <h1 className="page-title">
            Staff Leave Balances
          </h1>

          <p className="page-subtitle">
            View annual leave balances for employees you manage.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {staffBalances.length > 0 && (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={exportToCsv}
            >
              Export CSV
            </button>
          )}

          <Link
            to="/dashboard"
            className="btn btn-outline-secondary"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {isLoading && <p>Loading staff leave balances...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading &&
        !error &&
        staffBalances.length === 0 && (
          <div
            className="alert alert-info"
            role="status"
          >
            There are currently no staff balances available
            to view.
          </div>
        )}

      {!isLoading &&
        !error &&
        staffBalances.length > 0 && (
          <div className="table-panel">
            <div className="table-responsive">
              <table className="table app-table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Employee</th>
                    <th scope="col">Annual Allowance</th>
                    <th scope="col">Leave Taken</th>
                    <th scope="col">Remaining Leave</th>
                  </tr>
                </thead>

                <tbody>
                  {staffBalances.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        {employee.first_name}{" "}
                        {employee.surname}
                      </td>

                      <td>
                        {employee.annual_allowance}
                      </td>

                      <td>{employee.days_used}</td>

                      <td>{employee.days_remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}

export default StaffLeaveBalancesPage;