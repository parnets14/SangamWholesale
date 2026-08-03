import { createContext, useContext, useState, useEffect } from "react";
import { useAdmin } from "./AdminContext";

const AdminApiContext = createContext();

export const AdminApiProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAdmin();

  console.log("AdminApiProvider initialized with token:", token);

  // API base URL
  const API_BASE_URL = "https://sangamwholesale.com/api";

  // Helper function to make authenticated API calls
  // If body is FormData, Content-Type is NOT set manually (browser sets it with boundary)
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    const isFormData = options.body instanceof FormData;

    const defaultOptions = {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type for FormData — browser does it automatically with boundary
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      let errMsg = `API request failed: ${response.status}`;
      try {
        const errData = await response.json();
        errMsg = errData?.message || errData?.error || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }

    return response.json();
  };

  // Get Categories API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeAuthenticatedRequest("/categories/");
      console.log("API Response:", data);

      // Extract categories array from the response
      const categoriesArray = data.categories || [];
      setCategories(categoriesArray);
      return categoriesArray;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create Category API
  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);

      // If plain object, convert to FormData so image can be included
      let body;
      if (categoryData instanceof FormData) {
        body = categoryData;
      } else {
        const fd = new FormData();
        Object.entries(categoryData).forEach(([key, val]) => {
          if (val !== null && val !== undefined) fd.append(key, val);
        });
        body = fd;
      }

      const data = await makeAuthenticatedRequest("/categories/", {
        method: "POST",
        body,
      });

      // Refresh categories list
      await fetchCategories();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Category API
  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);

      // If plain object, convert to FormData so image can be included
      let body;
      if (categoryData instanceof FormData) {
        body = categoryData;
      } else {
        const fd = new FormData();
        Object.entries(categoryData).forEach(([key, val]) => {
          if (val !== null && val !== undefined) fd.append(key, val);
        });
        body = fd;
      }

      const data = await makeAuthenticatedRequest(`/categories/${id}`, {
        method: "PUT",
        body,
      });

      // Refresh categories list
      await fetchCategories();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete Category API
  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await makeAuthenticatedRequest(`/categories/${id}`, {
        method: "DELETE",
      });

      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Category by ID
  const getCategoryById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeAuthenticatedRequest(`/categories/${id}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load categories on mount if authenticated
  useEffect(() => {
    if (token) {
      fetchCategories().catch(console.error);
    }
  }, [token]);

  const value = {
    // State
    categories,
    loading,
    error,

    // API functions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    clearError,
  };

  return (
    <AdminApiContext.Provider value={value}>
      {children}
    </AdminApiContext.Provider>
  );
};

export const useAdminApi = () => {
  const context = useContext(AdminApiContext);
  if (!context) {
    throw new Error("useAdminApi must be used within an AdminApiProvider");
  }
  return context;
};
