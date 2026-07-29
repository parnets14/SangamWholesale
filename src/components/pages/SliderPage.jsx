import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Heart 
} from 'lucide-react';
import Sidebar from '../pages/Sidebar';

// Sample Slider Data
const SLIDER_DATA = [
  {
    id: 1,
    title: 'Summer Collection',
    description: 'Trendy Styles for Hot Days',
    image: 'https://example.com/summer-collection.jpg',
    discount: 30,
    category: 'Fashion'
  },
  {
    id: 2,
    title: 'Tech Gadgets',
    description: 'Latest Innovations',
    image: 'https://example.com/tech-gadgets.jpg',
    discount: 25,
    category: 'Electronics'
  },
  {
    id: 3,
    title: 'Home Essentials',
    description: 'Comfort Meets Style',
    image: 'https://example.com/home-essentials.jpg',
    discount: 40,
    category: 'Home & Living'
  }
];

const SliderPage = () => {
  // State Management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Autoplay Effect
  useEffect(() => {
    let intervalId;
    if (isAutoPlay) {
      intervalId = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
      }, 5000); // Change slide every 5 seconds
    }

    return () => clearInterval(intervalId);
  }, [isAutoPlay]);

  // Slide Navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? SLIDER_DATA.length - 1 : prev - 1
    );
  };

  // Slide Variants for Animations
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Current Slide Data
  const currentSlideData = SLIDER_DATA[currentSlide];

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-20 flex-grow relative overflow-hidden"
      >
        {/* Slider Container */}
        <div className="relative w-full h-screen">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Slide Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-12">
                {/* Slide Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-block">
                    {currentSlideData.category}
                  </div>
                  
                  <h1 className="text-5xl font-bold text-green-900">
                    {currentSlideData.title}
                  </h1>
                  
                  <p className="text-xl text-green-700">
                    {currentSlideData.description}
                  </p>
                  
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="
                        bg-green-500 
                        text-white 
                        px-6 py-3 
                        rounded-lg 
                        flex 
                        items-center 
                        space-x-2
                      "
                    >
                      <ShoppingCart />
                      <span>Shop Now</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="
                        border 
                        border-green-500 
                        text-green-500 
                        px-6 py-3 
                        rounded-lg 
                        flex 
                        items-center 
                        space-x-2
                      "
                    >
                      <Heart />
                      <span>Add to Wishlist</span>
                    </motion.button>
                  </div>
                  
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg inline-block">
                    Up to {currentSlideData.discount}% OFF
                  </div>
                </motion.div>

                {/* Slide Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center"
                >
                  <img 
                    src={currentSlideData.image} 
                    alt={currentSlideData.title}
                    className="max-w-full h-auto object-contain"
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="
                bg-white 
                shadow-lg 
                rounded-full 
                p-2 
                z-10
              "
            >
              <ChevronLeft className="text-green-500" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="
                bg-white 
                shadow-lg 
                rounded-full 
                p-2 
                z-10
              "
            >
              <ChevronRight className="text-green-500" />
            </motion.button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {SLIDER_DATA.map((_, index) => (
              <motion.div
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`
                  w-3 h-3 
                  rounded-full 
                  cursor-pointer 
                  transition-all 
                  duration-300
                  ${currentSlide === index 
                    ? 'bg-green-500 w-6' 
                    : 'bg-green-200'}
                `}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SliderPage;