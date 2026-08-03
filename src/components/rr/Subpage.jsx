import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Loader,
  Image as ImageIcon,
  Search,
  ArrowLeft,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useUserApi } from "../context/UserApiContext";
import CartIcon from "./CartIcon";

const Subpage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    categories,
    subcategories,
    products,
    loading,
    error,
    fetchCategories,
    fetchSubcategories,
    fetchProducts,
  } = useUserApi();

  console.log(fetchProducts, "fetchProducts");

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(loginStatus === "true");
    };

    checkLoginStatus();

    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () =>
      window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Filter subcategories based on selected category
  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.categoryId === selectedCategory)
    : [];

  // Filter subcategories based on search query
  const searchedSubcategories = filteredSubcategories.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter products based on selected subcategory
  const filteredProducts = selectedSubcategory
    ? products.filter(
        (product) => product.subcategoryId === selectedSubcategory
      )
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 10, stiffness: 120 },
    },
    hover: {
      scale: 1.03,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const productCardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery(""); // Clear search when category changes
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, {
      state: { product },
    });
  };

  const addToCart = (product) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#702834] mb-2">
            Error Loading Categories
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchCategories();
              fetchSubcategories();
              fetchProducts();
            }}
            className="px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#702834' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Browse Products
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a category and subcategory to view products
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Categories
              </h2>
              <div className="space-y-3">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    variants={cardVariants}
                    whileHover="hover"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
                      selectedCategory === category.id
                        ? "bg-blue-50 border-2 border-blue-200 shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {category.icon ? (
                          <img
                            src={category.icon}
                            alt={category.title}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold truncate ${
                            selectedCategory === category.id
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 break-words">
                          {category.description}
                        </p>
                      </div>
                      {selectedCategory === category.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle - Subcategories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Subcategories
              </h2>
              {selectedCategory ? (
                <>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {searchedSubcategories.map((subcategory) => (
                      <motion.div
                        key={subcategory.id}
                        variants={cardVariants}
                        whileHover="hover"
                        onClick={() => handleSubcategorySelect(subcategory.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedSubcategory === subcategory.id
                            ? "bg-green-50 border-2 border-green-200 shadow-md"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {subcategory.image ? (
                              <img
                                src={subcategory.image}
                                alt={subcategory.name}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`text-sm font-semibold ${
                                selectedSubcategory === subcategory.id
                                  ? "text-green-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {subcategory.name}
                            </h3>
                          </div>
                          {selectedSubcategory === subcategory.id && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Select a category to view subcategories
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {selectedSubcategory ? (
                <>
                  {/* Selected Subcategory Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {
                          subcategories.find(
                            (s) => s.id === selectedSubcategory
                          )?.name
                        }
                      </h2>
                      <p className="text-gray-600">
                        {filteredProducts.length} products available
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate("/cart")}
                        className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Cart"
                      >
                        <CartIcon
                          itemCount={cartItems.reduce(
                            (total, item) => total + item.quantity,
                            0
                          )}
                        />
                      </button>
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {filteredProducts.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          variants={productCardVariants}
                          whileHover="hover"
                          className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="relative">
                            <img
                              src={
                                product.image || "/placeholder-product.png"
                              }
                              alt={product.name}
                              className="w-full h-48 object-cover"
                              onError={handleImageError}
                            />
                            {/* {product.discountPercentage > 0 && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                {product.discountPercentage}% OFF
                              </div>
                            )} */}
                            <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-sm font-medium">4.5</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <div>
                                {product.discountPrice &&
                                product.discountPrice < product.price ? (
                                  <div>
                                    <span className="text-lg font-bold text-gray-900">
                                      ₹{product.price}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      ₹{product.discountPrice}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">
                                    ₹{product.price}
                                  </span>
                                )}
                                <p className="text-xs text-gray-500">
                                  {product.quantity}
                                  {product.unit}
                                </p>
                              </div>
                              {/* <button
                                className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                              >
                                <ShoppingCart className="w-5 h-5 mr-1" />
                                <span className="text-sm font-medium">Add</span>
                              </button> */}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No products available for this subcategory.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Select a Subcategory
                  </h3>
                  <p className="text-gray-500">
                    Choose a subcategory to view its products
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subpage;
