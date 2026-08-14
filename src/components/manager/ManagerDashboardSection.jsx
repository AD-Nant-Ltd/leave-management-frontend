import { Link } from "react-router-dom";

function ManagerDashboardSection() {
  return (
    <section className="mt-5" aria-labelledby="manager-section-heading">
      <h2 id="manager-section-heading" className="h4 mb-3">
        Manager
      </h2>

      <div className="card">
        <div className="card-body">
          <h3 className="h5">Outstanding Leave Requests</h3>

          <p className="text-muted">
            View pending leave requests from employees you manage.
          </p>

          <Link
            to="/manager/requests"
            className="btn btn-primary"
          >
            View Outstanding Requests
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ManagerDashboardSection;