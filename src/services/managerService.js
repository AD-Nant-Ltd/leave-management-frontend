import apiClient from "./apiClient";

async function getOutstandingLeaveRequests(token) {
  const response = await apiClient.get(
    "/manager/leave-requests/outstanding",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
}

async function getStaffLeaveBalance(token, staffId) {
  const response = await apiClient.get(
    `/manager/staff/${staffId}/leave-balance`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
}

async function getManagerStaffForBalanceSelection(token) {
  const requests = await getOutstandingLeaveRequests(token);

  const uniqueStaff = new Map();

  requests.forEach((request) => {
    if (request.user?.id) {
      uniqueStaff.set(request.user.id, {
        id: request.user.id,
        first_name: request.user.first_name,
        surname: request.user.surname,
      });
    }
  });

  return Array.from(uniqueStaff.values());
}

const managerService = {
  getOutstandingLeaveRequests,
  getStaffLeaveBalance,
  getManagerStaffForBalanceSelection,
};

export default managerService;