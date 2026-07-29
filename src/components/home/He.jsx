import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Truck, ShoppingBag, CreditCard, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const He = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Star,
      title: "Great wholesale prices",
      description: "Avail best prices on 5 Lakh+ top quality products",
      color: "text-blue-600",
      bgColor: "bg-gray-100"
    },
    {
      icon: Truck,
      title: "Quick doorstep delivery",
      description: "Get delivery of your orders at your doorstep",
      color: "text-indigo-600",
      bgColor: "bg-gray-100"
    },
    {
      icon: ShoppingBag,
      title: "Wide range from leading National & Regional brands",
      description: "Shop from 25,000 top sellers across India",
      color: "text-sky-600",
      bgColor: "bg-gray-100"
    },
    {
      icon: CreditCard,
      title: "Credit upto ₹5 Lakhs",
      description: "Avail credit facility upto ₹5 Lakhs",
      color: "text-cyan-600",
      bgColor: "bg-gray-100"
    },
    {
      icon: RefreshCw,
      title: "Smart returns",
      description: "Enjoy simple & hassle-free returns process",
      color: "text-gray-700",
      bgColor: "bg-gray-100"
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
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 100, mass: 0.5 }
    },
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <section 
      ref={ref}
      className="relative bg-white min-h-screen w-full px-4 md:px-20 py-10 overflow-hidden"
    >
      {/* Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3].map((bubble) => (
          <motion.div
            key={bubble}
            initial={{ 
              scale: 0, 
              opacity: 0,
              x: bubble % 2 === 0 ? '-50%' : '50%',
              y: bubble % 2 === 0 ? '-50%' : '50%'
            }}
            animate={{ 
              scale: [0, 1.2, 1],
              opacity: [0, 0.08, 0.04],
              rotate: 360
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: bubble * 0.5
            }}
            className={`absolute w-96 h-96 rounded-full ${
              bubble % 2 === 0 
                ? 'bg-gray-200 top-[-10%] left-[-10%]' 
                : 'bg-gray-100 bottom-[-10%] right-[-10%]'
            } blur-2xl`}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
        {/* Left Side */}
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-red-500 font-semibold text-sm mb-8 tracking-wider uppercase">
              Welcome to UBook
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-16 text-gray-900">
              Buy stocks for your <br />
              <span className="text-red-500">shop/business</span> easily
            </h1>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl shadow-xl"
          >
            <video
              src="/h1.mp4"
              className="w-full max-w-md object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          </motion.div>
        </motion.div>

        {/* Right Side - Features */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 text-left"
        >
          {features.map(({ icon: Icon, title, description, color, bgColor }, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className={`p-4 rounded-2xl ${bgColor} border border-gray-200 hover:border-blue-300 transition-all duration-300 group`}
            >
              <div className="flex items-center mb-3">
                <div className={`mr-3 w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 leading-snug">
                  {title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 pl-14">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex justify-center mt-16"
      >
        <Link to="/about">
        
        <button 
          className="px-8 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition duration-300"
        >
          Get Started Now
        </button>
        </Link>
      </motion.div>
    </section>
  );
};

export default He;
