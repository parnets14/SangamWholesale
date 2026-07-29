
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const AdvancedCard = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const cardData = {
    title: "Business Growth Accelerator",
    description: "Unlock your business potential with our comprehensive platform",
    features: [
      "Real-time Analytics",
      "Inventory Management",
      "Customer Insights"
    ],
    image: "/business-growth.avif",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    accentColor: "bg-gradient-to-br from-green-500 to-emerald-500"
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.5
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      variants={cardVariants}
      className={`relative max-w-4xl mx-auto rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 gap-8 p-8 ${cardData.bgColor}`}
    >
      {/* Content Section */}
      <div className="relative z-10 space-y-6">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-800"
        >
          {cardData.title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600"
        >
          {cardData.description}
        </motion.p>

        {/* Features List */}
        <div className="space-y-3">
          {cardData.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={featureVariants}
              transition={{ delay: index * 0.2 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${cardData.accentColor} text-white`}
              >
                <Check size={16} />
              </motion.div>
              <span className="text-gray-700">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Get Started <ArrowRight className="ml-2" />
        </motion.button>
      </div>

      {/* Image Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-center"
      >
        <motion.img
          src={cardData.image}
          alt="Business Growth"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full max-w-md h-auto object-contain rounded-2xl shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
};

export default AdvancedCard;