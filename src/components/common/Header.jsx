//
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
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
import logo from "../../assets/images/Udaanlogo.png"; // Adjust the path as necessary
const Header = ({ cartItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Calculate total cart items
  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

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

  const cartItemCount = getTotalCartItems();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed w-full top-0 z-50 
        ${
          isScrolled
            ? "bg-red-400 backdrop-blur-md shadow-md"
            : "bg-gradient-to-r from-red-400 to-red-400"
        }
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full shadow-md bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>

              <span className="text-2xl font-bold text-black">Udaan</span>
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
                      isActive ? "text-white" : "text-white hover:text-white"
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
                        isActive ? "text-white" : "text-white hover:text-white"
                      }`
                    }
                  >
                    <User size={18} />
                    PROFILE
                  </NavLink>
                </motion.div>

                <motion.button
                  onClick={handleCartClick}
                  className="relative p-2 rounded-full hover:bg-red-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-6 h-6 text-white" />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={cartItemCount}
                      className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
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
                    bg-gradient-to-r 
                    from-black
                    to-black
                    rounded-full 
                    hover:from-red-600 
                    hover:to-red-600 
                    transition-all 
                    flex 
                    items-center 
                    gap-2
                  "
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
                      bg-gradient-to-r 
                      from-red-700 
                      to-red-600 
                      rounded-full 
                      hover:from-green-600 
                      hover:to-green-700 
                      transition-all 
                      flex 
                      items-center 
                      gap-2
                    "
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
                text-red-800  
                hover:bg-green-100 
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
            className="
              md:hidden 
              bg-gradient-to-br 
              from-red-300 
              to-red-400 
              shadow-lg 
              rounded-b-2xl 
              overflow-hidden
            "
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
                  <p className="text-red-800 font-medium">
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
                      text-red-800 
                      hover:bg-green-100 
                      rounded-xl 
                      transition-colors
                    "
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 text-black" size={24} />
                    {item.label}
                    {item.count > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-xs rounded-full px-2 py-1 font-bold">
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
                      text-red-800 
                      hover:bg-red-100 
                      rounded-xl 
                      transition-colors
                      w-full
                    "
                  >
                    <LogOut className="mr-3 text-red-600" size={24} />
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
