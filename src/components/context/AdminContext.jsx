import { createContext, useContext, useEffect, useState } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminData");

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
      setIsAdminAuthenticated(true);
    }
    setIsAuthChecked(true);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminEmail: email,
            adminPassword: password,
          }),
        }
      );

      const data = await response.json();
      console.log("data", data);
      if (response.ok && data.message === "Login successful") {
        // Store token and admin data
        setToken(data.token);
        setAdmin(data.admin);
        setIsAdminAuthenticated(true);

        // Save to localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setToken(null);
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        isAuthChecked,
        login,
        logout,
        token,
        admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
