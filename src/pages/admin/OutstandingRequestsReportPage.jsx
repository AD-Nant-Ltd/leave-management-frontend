import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import adminService from "../../services/adminService";
import leaveReviewService from "../../services/leaveReviewService";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import RejectLeaveModal from "../../components/manager/RejectLeaveModal";

function OutstandingRequestsReportPage() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaffId, setSelectedStaffId] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [requestToApprove, setRequestToApprove] =
    useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const [requestToReject, setRequestToReject] =
    useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    async function loadOutstandingRequests() {
      try {
        setError("");

        const response =
          await adminService.getOutstandingLeaveRequests(
            token
          );

        const outstandingRequests = response.data || [];

        setRequests(outstandingRequests);

        const uniqueStaff = Array.from(
          new Map(
            outstandingRequests
              .filter((request) => request.user)
              .map((request) => [
                request.user.id,
                {
                  id: request.user.id,
                  name: `${request.user.first_name} ${request.user.surname}`,
                },
              ])
          ).values()
        ).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setStaffOptions(uniqueStaff);
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

  async function handleStaffFilterChange(event) {
    const staffId = event.target.value;

    setSelectedStaffId(staffId);
    setError("");
    setSuccess("");
    setIsFiltering(true);

    try {
      const response =
        await adminService.getOutstandingLeaveRequests(
          token,
          staffId || null
        );

      setRequests(response.data || []);
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to filter outstanding leave requests.";

      setError(apiMessage);
    } finally {
      setIsFiltering(false);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-GB");
  }

  async function handleApprove() {
    if (!requestToApprove) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setApprovingId(requestToApprove.id);

      const response =
        await leaveReviewService.approveLeaveRequest(
          token,
          requestToApprove.id
        );

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) =>
            request.id !== requestToApprove.id
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

  async function handleReject(reason) {
    if (!requestToReject) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setRejectingId(requestToReject.id);

      const response =
        await leaveReviewService.rejectLeaveRequest(
          token,
          requestToReject.id,
          reason
        );

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) =>
            request.id !== requestToReject.id
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

  function handleCloseApproveModal() {
    if (approvingId !== null) {
      return;
    }

    setRequestToApprove(null);
  }

  function handleCloseRejectModal() {
    if (rejectingId !== null) {
      return;
    }

    setRequestToReject(null);
  }

  return (
    <div className="app-page">
      <header className="page-header page-header-with-action">
        <div>
          <h1 className="page-title">
            Outstanding Requests
          </h1>

          <p className="page-subtitle">
            Review outstanding leave requests across the
            organisation.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
        >
          Back to Dashboard
        </Link>
      </header>

      {!isLoading && staffOptions.length > 0 && (
        <section
          className="form-panel mb-4"
          aria-labelledby="request-filter-heading"
        >
          <h2
            id="request-filter-heading"
            className="section-title mb-3"
          >
            Filter Requests
          </h2>

          <label
            htmlFor="staff-filter"
            className="form-label"
          >
            Staff member
          </label>

          <select
            id="staff-filter"
            className="form-select"
            value={selectedStaffId}
            onChange={handleStaffFilterChange}
            disabled={isFiltering}
          >
            <option value="">All staff</option>

            {staffOptions.map((staffMember) => (
              <option
                key={staffMember.id}
                value={staffMember.id}
              >
                {staffMember.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {isLoading && (
        <p>Loading outstanding requests...</p>
      )}

      {isFiltering && (
        <p role="status">
          Filtering outstanding requests...
        </p>
      )}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="alert alert-success"
          role="status"
        >
          {success}
        </div>
      )}

      {!isLoading &&
        !isFiltering &&
        !error &&
        requests.length === 0 && (
          <div
            className="alert alert-info"
            role="status"
          >
            {selectedStaffId
              ? "There are currently no outstanding leave requests for this staff member."
              : "There are currently no outstanding leave requests."}
          </div>
        )}

      {!isLoading &&
        !isFiltering &&
        requests.length > 0 && (
          <div className="table-panel">
            <div className="table-responsive">
              <table className="table app-table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Employee</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">End Date</th>
                    <th scope="col">Days</th>
                    <th scope="col">Status</th>
                    <th scope="col">Submitted</th>
                    <th scope="col">Actions</th>
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

                      <td>
                        <span className="status-badge status-pending">
                          {request.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(request.created_at)}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              setError("");
                              setSuccess("");
                              setRequestToApprove(request);
                            }}
                            disabled={
                              approvingId !== null ||
                              rejectingId !== null
                            }
                          >
                            {approvingId === request.id
                              ? "Approving..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              setError("");
                              setSuccess("");
                              setRequestToReject(request);
                            }}
                            disabled={
                              approvingId !== null ||
                              rejectingId !== null
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
          </div>
        )}

      <ConfirmationModal
        show={requestToApprove !== null}
        title="Approve Leave Request"
        message="Are you sure you want to approve this leave request?"
        confirmLabel="Approve Leave"
        cancelLabel="Keep Pending"
        confirmVariant="success"
        processingLabel="Approving..."
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

export default OutstandingRequestsReportPage;