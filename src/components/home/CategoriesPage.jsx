import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader,
  Image as ImageIcon,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useUserApi } from "../context/UserApiContext";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const {
    categories,
    subcategories,
    loading,
    error,
    fetchCategories,
    fetchSubcategories,
  } = useUserApi();

  // Filter subcategories based on selected category
  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.categoryId === selectedCategory)
    : [];

  // Filter subcategories based on search query
  const searchedSubcategories = filteredSubcategories.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Clear search when category changes
  };

  const handleSubcategoryClick = (subcategory) => {
    navigate(`/subcategories/${subcategory.id}`, {
      state: { subcategory, subcategories: filteredSubcategories },
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
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Categories
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchCategories();
              fetchSubcategories();
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
            Browse Categories
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a category to view its subcategories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-blue-50 border-2 border-blue-200 shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
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
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${
                            selectedCategory === category.id
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
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

          {/* Right Side - Subcategories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {selectedCategory ? (
                <>
                  {/* Selected Category Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {
                          categories.find((c) => c.id === selectedCategory)
                            ?.title
                        }
                      </h2>
                      <p className="text-gray-600">
                        {searchedSubcategories.length} subcategories available
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search subcategories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Subcategories Grid */}
                  {searchedSubcategories.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {searchedSubcategories.map((subcategory) => (
                        <motion.div
                          key={subcategory.id}
                          variants={cardVariants}
                          whileHover="hover"
                          onClick={() => handleSubcategoryClick(subcategory)}
                          className="bg-gray-50 rounded-xl p-4 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-gray-200">
                              {subcategory.image ? (
                                <img
                                  src={subcategory.image}
                                  alt={subcategory.name}
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {subcategory.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {subcategory.description}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchQuery
                          ? "No subcategories found matching your search."
                          : "No subcategories available for this category."}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Select a Category
                  </h3>
                  <p className="text-gray-500">
                    Choose a category from the left to view its subcategories
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

export default CategoriesPage;
