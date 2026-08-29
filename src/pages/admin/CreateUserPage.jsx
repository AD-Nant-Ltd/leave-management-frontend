import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import adminService from "../../services/adminService";
import { ROLE_IDS } from "../../constants/roles";

function CreateUserPage() {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    surname: "",
    email: "",
    password: "",
    role_id: ROLE_IDS.EMPLOYEE,
    annual_leave_balance: 25,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === "role_id" || name === "annual_leave_balance"
          ? Number(value)
          : value,
    }));
  }

  function validateForm() {
    if (
      !formData.first_name.trim() ||
      !formData.surname.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      return "Please complete all required fields.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (formData.annual_leave_balance < 0) {
      return "Annual leave allowance cannot be negative.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminService.createUser(
        token,
        formData
      );

      setSuccess(response.message);

      setFormData({
        first_name: "",
        surname: "",
        email: "",
        password: "",
        role_id: ROLE_IDS.EMPLOYEE,
        annual_leave_balance: 25,
      });
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})
          .flat()
          .join(" ") ||
        "Unable to create user.";

      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-page">
      <header className="page-header page-header-with-action">
        <div>
          <h1 className="page-title">Create User</h1>

          <p className="page-subtitle">
            Add a new employee, manager, or administrator.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="btn btn-outline-secondary"
        >
          Back to Dashboard
        </Link>
      </header>

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="form-panel">
        <p className="text-muted mb-4">
          <span aria-hidden="true">*</span> Required fields
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label
                htmlFor="first_name"
                className="form-label"
              >
                First Name <span aria-hidden="true">*</span>
              </label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label
                htmlFor="surname"
                className="form-label"
              >
                Surname <span aria-hidden="true">*</span>
              </label>

              <input
                id="surname"
                name="surname"
                type="text"
                className="form-control"
                value={formData.surname}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label
                htmlFor="email"
                className="form-label"
              >
                Email Address <span aria-hidden="true">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                autoComplete="email"
              />
            </div>

            <div className="col-12 col-md-6">
              <label
                htmlFor="password"
                className="form-label"
              >
                Password <span aria-hidden="true">*</span>
              </label>

              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                minLength={6}
                autoComplete="new-password"
              />

              <div className="form-text">
                Minimum 6 characters.
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label
                htmlFor="role_id"
                className="form-label"
              >
                Role <span aria-hidden="true">*</span>
              </label>

              <select
                id="role_id"
                name="role_id"
                className="form-select"
                value={formData.role_id}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              >
                <option value={ROLE_IDS.EMPLOYEE}>
                  Employee
                </option>

                <option value={ROLE_IDS.MANAGER}>
                  Manager
                </option>

                <option value={ROLE_IDS.ADMIN}>
                  Admin
                </option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label
                htmlFor="annual_leave_balance"
                className="form-label"
              >
                Annual Leave Allowance{" "}
                <span aria-hidden="true">*</span>
              </label>

              <input
                id="annual_leave_balance"
                name="annual_leave_balance"
                type="number"
                min="0"
                className="form-control"
                value={formData.annual_leave_balance}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating User..."
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserPage;