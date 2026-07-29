import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const UserApiContext = createContext();

export const UserApiProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // API base URL
  const API_BASE_URL = "https://sangamwholesale.com/api";

  // Helper function to make API calls (with or without auth)
  const makeRequest = async (endpoint, options = {}) => {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  };

  // Get Categories API (public endpoint)
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest("/categories/");
      console.log("Categories API Response:", data);

      // Transform the data to match the expected format
      const transformedCategories = (data.categories || []).map(
        (category, index) => ({
          id: category._id,
          title: category.name,
          description: category.description,
          icon: category.image
            ? `https://sangamwholesale.com/categories/${category.image}`
            : null,
          color:
            index % 2 === 0
              ? "bg-gradient-to-br from-amber-100 to-amber-50"
              : "bg-gradient-to-br from-purple-100 to-purple-50",
          border: index % 2 === 0 ? "border-amber-200" : "border-purple-200",
          text: index % 2 === 0 ? "text-amber-700" : "text-purple-700",
          button:
            index % 2 === 0
              ? "bg-amber-100 hover:bg-amber-200"
              : "bg-purple-100 hover:bg-purple-200",
        })
      );

      setCategories(transformedCategories);
      return transformedCategories;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Subcategories API (public endpoint)
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest("/subcategories/");
      console.log("Subcategories API Response:", data);

      // Transform the data to match the expected format
      const transformedSubcategories = (data.subcategories || []).map(
        (subcategory) => ({
          id: subcategory._id,
          name: subcategory.name,
          description: subcategory.description,
          image: subcategory.image
            ? `https://sangamwholesale.com/subcategories/${subcategory.image}`
            : null,
          categoryId: subcategory.category._id,
          categoryName: subcategory.category.name,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        })
      );

      setSubcategories(transformedSubcategories);
      return transformedSubcategories;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Products API (public endpoint)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest("/products/");
      console.log("Products API Response:", data);

      // Transform the data to match the expected format
      const transformedProducts = (data.products || []).map((product) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        unit: product.unit,
        quantity: product.quantity,
        brand: product.brand || null,
        image: product.image
          ? `/products/${product.image}`
          : null,
        subcategoryId: product.subcategory._id,
        subcategoryName: product.subcategory.name,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Calculate discount percentage
        discountPercentage: product.discountPrice
          //product.discountPrice && product.price
            // ? Math.round(
            //     ((product.price - product.discountPrice) / product.price) * 100
            //   )
            // : 0,
      }));
      setProducts(transformedProducts);
      return transformedProducts;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Products by Subcategory ID
  const getProductsBySubcategory = async (subcategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest(`/products/subcategory/${subcategoryId}`);
      console.log("Products by Subcategory API Response:", data);

      // Transform the data to match the expected format
      const transformedProducts = (data.products || []).map((product) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        unit: product.unit,
        quantity: product.quantity,
        brand: product.brand || null,
        image: product.image
          ? `/products/${product.image}`
          : null,
        subcategoryId: product.subcategory._id,
        subcategoryName: product.subcategory.name,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Calculate discount percentage
        discountPercentage:
          product.discountPrice && product.price
            ? Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )
            : 0,
      }));

      return transformedProducts;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Product by ID
  const getProductById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest(`/products/${id}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Subcategories by Category ID
  const getSubcategoriesByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest(`/subcategories/category/${categoryId}`);
      console.log("Subcategories by Category API Response:", data);

      // Transform the data to match the expected format
      const transformedSubcategories = (data.subcategories || []).map(
        (subcategory) => ({
          id: subcategory._id,
          name: subcategory.name,
          description: subcategory.description,
          image: subcategory.image
            ? `https://sangamwholesale.com/subcategories/${subcategory.image}`
            : null,
          categoryId: subcategory.category._id,
          categoryName: subcategory.category.name,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        })
      );

      return transformedSubcategories;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Subcategory by ID
  const getSubcategoryById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const data = await makeRequest(`/subcategories/${id}`);
      return data;
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

      const data = await makeRequest(`/categories/${id}`);
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

  // Load categories, subcategories, and products on mount
  useEffect(() => {
    fetchCategories().catch(console.error);
    fetchSubcategories().catch(console.error);
    fetchProducts().catch(console.error);
  }, []);

  const value = {
    // State
    categories,
    subcategories,
    products,
    loading,
    error,

    // API functions
    fetchCategories,
    fetchSubcategories,
    fetchProducts,
    getProductsBySubcategory,
    getProductById,
    getSubcategoriesByCategory,
    getSubcategoryById,
    getCategoryById,
    clearError,
  };

  return (
    <UserApiContext.Provider value={value}>{children}</UserApiContext.Provider>
  );
};

export const useUserApi = () => {
  const context = useContext(UserApiContext);
  if (!context) {
    throw new Error("useUserApi must be used within a UserApiProvider");
  }
  return context;
};
