import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserApi } from "../context/UserApiContext";
import { motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

const SubcategoryScreen = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { subcategories, categories, loading, error } = useUserApi();

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.categoryId === categoryId
  );
  const category = categories.find((cat) => cat.id === categoryId);

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/products/${subcategoryId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading subcategories</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button
        className="mb-4 flex items-center text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2" /> Back to Categories
      </button>
      <h1 className="text-2xl font-bold mb-6">
        {category ? category.title : "Subcategories"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubcategories.map((subcategory) => (
          <motion.div
            key={subcategory.id}
            whileHover={{ scale: 1.03 }}
            className="p-4 bg-white rounded-xl shadow cursor-pointer flex items-center"
            onClick={() => handleSubcategoryClick(subcategory.id)}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
              {subcategory.image ? (
                <img
                  src={subcategory.image}
                  alt={subcategory.name}
                  className="w-full h-full object-cover"
                  onError={e => (e.target.src = "/ri3.avif")}
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold">{subcategory.name}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryScreen; 