import apiClient from "./apiClient";

async function login(email, password) {
  const response = await apiClient.post("/login", {
    email,
    password,
  });

  return response.data;
}

const authService = {
  login,
};

export default authService;