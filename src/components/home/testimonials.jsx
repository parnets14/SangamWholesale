import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://sangamwholesale.com/api/Business";

  // Default fallback testimonials
  const defaultTestimonials = [
    {
      _id: "1",
      title: "AgriTech Revolution",
      image: "/k1.avif",
      Description:
        "Transforming rural agriculture with digital marketplaces that connect farmers directly to consumers nationwide.",
    },
    {
      _id: "2",
      title: "Urban Distribution Network",
      image: "/k2.avif",
      Description:
        "Building hyper-local supply chains that empower small businesses to compete with e-commerce giants.",
    },
  ];

  // Fetch businesses from API
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch businesses");
      const data = await response.json();
      setBusinesses(data.length > 0 ? data : defaultTestimonials);
    } catch (err) {
      setError(err.message);
      // Fallback to default testimonials if API fails
      setBusinesses(defaultTestimonials);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleNextTestimonial = () => {
    setActiveIndex((prev) => (prev === businesses.length - 1 ? 0 : prev + 1));
  };

  const handlePrevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? businesses.length - 1 : prev - 1));
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-white min-h-screen w-full py-16 px-4 md:px-20 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading success stories...</p>
        </div>
      </section>
    );
  }

  const current = businesses[activeIndex];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white min-h-screen w-full py-16 px-4 md:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content - Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              <span style={{ color: '#702834' }}>Success</span> Stories from <br />
              <span className="relative inline-block">
                Across India
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute bottom-0 left-0 w-full h-1 bg-red-500 origin-left"
                />
              </span>
            </h1>
          </div>

          {/* Current Testimonial Info */}
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800">
              {current.title}
            </h3>
            <p className="text-gray-600">{current.Description}</p>
            {current.stats && (
              <div className="text-red-600 font-medium">{current.stats}</div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              onClick={handlePrevTestimonial}
              className="text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: '#702834' }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextTestimonial}
              className="text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: '#702834' }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </motion.div>

        {/* Right Content - Image Section */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={
                  current.image
                    ? `https://sangamwholesale.com/${current.image}`
                    : current.image
                }
                alt={current.title}
                className="w-full h-[500px] object-cover transition-all duration-500"
                onError={(e) => {
                  // Fallback to default images if business image fails to load
                  e.target.src = `/k${(activeIndex % 2) + 1}.avif`;
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Only show the current index indicator */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <div className="text-sm font-medium text-red-600">
                {activeIndex + 1}/{businesses.length}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="mt-16 flex justify-center space-x-4 pb-4 px-4">
        {businesses.map((item, i) => (
          <motion.button
            key={item._id || i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transform transition-all duration-300 ${
              i === activeIndex
                ? "border-red-600 shadow-lg scale-105"
                : "border-gray-200 opacity-80 hover:opacity-100"
            }`}
            aria-label={`View ${item.title}`}
          >
            <img
              src={
                item.image
                  ? `https://sangamwholesale.com/${item.image}`
                  : item.image
              }
              alt={`Thumbnail ${i}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default images if business image fails to load
                e.target.src = `/k${(i % 2) + 1}.avif`;
              }}
            />
          </motion.button>
        ))}
      </div>

      {/* Optional: Error display (subtle) */}
      {error && (
        <div className="mt-4 text-center text-gray-500 text-xs">
          <p>Using sample data - check admin panel for live content</p>
        </div>
      )}
    </section>
  );
};

export default TestimonialSection;
