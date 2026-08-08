import apiClient from "./apiClient";

async function getLeaveBalance(token) {
  const response = await apiClient.get("/leave-balance", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

const leaveService = {
  getLeaveBalance,
};

export default leaveService;