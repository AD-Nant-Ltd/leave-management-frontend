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

const leaveService = {
  getLeaveBalance,
  createLeaveRequest,
};

export default leaveService;