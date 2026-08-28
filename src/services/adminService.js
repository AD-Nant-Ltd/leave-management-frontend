import apiClient from "./apiClient";

async function createUser(token, userData) {
  const response = await apiClient.post(
    "/admin/users",
    userData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

async function getOutstandingLeaveRequests(
  token,
  staffId = null
) {
  const response = await apiClient.get(
    "/admin/leave-requests/outstanding",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: staffId
        ? {
            staff_id: staffId,
          }
        : {},
    }
  );

  return response.data;
}

async function getSystemUsageReport(token) {
  const response = await apiClient.get(
    "/admin/reports/system-usage",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

const adminService = {
  createUser,
  getOutstandingLeaveRequests,
  getSystemUsageReport,
};

export default adminService;