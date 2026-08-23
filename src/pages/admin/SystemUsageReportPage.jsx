import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import adminService from "../../services/adminService";

function SystemUsageReportPage() {
  const { token } = useAuth();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchReport() {
      try {
        const response =
          await adminService.getSystemUsageReport(token);

        if (isMounted) {
          setReport(response.data);
        }
      } catch (error) {
        if (isMounted) {
          const apiMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Unable to load system usage report.";

          setError(apiMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleRefresh() {
    setIsRefreshing(true);
    setError("");

    try {
      const response =
        await adminService.getSystemUsageReport(token);

      setReport(response.data);
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to load system usage report.";

      setError(apiMessage);
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">System Usage Report</h1>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/dashboard"
            className="btn btn-outline-secondary"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {isLoading && (
        <p>Loading system usage report...</p>
      )}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {!isLoading && report && (
        <div className="row g-3">
          <div className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">
                  Total Requests
                </h2>
                <p className="fs-3 mb-0">
                  {report.total_requests}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">
                  Pending Requests
                </h2>
                <p className="fs-3 mb-0">
                  {report.pending_requests}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">
                  Approved Requests
                </h2>
                <p className="fs-3 mb-0">
                  {report.approved_requests}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">
                  Rejected Requests
                </h2>
                <p className="fs-3 mb-0">
                  {report.rejected_requests}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">
                  Cancelled Requests
                </h2>
                <p className="fs-3 mb-0">
                  {report.cancelled_requests}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6">
                  Approved Leave Days Used
                </h2>
                <p className="fs-3 mb-0">
                  {report.approved_days_used}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemUsageReportPage;