import { Link } from "react-router-dom";

function AdminDashboardSection() {
  return (
    <section
      className="mt-5"
      aria-labelledby="admin-section-heading"
    >
      <h2
        id="admin-section-heading"
        className="h4 mb-3"
      >
        Administration
      </h2>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">Create User</h3>

              <p className="text-muted">
                Create a new user and assign their system
                role and annual leave allowance.
              </p>

              <Link
                to="/admin/users/create"
                className="btn btn-primary"
              >
                Create User
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">
                Outstanding Requests
              </h3>

              <p className="text-muted">
                View all outstanding leave requests across
                the organisation.
              </p>

              <Link
                to="/admin/reports/outstanding-requests"
                className="btn btn-primary"
              >
                View Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardSection;