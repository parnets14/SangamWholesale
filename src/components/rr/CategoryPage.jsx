import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader, Image as ImageIcon } from "lucide-react";
import { useUserApi } from "../context/UserApiContext";

const CategoryPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { categories, loading, error, fetchCategories } = useUserApi();
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 px-4 sm:px-0 mb-12"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              whileHover="hover"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-2xl p-6 shadow-sm ${category.color} border ${
                category.border
              } cursor-pointer overflow-hidden relative group transition-all ${
                selectedCategory === category.id
                  ? "ring-2 ring-offset-2 ring-gray-400"
                  : ""
              }`}
            >
              {selectedCategory === category.id && (
                <div className="absolute top-4 right-4 bg-white p-1 rounded-full">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              )}
              <div className="flex flex-col items-center text-center h-full">
                <div
                  className={`p-4 rounded-xl ${category.color} border ${category.border} mb-6 transition-transform group-hover:scale-110 relative`}
                >
                  {category.icon ? (
                    <>
                      <img
                        src={category.icon}
                        alt={category.title}
                        className="w-16 h-16 object-contain"
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 flex items-center justify-center hidden">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <h2 className={`text-xl font-bold mb-2 ${category.text}`}>
                  {category.title}
                </h2>
                <p className="text-sm text-gray-600 mb-6 px-2">
                  {category.description}
                </p>
                <div
                  className={`mt-auto inline-flex items-center justify-center p-3 rounded-full ${category.button} transition-colors`}
                >
                  <ArrowRight className="w-5 h-5 text-gray-700" />
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
            className={`w-90 px-8 py-3 rounded-full font-medium text-white transition-all ${
              selectedCategory
                ? "shadow-md transform hover:scale-105"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            style={selectedCategory ? { backgroundColor: '#702834' } : {}}
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryPage;
