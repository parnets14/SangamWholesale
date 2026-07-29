import React from "react";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const CartIcon = ({ itemCount = 0, onClick }) => {
  return (
    <motion.button 
      onClick={onClick} 
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={itemCount}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]"
          style={{ fontSize: '10px' }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}
    </motion.button>
  );
};

export default CartIcon;