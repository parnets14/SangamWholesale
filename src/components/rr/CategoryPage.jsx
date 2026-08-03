import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader, Image as ImageIcon } from "lucide-react";
import { useUserApi } from "../context/UserApiContext";
import { useCart } from "../context/CartContext";

const CategoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { categories, loading, error, fetchCategories } = useUserApi();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  // Only show floating cart button on /categories route, not on /Home
  const showFloatingCart = location.pathname === "/categories";
  console.log(categories, "categories");
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

  const handleContinue = () => {
    if (selectedCategory) {
      navigate(`/categories/${selectedCategory}`);
    }
  };

  const handleImageError = (e) => {
    // Replace with a placeholder icon
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  if (loading) {
    return (
      <div className="min-w-0 bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader className="w-8 h-8 animate-spin text-gray-600 mb-4" />
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-w-0 bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#702834] mb-2">
                Error Loading Categories
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchCategories}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#702834' }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-w-0 bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No Categories Found
              </h2>
              <p className="text-gray-500 mb-4">
                Please add some categories from the admin panel.
              </p>
              <button
                onClick={fetchCategories}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Our Categories
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a category and then click continue
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-0 mb-12"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              whileHover="hover"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-xl shadow-sm bg-white border cursor-pointer overflow-hidden relative group transition-all ${
                selectedCategory === category.id
                  ? "ring-2 ring-offset-2 ring-[#702834]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {selectedCategory === category.id && (
                <div className="absolute top-3 right-3 z-10 bg-white p-0.5 rounded-full shadow">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}

              {/* Image */}
              <div className="relative w-full h-44 overflow-hidden bg-gray-100">
                {category.icon ? (
                  <>
                    <img
                      src={category.icon}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 flex items-center justify-center hidden">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h2 className="text-base font-bold text-gray-800 mb-1">
                  {category.title}
                </h2>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center text-xs font-medium text-gray-500 group-hover:text-[#702834] transition-colors">
                  <span>Click to select</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedCategory}
            className={`px-10 py-3 rounded-full font-medium text-white transition-all text-sm ${
              selectedCategory
                ? "shadow-md transform hover:scale-105"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            style={selectedCategory ? { backgroundColor: '#702834' } : {}}
          >
            Select a category to continue
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default CategoryPage;
