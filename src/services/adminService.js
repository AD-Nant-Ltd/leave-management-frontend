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

const adminService = {
  createUser,
};

export default adminService;