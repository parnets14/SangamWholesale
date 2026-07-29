import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Grid, User, ShoppingCart } from "lucide-react";
import logo from "../../assets/images/Udaanlogo.png";
const LoggedInHeader = ({ cartItems = [] }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate total cart items
  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const cartItemCount = getTotalCartItems();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logout();
      navigate("/");
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
    setIsMenuOpen(false);
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      x: "-100%",
      transition: {
        duration: 0.3,
      },
    },
    visible: {
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex justify-between items-center fixed w-full top-0 z-50 shadow-lg"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex items-center space-x-2"
      >
        <Link to="/Home" className="text-xl font-bold flex items-center">
          <div className="h-8 w-8 rounded-full shadow-md bg-white flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="Udan Logo"
              className="h-full w-full object-cover"
            />
          </div>
          Udaan
        </Link>
      </motion.div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-4">
        <motion.div
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center space-x-4"
        >
          <Link
            to="/categories"
            className="flex items-center hover:text-green-200 transition-colors duration-300 group"
          >
            <Grid
              size={18}
              className="mr-2 group-hover:rotate-12 transition-transform"
            />
            Categories
          </Link>
          <Link
            to="/profile"
            className="flex items-center hover:text-green-200 transition-colors duration-300 group"
          >
            <User
              size={18}
              className="mr-2 group-hover:scale-110 transition-transform"
            />
            Profile
          </Link>

          {/* Cart Icon */}
          <motion.button
            onClick={handleCartClick}
            className="relative p-2 rounded-full hover:bg-green-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartItemCount}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
              >
                {cartItemCount}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-green-600 px-4 py-2 mr-24 rounded-full flex items-center hover:bg-green-700 transition-colors duration-300 shadow-md"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="focus:outline-none"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-gradient-to-br from-green-900 to-emerald-800 z-50 flex flex-col items-center justify-center space-y-6 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/categories"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl flex items-center hover:text-green-300 transition-colors group"
              >
                <Grid
                  size={24}
                  className="mr-4 group-hover:rotate-12 transition-transform"
                />
                Categories
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl flex items-center hover:text-green-300 transition-colors group"
              >
                <User
                  size={24}
                  className="mr-4 group-hover:scale-110 transition-transform"
                />
                Profile
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <button
                onClick={handleCartClick}
                className="text-2xl flex items-center hover:text-green-300 transition-colors group"
              >
                <ShoppingCart
                  size={24}
                  className="mr-4 group-hover:scale-110 transition-transform"
                />
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-sm rounded-full px-2 py-1 font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleLogout}
                className="text-2xl bg-green-600 px-6 py-3 rounded-full flex items-center hover:bg-green-700 transition-colors shadow-md"
              >
                <LogOut size={24} className="mr-4" />
                Logout
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-green-300 transition-colors"
            >
              <X size={32} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LoggedInHeader;
