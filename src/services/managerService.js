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

const managerService = {
  getOutstandingLeaveRequests,
};

export default managerService;