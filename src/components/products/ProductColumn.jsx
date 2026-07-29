import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

const ProductColumn = ({ 
  selectedSubcategory, 
  onAddToCart 
}) => {
  if (!selectedSubcategory) return null;

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-2/4 p-6"
    >
      <h2 className="text-2xl font-bold text-green-900 mb-6">
        {selectedSubcategory.name}
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {selectedSubcategory.products.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            className="
              bg-white 
              rounded-xl 
              p-6 
              shadow-lg 
              border 
              border-green-100
            "
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-green-900">
              {product.name}
            </h3>
            <p className="text-green-700 mb-4">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600">
                ₹{product.price}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAddToCart(product)}
                  className="
                    bg-green-500 
                    text-white 
                    p-2 
                    rounded-full 
                    hover:bg-green-600
                  "
                >
                  <ShoppingCart />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductColumn;