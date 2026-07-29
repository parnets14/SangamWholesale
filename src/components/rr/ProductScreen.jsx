import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserApi } from "../context/UserApiContext";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";

const ProductScreen = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const { products, subcategories, loading, error } = useUserApi();

  const filteredProducts = products.filter(
    (product) => product.subcategoryId === subcategoryId
  );
  const subcategory = subcategories.find((sub) => sub.id === subcategoryId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        className="mb-4 flex items-center text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2" /> Back to Subcategories
      </button>
      <h1 className="text-2xl font-bold mb-6">
        {subcategory ? subcategory.name : "Products"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product) => {
          const hasDiscount =
            product.discountPrice && product.discountPrice < product.price;
          const discountPercent = hasDiscount
            ? Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )
            : 0;
          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              <div className="relative mb-3">
                <img
                  src={product.image || "/ri3.avif"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                  onError={e => (e.target.src = "/ri3.avif")}
                />
                {hasDiscount && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {discountPercent}% OFF
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-medium">4.5</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{hasDiscount ? product.discountPrice : product.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.price}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-2">
                    {product.unit}
                  </span>
                </div>
              </div>
              <button
                className="mt-4 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2"
                // onClick={() => addToCart(product)}
              >
                <ShoppingCart className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Add</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductScreen; 