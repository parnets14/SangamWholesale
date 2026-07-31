//
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  Search,
  Menu,
  X,
  Home,
  Download,
  LogIn,
  User,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import logo from "../../assets/images/sangamwholesale.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const cartItemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logout();
      navigate("/");
      setIsOpen(false);
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    navigate("/cart");
    setIsOpen(false);
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 120,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
      },
    },
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed w-full top-0 z-50 shadow-sm transition-all duration-300 ease-in-out backdrop-blur-md border-b border-white/20"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-full shadow-md bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                <img
                  src={logo}
                  alt="Sangam Wholesale"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'black' }}>Sangam  Wholesale</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
          >
            {/* Search functionality can be added here */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-6"
          >
            {[
              { to: "/about", label: "ABOUT" },
              { to: "/download", label: "DOWNLOAD APP" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={menuItemVariants}
                whileHover="hover"
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `transition-colors font-medium ${
                      isActive ? "text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}

            {isAuthenticated ? (
              <>
                <motion.div variants={menuItemVariants} whileHover="hover">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `transition-colors font-medium flex items-center gap-2 ${
                        isActive ? "text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"
                      }`
                    }
                  >
                    <User size={18} />
                    PROFILE
                  </NavLink>
                </motion.div>

                <motion.button
                  onClick={handleCartClick}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-6 h-6" style={{ color: '#702834' }} />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={cartItemCount}
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      style={{ backgroundColor: '#702834' }}
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="
                    px-4 py-2 
                    text-white 
                    rounded-full 
                    transition-all 
                    flex 
                    items-center 
                    gap-2
                  "
                  style={{ background: '#702834' }}
                  onMouseEnter={e => e.currentTarget.style.background='#5a1f29'}
                  onMouseLeave={e => e.currentTarget.style.background='#702834'}
                >
                  <LogOut size={16} />
                  LOGOUT
                </motion.button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      px-4 py-2 
                      text-white 
                      rounded-full 
                      transition-all 
                      flex 
                      items-center 
                      gap-2
                    "
                    style={{ background: '#702834' }}
                    onMouseEnter={e => e.currentTarget.style.background='#5a1f29'}
                    onMouseLeave={e => e.currentTarget.style.background='#702834'}
                  >
                    <LogIn size={16} />
                    LOGIN
                  </motion.button>
                </NavLink>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden"
          >
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              className="
                p-2 rounded-md 
                text-gray-700
                hover:bg-gray-100 
                focus:outline-none
              "
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden shadow-lg rounded-b-2xl overflow-hidden border-t border-white/20 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
          >
            <div className="px-4 py-6 space-y-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands and more"
                  className="
                    w-full px-4 py-2 
                    rounded-full 
                    border border-red-200 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-red-800 
                    bg-white
                  "
                />
                <button
                  className="
                  absolute right-3 top-1/2 
                  transform -translate-y-1/2 
                  text-red-800 
                "
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-100 rounded-lg p-3 mb-4"
                >
                  <p className="font-medium" style={{ color: '#702834' }}>
                    Welcome, {user.name || user.phone || "User"}
                  </p>
                </motion.div>
              )}

              {[
                { icon: Home, to: "/", label: "Home" },
                { icon: Download, to: "/download", label: "Download App" },
                ...(isAuthenticated
                  ? [
                      {
                        icon: ShoppingCart,
                        to: "/cart",
                        label: "Cart",
                        count: cartItemCount,
                      },
                      { icon: User, to: "/profile", label: "Profile" },
                    ]
                  : [{ icon: LogIn, to: "/login", label: "Login" }]),
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.to}
                    className="
                      flex items-center 
                      px-4 py-3 
                      text-gray-700
                      hover:bg-gray-100 
                      rounded-xl 
                      transition-colors
                    "
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 text-gray-600" size={24} />
                    {item.label}
                    {item.count > 0 && (
                      <span className="ml-auto text-white text-xs rounded-full px-2 py-1 font-bold" style={{ backgroundColor: '#702834' }}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}

              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={handleLogout}
                    className="
                      flex items-center 
                      px-4 py-3 
                      text-gray-700
                      hover:bg-gray-100 
                      rounded-xl 
                      transition-colors
                      w-full
                    "
                  >
                    <LogOut className="mr-3" style={{ color: '#702834' }} size={24} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;
