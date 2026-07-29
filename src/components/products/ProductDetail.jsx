import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RefreshCw 
} from 'lucide-react';

const ProductDetails = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8 bg-green-50/50">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="flex space-x-4">
            {product.images.map((img, index) => (
              <motion.img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.1 }}
                className={`
                  w-20 h-20 object-cover rounded-lg cursor-pointer
                  ${selectedImage === index 
                    ? 'border-2 border-green-500' 
                    : 'opacity-70 hover:opacity-100'}
                `}
              />
            ))}
          </div>
        </motion.div>

        {/* Product Information */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-green-800">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`
                  ${i < product.rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                  } w-6 h-6
                `}
                fill="currentColor"
              />
            ))}
            <span className="ml-2 text-green-600">
              ({product.rating} ratings)
            </span>
          </div>

          {/* Price */}
          <div className="text-4xl font-bold text-green-600">
            ₹{product.price.toLocaleString()}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-green-100 text-green-800 p-2 rounded-full"
            >
              -
            </button>
            <span className="text-xl">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="bg-green-100 text-green-800 p-2 rounded-full"
            >
              +
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                flex-1 
                bg-gradient-to-r 
                from-green-500 
                to-emerald-600 
                text-white 
                py-3 
                rounded-full 
                flex 
                items-center 
                justify-center 
                space-x-2
              "
            >
              <ShoppingCart />
              Add to Cart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                bg-green-100 
                text-green-800 
                p-3 
                rounded-full
              "
            >
              <Heart />
            </motion.button>
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Truck, text: "Free Shipping" },
              { icon: Shield, text: "Warranty" },
              { icon: RefreshCw, text: "Easy Returns" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="
                  bg-green-50 
                  p-4 
                  rounded-lg 
                  text-center 
                  hover:bg-green-100 
                  transition
                "
              >
                <feature.icon className="mx-auto text-green-600 mb-2" />
                <span className="text-sm text-green-800">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;