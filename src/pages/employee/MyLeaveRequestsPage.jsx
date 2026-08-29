import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import leaveService from "../../services/leaveService";
import ConfirmationModal from "../../components/common/ConfirmationModal";

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
  const [cancellingId, setCancellingId] = useState(null);
  const [requestToCancel, setRequestToCancel] = useState(null);

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

  async function handleCancel() {
    if (!requestToCancel) {
      return;
    }

    setError("");
    setCancellingId(requestToCancel.id);

    try {
      await leaveService.cancelLeaveRequest(
        token,
        requestToCancel.id
      );

      setRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === requestToCancel.id
            ? {
                ...currentRequest,
                status: "Cancelled",
              }
            : currentRequest
        )
      );

      setRequestToCancel(null);
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to cancel leave request.";

      setError(apiMessage);
    } finally {
      setCancellingId(null);
    }
  }

  function handleCloseModal() {
    if (cancellingId !== null) {
      return;
    }

    setRequestToCancel(null);
  }

  function displayReason(request) {
    if (request.status === "Rejected" && request.reason) {
      return request.reason;
    }

    return "—";
  }

  function statusClass(status) {
    return `status-badge status-${status.toLowerCase()}`;
  }

  return (
    <div className="app-page">
      <header className="page-header page-header-with-action">
        <div>
          <h1 className="page-title">My Leave Requests</h1>

          <p className="page-subtitle">
            View the status of your submitted leave requests.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
        >
          Back to Dashboard
        </Link>
      </header>

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
        <div className="table-panel">
          <div className="table-responsive">
            <table className="table app-table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{formatDate(request.start_date)}</td>
                    <td>{formatDate(request.end_date)}</td>

                    <td>
                      <span className={statusClass(request.status)}>
                        {request.status}
                      </span>
                    </td>

                    <td>{displayReason(request)}</td>

                    <td>
                      {request.status === "Pending" && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() =>
                            setRequestToCancel(request)
                          }
                          disabled={
                            cancellingId === request.id
                          }
                        >
                          {cancellingId === request.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        show={requestToCancel !== null}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this leave request?"
        confirmLabel="Cancel Leave"
        cancelLabel="Keep Request"
        confirmVariant="danger"
        processingLabel="Cancelling..."
        onConfirm={handleCancel}
        onCancel={handleCloseModal}
        isProcessing={
          requestToCancel !== null &&
          cancellingId === requestToCancel.id
        }
      />
    </div>
  );
}

export default MyLeaveRequestsPage;