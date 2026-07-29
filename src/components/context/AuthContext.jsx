// components/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("storedUser", storedUser);
    const storedToken = localStorage.getItem("userToken");
    console.log("storedToken", storedToken);

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData, authToken) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(authToken);

    // Store in localStorage
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userToken", authToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
