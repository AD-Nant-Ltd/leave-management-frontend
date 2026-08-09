import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import leaveService from "../../services/leaveService";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function MyLeaveRequestsPage() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaveRequests() {
      try {
        const data = await leaveService.getLeaveRequests(token);
        setRequests(data);
      } catch {
        setError("Unable to load leave requests.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaveRequests();
  }, [token]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Leave Requests</h1>

        <Link to="/dashboard" className="btn btn-outline-secondary">
          Back to Dashboard
        </Link>
      </div>

      {isLoading && <p>Loading leave requests...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="alert alert-info" role="status">
          You have no leave requests.
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{formatDate(request.start_date)}</td>
                  <td>{formatDate(request.end_date)}</td>
                  <td>{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyLeaveRequestsPage;