import { useState } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  async function login(email, password) {
    const data = await authService.login(email, password);

    const accessToken = data.access_token;

    setToken(accessToken);
    localStorage.setItem("leave_management_token", accessToken);

    return data;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("leave_management_token");
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;