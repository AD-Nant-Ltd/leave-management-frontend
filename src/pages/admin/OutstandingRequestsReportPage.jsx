import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import adminService from "../../services/adminService";

function OutstandingRequestsReportPage() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOutstandingRequests() {
      try {
        setError("");

        const response =
          await adminService.getOutstandingLeaveRequests(
            token
          );

        setRequests(response.data);
      } catch (error) {
        const apiMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to load outstanding requests report.";

        setError(apiMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadOutstandingRequests();
  }, [token]);

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-GB");
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          Outstanding Requests Report
        </h1>

        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
        >
          Back to Dashboard
        </Link>
      </div>

      {isLoading && (
        <p>Loading outstanding requests...</p>
      )}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {!isLoading &&
        !error &&
        requests.length === 0 && (
          <div
            className="alert alert-info"
            role="status"
          >
            There are currently no outstanding leave
            requests.
          </div>
        )}

      {!isLoading &&
        !error &&
        requests.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Days</th>
                  <th scope="col">Status</th>
                  <th scope="col">Submitted</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      {request.user?.first_name}{" "}
                      {request.user?.surname}
                    </td>

                    <td>
                      {formatDate(request.start_date)}
                    </td>

                    <td>
                      {formatDate(request.end_date)}
                    </td>

                    <td>{request.days_requested}</td>

                    <td>{request.status}</td>

                    <td>
                      {formatDate(request.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

export default OutstandingRequestsReportPage;