import apiClient from "./apiClient";

async function login(email, password) {
  const response = await apiClient.post("/login", {
    email,
    password,
  });

  return response.data;
}

async function getCurrentUser(token) {
  const response = await apiClient.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

const authService = {
  login,
  getCurrentUser,
};

export default authService;