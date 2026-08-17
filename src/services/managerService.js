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

async function approveLeaveRequest(token, leaveRequestId) {
  const response = await apiClient.patch(
    "/leave-requests/approve",
    {
      leave_request_id: leaveRequestId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

async function rejectLeaveRequest(token, leaveRequestId, reason = "") {
  const response = await apiClient.patch(
    "/leave-requests/reject",
    {
      leave_request_id: leaveRequestId,
      reason: reason || null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

const managerService = {
  getOutstandingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};

export default managerService;