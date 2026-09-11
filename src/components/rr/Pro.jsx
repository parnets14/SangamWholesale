import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import CartIcon from "./CartIcon";

const productsData = {
  staples: [
    {
      id: "basmati-rice",
      name: "Basmati Rice",
      price: 599,
      rating: 4.5,
      image: "/ri3.avif",
      description: "Premium quality long grain basmati rice"
    },
    {
      id: "whole-wheat",
      name: "Whole Wheat",
      price: 299,
      rating: 4.2,
      image: "/ri1.webp",
      description: "Organic whole wheat flour"
    }
  ],
  fmcg: [
    {
      id: "toothpaste",
      name: "Toothpaste",
      price: 99,
      rating: 4.7,
      image: "/ri3.avif",
      description: "Mint flavored toothpaste for fresh breath"
    },
    {
      id: "shampoo",
      name: "Shampoo",
      price: 199,
      rating: 4.3,
      image: "/ri3.avif",
      description: "Hair fall control shampoo with natural extracts"
    }
  ],
  "fruits-vegetables": [
    {
      id: "mango",
      name: "Alphonso Mango",
      price: 899,
      rating: 4.8,
      image: "/ri3.avif",
      description: "Premium Alphonso mangoes from Maharashtra"
    },
    {
      id: "apple",
      name: "Kashmiri Apple",
      price: 199,
      rating: 4.6,
      image: "/ri3.avif",
      description: "Fresh and juicy Kashmiri apples"
    },
    {
      id: "banana",
      name: "Banana",
      price: 49,
      rating: 4.2,
      image: "/ri3.avif",
      description: "Fresh and nutritious bananas"
    },
    {
      id: "tomato",
      name: "Tomato",
      price: 29,
      rating: 4.0,
      image: "/ri3.avif",
      description: "Fresh farm tomatoes"
    }
  ],
  "meat-eggs": [
    {
      id: "chicken",
      name: "Fresh Chicken",
      price: 249,
      rating: 4.4,
      image: "/ri3.avif",
      description: "Fresh farm chicken"
    },
    {
      id: "eggs",
      name: "Farm Eggs",
      price: 99,
      rating: 4.5,
      image: "/ri3.avif",
      description: "Organic farm fresh eggs"
    }
  ]
};

const Pro = () => {
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check login status when component mounts
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn');
      setIsLoggedIn(loginStatus === 'true');
    };
    
    checkLoginStatus();
    
    // Listen for login status changes
    const handleAuthChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const products = productsData[subCategoryId] || [];

  const addToCart = (product) => {
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold capitalize">
              {subCategoryId.replace('-', ' ')} Products
            </h1>
          </div>
          <button 
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Cart"
          >
            <CartIcon itemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
          </button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative">
                <img
                  src={product.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='192' fill='%23e5e7eb'%3E%3Crect width='200' height='192'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='192' fill='%23e5e7eb'%3E%3Crect width='200' height='192'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                  <button
                    className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Add to Cart</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Pro;