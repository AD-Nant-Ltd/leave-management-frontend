import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import managerService from "../../services/managerService";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import RejectLeaveModal from "../../components/manager/RejectLeaveModal";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function OutstandingLeaveRequestsPage() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [requestToApprove, setRequestToApprove] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    async function loadOutstandingRequests() {
      try {
        const data =
          await managerService.getOutstandingLeaveRequests(token);

        setRequests(data);
      } catch (error) {
        const apiMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to load outstanding leave requests.";

        setError(apiMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadOutstandingRequests();
  }, [token]);

  async function handleApprove() {
    if (!requestToApprove) {
      return;
    }

    setError("");
    setSuccess("");
    setApprovingId(requestToApprove.id);

    try {
      const response = await managerService.approveLeaveRequest(
        token,
        requestToApprove.id
      );

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request.id !== requestToApprove.id
        )
      );

      setSuccess(response.message);
      setRequestToApprove(null);
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to approve leave request.";

      setError(apiMessage);
    } finally {
      setApprovingId(null);
    }
  }

  function handleCloseApproveModal() {
    if (approvingId !== null) {
      return;
    }

    setRequestToApprove(null);
  }

  async function handleReject(reason) {
    if (!requestToReject) {
      return;
    }

    setError("");
    setSuccess("");
    setRejectingId(requestToReject.id);

    try {
      const response = await managerService.rejectLeaveRequest(
        token,
        requestToReject.id,
        reason
      );

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request.id !== requestToReject.id
        )
      );

      setSuccess(response.message);
      setRequestToReject(null);
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to reject leave request.";

      setError(apiMessage);
    } finally {
      setRejectingId(null);
    }
  }

  function handleCloseRejectModal() {
    if (rejectingId !== null) {
      return;
    }

    setRequestToReject(null);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Outstanding Leave Requests</h1>

        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
        >
          Back to Dashboard
        </Link>
      </div>

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {isLoading && (
        <p>Loading outstanding leave requests...</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading &&
        !error &&
        requests.length === 0 && (
          <div className="alert alert-info" role="status">
            There are no outstanding leave requests.
          </div>
        )}

      {!isLoading && requests.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    {request.user.first_name}{" "}
                    {request.user.surname}
                  </td>

                  <td>{formatDate(request.start_date)}</td>

                  <td>{formatDate(request.end_date)}</td>

                  <td>{request.status}</td>

                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          setRequestToApprove(request)
                        }
                        disabled={
                          approvingId === request.id ||
                          rejectingId === request.id
                        }
                      >
                        {approvingId === request.id
                          ? "Approving..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setRequestToReject(request)
                        }
                        disabled={
                          approvingId === request.id ||
                          rejectingId === request.id
                        }
                      >
                        {rejectingId === request.id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        show={requestToApprove !== null}
        title="Approve Leave Request"
        message="Are you sure you want to approve this leave request?"
        confirmLabel="Approve Leave"
        cancelLabel="Keep Pending"
        onConfirm={handleApprove}
        onCancel={handleCloseApproveModal}
        isProcessing={
          requestToApprove !== null &&
          approvingId === requestToApprove.id
        }
      />

      <RejectLeaveModal
        show={requestToReject !== null}
        request={requestToReject}
        onConfirm={handleReject}
        onCancel={handleCloseRejectModal}
        isProcessing={
          requestToReject !== null &&
          rejectingId === requestToReject.id
        }
      />
    </div>
  );
}

export default OutstandingLeaveRequestsPage;