import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserApi } from "../context/UserApiContext";
import { motion } from "framer-motion";
import { Check, Image as ImageIcon } from "lucide-react";

const CategoryScreen = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useUserApi();

  const handleCategoryClick = (categoryId) => {
    navigate(`/subcategories/${categoryId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.03 }}
            className="p-4 bg-white rounded-xl shadow cursor-pointer flex items-center"
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
              {category.icon ? (
                <img
                  src={category.icon}
                  alt={category.title}
                  className="w-full h-full object-cover"
                  onError={e => (e.target.src = "/ri3.avif")}
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold">{category.title}</div>
              <div className="text-sm text-gray-500">{category.description}</div>
            </div>
            <Check className="ml-auto text-blue-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryScreen; 