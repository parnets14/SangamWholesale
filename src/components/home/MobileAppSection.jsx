
import React, { useRef } from 'react';
import { NavLink } from "react-router-dom";
import { motion, useInView } from 'framer-motion';
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { CheckCircle, ShieldCheck } from 'lucide-react';

const MobileAppSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: CheckCircle,
      title: "Best Offers",
      description: "Exclusive deals and discounts"
    },
    {
      icon: ShieldCheck,
      title: "Safe Payments",
      description: "Secure transaction methods"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <section 
      ref={ref}
      className="bg-gradient-to-br from-white to-white min-h-screen w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-10 px-6 md:px-16 py-12 overflow-hidden"
    >
      {/* Left Side Content */}
      <div className="max-w-xl space-y-6 lg:pr-12">
        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
        >
          A Powerful Mobile App for 
          <br />
          <span className="text-red-500">Quick & Easy Buying</span>
        </motion.h1>

        {/* Features Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-6 mt-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <feature.icon className="w-10 h-10 text-red-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-8"
        >
          <p className="text-gray-700 font-medium mb-4">
            Download Our App
          </p>
          <div className="flex flex-wrap gap-4">
            <NavLink
              to="/download-ios"
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition transform hover:scale-105 shadow-lg"
            >
              <FaApple className="text-2xl" />
              App Store
            </NavLink>
            <NavLink
              to="/download-android"
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition transform hover:scale-105 shadow-lg"
            >
              <FaGooglePlay className="text-2xl" />
              Google Play
            </NavLink>
          </div>
        </motion.div>
      </div>

      {/* Right Side Video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md flex justify-center"
      >
        <div className="relative bg-green-100 rounded-full w-72 h-72 md:w-96 md:h-96 flex items-center justify-center shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <video
            src="/m1.mp4"
            className="w-full h-full object-cover rounded-full shadow-lg"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </motion.div>
    </section>
  );
};

export default MobileAppSection;