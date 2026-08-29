import { Link } from "react-router-dom";

function AdminDashboardSection() {
  return (
    <section
      className="dashboard-section"
      aria-labelledby="admin-section-heading"
    >
      <h2
        id="admin-section-heading"
        className="section-title mb-3"
      >
        Administration
      </h2>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="action-card h-100">
            <h3 className="action-card-title">
              Create User
            </h3>

            <p className="action-card-description">
              Create a new user and assign their system
              role and annual leave allowance.
            </p>

            <Link
              to="/admin/users/create"
              className="btn btn-primary mt-auto align-self-start"
            >
              Create User
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-4">
          <div className="action-card h-100">
            <h3 className="action-card-title">
              Outstanding Requests
            </h3>

            <p className="action-card-description">
              View all outstanding leave requests across
              the organisation.
            </p>

            <Link
              to="/admin/reports/outstanding-requests"
              className="btn btn-primary mt-auto align-self-start"
            >
              View Report
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-4">
          <div className="action-card h-100">
            <h3 className="action-card-title">
              System Usage
            </h3>

            <p className="action-card-description">
              View leave request totals and system usage
              statistics.
            </p>

            <Link
              to="/admin/reports/system-usage"
              className="btn btn-primary mt-auto align-self-start"
            >
              View System Usage
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardSection;