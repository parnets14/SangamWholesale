import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { motion, useInView } from 'framer-motion';
import { 
  Users, 
  ShoppingBag, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';
import CountUp from 'react-countup';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);

  const stats = [
    { 
      icon: Users,
      Number: 300000, 
      suffix: "+",
      Title: "Retailers",
      color: "text-blue-600",
      bgColor: "bg-white"
    },
    { 
      icon: ShoppingBag,
      Number: 25000, 
      suffix: "+", 
      Title: "Sellers",
      color: "text-sky-600",
      bgColor: "bg-white"
    },
    { 
      icon: MapPin,
      Number: 900, 
      suffix: "+", 
      Title: "Daily Cities",
      color: "text-indigo-600",
      bgColor: "bg-white"
    }
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setIsAnimationStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 }
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-24 px-4 sm:px-6 md:px-10 overflow-hidden"
      style={{ backgroundColor: "#fff9ed" }}
    >
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold mb-16 leading-tight text-gray-800"
        >
          Powering India's <br />
          <span style={{ color: '#702834' }}>Business Ecosystem</span>
        </motion.h2>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`${stat.bgColor} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-200`}
            >
              <div className="flex justify-center mb-4">
                <stat.icon 
                  className={`w-12 h-12 ${stat.color} group-hover:scale-110 transition-transform`} 
                />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
                {isAnimationStarted && (
                  <CountUp
                    start={0}
                    end={stat.Number}
                    duration={2.5}
                    separator=","
                    suffix={stat.suffix || ''}
                  />
                )}
              </div>
              <div className="text-base md:text-lg font-medium text-gray-600">
                {stat.Title}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <NavLink
            to="/register"
            className="inline-flex items-center text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 group"
            style={{ backgroundColor: '#702834' }}
          >
            Start Your Journey
            <ArrowRight className="ml-3 text-white transition-transform group-hover:translate-x-1" /> 
          </NavLink>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
