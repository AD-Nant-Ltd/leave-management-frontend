function LeaveBalanceSummary({ balance }) {
  return (
    <section aria-labelledby="leave-balance-heading">
      <h2 id="leave-balance-heading" className="h4 mb-3">
        Leave Balance
      </h2>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h6">Annual Allowance</h3>
              <p className="fs-3 mb-0">
                {balance.annual_allowance}
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h6">Leave Taken</h3>
              <p className="fs-3 mb-0">
                {balance.days_used}
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h6">Remaining Leave</h3>
              <p className="fs-3 mb-0">
                {balance.days_remaining}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LeaveBalanceSummary;