import apiClient from "./apiClient";

async function getLeaveBalance(token) {
  const response = await apiClient.get("/leave-balance", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

async function createLeaveRequest(token, startDate, endDate) {
  const response = await apiClient.post(
    "/leave-requests",
    {
      start_date: startDate,
      end_date: endDate,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

async function getLeaveRequests(token) {
  const response = await apiClient.get("/leave-requests", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

const leaveService = {
  getLeaveBalance,
  createLeaveRequest,
  getLeaveRequests,
};

export default leaveService;