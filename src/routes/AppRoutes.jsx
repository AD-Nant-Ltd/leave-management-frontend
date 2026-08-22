import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import ManagerRoute from "./ManagerRoute";
import AdminRoute from "./AdminRoute";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/employee/DashboardPage";
import RequestLeavePage from "../pages/employee/RequestLeavePage";
import MyLeaveRequestsPage from "../pages/employee/MyLeaveRequestsPage";

import OutstandingLeaveRequestsPage from "../pages/manager/OutstandingLeaveRequestsPage";
import StaffLeaveBalancesPage from "../pages/manager/StaffLeaveBalancesPage";

import CreateUserPage from "../pages/admin/CreateUserPage";
import OutstandingRequestsReportPage from "../pages/admin/OutstandingRequestsReportPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/leave/request"
            element={<RequestLeavePage />}
          />

          <Route
            path="/leave/requests"
            element={<MyLeaveRequestsPage />}
          />

          <Route element={<ManagerRoute />}>
            <Route
              path="/manager/requests"
              element={<OutstandingLeaveRequestsPage />}
            />

            <Route
              path="/manager/staff-balances"
              element={<StaffLeaveBalancesPage />}
            />
          </Route>

          <Route element={<AdminRoute />}>
            <Route
              path="/admin/users/create"
              element={<CreateUserPage />}
            />

            <Route
              path="/admin/reports/outstanding-requests"
              element={<OutstandingRequestsReportPage />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;