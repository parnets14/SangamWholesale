import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        damping: 15
      }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-green-100 transform transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        
        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 bg-white/70 rounded-full p-2 shadow-md"
        >
          <Heart 
            className="text-green-600 hover:text-green-800" 
            size={24} 
            fill="currentColor"
          />
        </motion.button>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-green-800 mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`
                ${i < product.rating 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
                } w-5 h-5
              `}
              fill="currentColor"
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            ({product.rating})
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">
            ₹{product.price.toLocaleString()}
          </span>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            className="
              bg-gradient-to-r from-green-500 to-emerald-600 
              text-white 
              rounded-full 
              p-2 
              shadow-md
              flex 
              items-center 
              justify-center
            "
          >
            <ShoppingCart size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;