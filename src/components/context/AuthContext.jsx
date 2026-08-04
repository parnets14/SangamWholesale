// components/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const safeJson = (str) => {
  try {
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    const storedUser = safeJson(localStorage.getItem("user"));
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";

    if (storedToken && storedUser && storedAuth) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("userToken");
    }

    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userToken", authToken);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem("user", JSON.stringify(merged));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
