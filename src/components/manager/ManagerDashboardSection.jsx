import { Link } from "react-router-dom";

function ManagerDashboardSection() {
  return (
    <section
      className="dashboard-section"
      aria-labelledby="manager-section-heading"
    >
      <h2
        id="manager-section-heading"
        className="section-title mb-3"
      >
        Manager
      </h2>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="action-card h-100">
            <h3 className="action-card-title">
              Outstanding Leave Requests
            </h3>

            <p className="action-card-description">
              View and manage pending leave requests from employees
              you manage.
            </p>

            <Link
              to="/manager/requests"
              className="btn btn-primary mt-auto align-self-start"
            >
              View Outstanding Requests
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="action-card h-100">
            <h3 className="action-card-title">
              Staff Leave Balances
            </h3>

            <p className="action-card-description">
              View annual leave balances for employees you manage.
            </p>

            <Link
              to="/manager/staff-balances"
              className="btn btn-primary mt-auto align-self-start"
            >
              View Staff Balances
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManagerDashboardSection;