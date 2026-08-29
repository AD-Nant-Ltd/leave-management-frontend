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
    <div className="app-page">
      <header className="page-header page-header-with-action">
        <div>
          <h1 className="page-title">
            System Usage Report
          </h1>

          <p className="page-subtitle">
            View current leave request activity across the
            system.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
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
      </header>

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
        <section
          className="content-section"
          aria-labelledby="usage-summary-heading"
        >
          <div className="section-header">
            <h2
              id="usage-summary-heading"
              className="section-title"
            >
              Usage Summary
            </h2>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-4">
              <div className="summary-card h-100">
                <h3 className="summary-card-label">
                  Total Requests
                </h3>

                <p className="summary-card-value">
                  {report.total_requests}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="summary-card h-100">
                <h3 className="summary-card-label">
                  Pending Requests
                </h3>

                <p className="summary-card-value">
                  {report.pending_requests}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="summary-card h-100">
                <h3 className="summary-card-label">
                  Approved Requests
                </h3>

                <p className="summary-card-value">
                  {report.approved_requests}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="summary-card h-100">
                <h3 className="summary-card-label">
                  Rejected Requests
                </h3>

                <p className="summary-card-value">
                  {report.rejected_requests}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="summary-card h-100">
                <h3 className="summary-card-label">
                  Cancelled Requests
                </h3>

                <p className="summary-card-value">
                  {report.cancelled_requests}
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="summary-card h-100">
                <h3 className="summary-card-label">
                  Approved Leave Days Used
                </h3>

                <p className="summary-card-value">
                  {report.approved_days_used}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SystemUsageReportPage;