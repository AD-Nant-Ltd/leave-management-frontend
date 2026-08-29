import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import leaveService from "../../services/leaveService";

function RequestLeavePage() {
  const { token } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await leaveService.createLeaveRequest(
        token,
        startDate,
        endDate
      );

      setSuccess(response.message);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to submit leave request.";

      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-page">
      <header className="page-header page-header-with-action">
        <div>
          <h1 className="page-title">Request Leave</h1>
          <p className="page-subtitle">
            Submit a new annual leave request.
          </p>
        </div>

        <Link to="/dashboard" className="btn btn-outline-secondary">
          Back to Dashboard
        </Link>
      </header>

      <div className="form-panel">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="start-date" className="form-label">
              Start date
            </label>

            <input
              id="start-date"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="end-date" className="form-label">
              End date
            </label>

            <input
              id="end-date"
              type="date"
              className="form-control"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestLeavePage;