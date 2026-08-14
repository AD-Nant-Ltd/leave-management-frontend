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

async function cancelLeaveRequest(token, leaveRequestId) {
  const response = await apiClient.delete("/leave-requests", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      leave_request_id: leaveRequestId,
    },
  });

  return response.data;
}

const leaveService = {
  getLeaveBalance,
  createLeaveRequest,
  getLeaveRequests,
  cancelLeaveRequest,
};

export default leaveService;