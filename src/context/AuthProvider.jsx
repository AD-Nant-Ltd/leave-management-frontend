import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("leave_management_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser(token);
        setUser(currentUser);
      } catch {
        localStorage.removeItem("leave_management_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [token]);

  async function login(email, password) {
    const data = await authService.login(email, password);
    const accessToken = data.access_token;

    localStorage.setItem("leave_management_token", accessToken);
    setToken(accessToken);

    const currentUser = await authService.getCurrentUser(accessToken);
    setUser(currentUser);

    return currentUser;
  }

  function logout() {
    localStorage.removeItem("leave_management_token");
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: Boolean(token && user),
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;