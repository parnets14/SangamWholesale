"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const HeroSection = () => {
  const [banners, setBanners] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://sangamwholesale.com/api/banners";

  // Fallback images in case API fails
  const fallbackImages = [
    "/g1.avif",
    "/g3.avif",
    "/g4.avif",
    "/g5.avif",
    "/g7.avif",
    "/e2.avif",
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(API_BASE_URL);

      if (response.ok) {
        const data = await response.json();
        // API returns { count, banners } shape
        const bannerList = Array.isArray(data) ? data : (data.banners || []);
        setBanners(bannerList);

        // Extract all images from all banners
        const allImages = [];
        bannerList.forEach((banner) => {
          if (banner.images && banner.images.length > 0) {
            banner.images.forEach((imagePath) => {
              const imageUrl = getImageUrl(imagePath);
              allImages.push(imageUrl);
            });
          }
        });

        // Use fetched images or fallback to default images
        setImageUrls(allImages.length > 0 ? allImages : fallbackImages);
      } else if (response.status === 404) {
        // No banners found, use fallback images
        setImageUrls(fallbackImages);
      } else {
        throw new Error("Failed to fetch banners");
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError(error.message);
      // Use fallback images on error
      setImageUrls(fallbackImages);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // Assuming your backend serves static files from /uploads
    return `https://sangamwholesale.com/${imagePath}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-persian-green mt-16">
        <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
          <div className="z-20 text-center px-4 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading banners...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-persian-green mt-16">
      {/* Mobile Layout */}
      <div className="md:hidden absolute inset-0 grid grid-cols-2 gap-2 p-2 z-0 overflow-y-auto">
        {imageUrls.map((url, index) => (
          <motion.div
            key={`mobile-${index}`}
            className="relative h-full w-full rounded-lg overflow-hidden shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img
              src={url}
              alt={`Banner ${index + 1}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Desktop Scrolling Layout */}
      <motion.div
        className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 items-center z-0"
        style={{
          animation: "scroll-left 30s linear infinite",
          width: `${imageUrls.length * 2 * 320}px`,
        }}
      >
        {[...imageUrls, ...imageUrls].map((url, index) => (
          <motion.img
            key={`desktop-${index}`}
            src={url}
            alt={`Banner ${index + 1}`}
            className="h-[60vh] w-[600px] md:h-[70vh] md:w-[700px] lg:h-[80vh] lg:w-[800px] object-cover rounded-xl shadow-xl border-2 border-[#bce5e3] mx-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        ))}
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
        <div className="z-20 text-center px-4 text-white max-w-4xl">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {banners.length > 0 && banners[0].title
              ? banners[0].title
              : "India's largest eB2B platform for businesses & shop-owners"}
          </motion.h1>

          {banners.length > 0 && banners[0].description && (
            <motion.p
              className="text-lg md:text-xl mb-6 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {banners[0].description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <NavLink
              to="/categories/food"
              className="bg-red-500 text-persian-green font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all duration-300 inline-block"
            >
              Explore Now
            </NavLink>
          </motion.div>

          {/* Error message if any */}
          {error && (
            <motion.div
              className="mt-4 text-yellow-300 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Using fallback images due to: {error}
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown className="text-white h-8 w-8" />
      </motion.div>

      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};

export default HeroSection;
