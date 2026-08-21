import { Link } from "react-router-dom";

function ManagerDashboardSection() {
  return (
    <section className="mt-5" aria-labelledby="manager-section-heading">
      <h2 id="manager-section-heading" className="h4 mb-3">
        Manager
      </h2>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">Outstanding Leave Requests</h3>

              <p className="text-muted">
                View and manage pending leave requests from employees
                you manage.
              </p>

              <Link
                to="/manager/requests"
                className="btn btn-primary"
              >
                View Outstanding Requests
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">Staff Leave Balances</h3>

              <p className="text-muted">
                View annual leave balances for employees you manage.
              </p>

              <Link
                to="/manager/staff-balances"
                className="btn btn-primary"
              >
                View Staff Balances
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManagerDashboardSection;