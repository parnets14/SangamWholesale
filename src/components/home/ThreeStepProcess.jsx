import React, { useRef, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Check, Loader } from "lucide-react";
import { motion, useInView } from "framer-motion";
import axios from "axios";

const API_BASE = "";
const defaultSteps = [
  {
    id: 1,
    title: "Create an account",
    description:
      "Register using your mobile number. Enter your Name, Shop name and Pincode.",
    image: "/c1.avif",
    bgColor: "bg-gradient-to-br from-red-50 to-orange-50",
    iconBg: "bg-gradient-to-br from-red-500 to-orange-500",
    borderColor: "border-red-300",
  },
  {
    id: 2,
    title: "Complete shop KYC",
    description:
      "Upload any one of shop's KYC documents like GSTIN, Shop & Establishment Licence",
    image: "/kyc.avif",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
    borderColor: "border-orange-300",
  },
  {
    id: 3,
    title: "Start Ordering",
    description:
      "Browse and order products for your shop from top sellers & brands",
    image: "/o1.avif",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
    iconBg: "bg-gradient-to-br from-amber-500 to-yellow-500",
    borderColor: "border-amber-300",
  },
];

const ThreeStepProcess = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // State for KYC data
  const [steps, setSteps] = useState(defaultSteps);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color schemes for dynamic steps
  const colorSchemes = [
    {
      bgColor: "bg-gradient-to-br from-red-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-red-500 to-orange-500",
      borderColor: "border-red-300",
    },
    {
      bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
      borderColor: "border-orange-300",
    },
    {
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      iconBg: "bg-gradient-to-br from-amber-500 to-yellow-500",
      borderColor: "border-amber-300",
    },
    {
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
      borderColor: "border-blue-300",
    },
    {
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
      borderColor: "border-purple-300",
    },
  ];

  // Fetch KYC data
  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/trading`, {
        headers: { "Cache-Control": "no-store" },
      });

      // trading API returns a plain array
      const data = Array.isArray(res.data) ? res.data : [];

      if (data.length > 0) {
        const dynamicSteps = data.map((item, index) => ({
          id: index + 1,
          title: item.title || `Step ${index + 1}`,
          description:
            item.Description || item.description || "No description available",
          image: item.image ? `/${item.image}` : `/step-${index + 1}.avif`,
          ...colorSchemes[index % colorSchemes.length],
        }));
        setSteps(dynamicSteps);
      } else {
        setSteps(defaultSteps);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to fetch KYC data:", err);
      setError("Failed to load steps data");
      setSteps(defaultSteps);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const stepVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        mass: 0.5,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-gradient-to-br from-red-50 to-amber-50 py-20 px-4 md:px-8 lg:px-20 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        {[1, 2, 3, 4, 5, 6].map((bubble) => {
          const size = Math.floor(Math.random() * 100) + 50;
          const delay = bubble * 0.3;
          const duration = 8 + Math.random() * 4;
          const xPos = bubble % 2 === 0 ? "10%" : "90%";
          const yPos =
            bubble % 3 === 0 ? "10%" : bubble % 3 === 1 ? "50%" : "90%";

          return (
            <motion.div
              key={bubble}
              initial={{
                scale: 0,
                opacity: 0,
                x: xPos,
                y: yPos,
              }}
              animate={{
                scale: [0, 0.8, 0.6],
                opacity: [0, 0.1, 0.05],
                rotate: 360,
              }}
              transition={{
                duration,
                repeat: Infinity,
                repeatType: "reverse",
                delay,
              }}
              className={`absolute rounded-full ${
                bubble % 3 === 0
                  ? "bg-red-200"
                  : bubble % 3 === 1
                  ? "bg-orange-200"
                  : "bg-amber-200"
              } blur-xl opacity-30`}
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          );
        })}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:40px_40px] opacity-[0.03]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center mb-20 px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold py-2 px-6 rounded-full mb-6 shadow-md"
          >
            <Check className="w-4 h-4 mr-2" />
            Simple Process
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Start Trading in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              {steps.length} Simple Steps
            </span>
          </h2>

          <motion.p
            className="text-gray-700 max-w-2xl mx-auto text-lg md:text-xl"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
          >
            Transform your business with our seamless onboarding experience
          </motion.p>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg max-w-md mx-auto"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <Loader className="w-8 h-8 animate-spin text-red-500 mr-3" />
            <span className="text-gray-600 text-lg">Loading steps...</span>
          </motion.div>
        )}

        {/* Steps Container */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={`grid gap-10 md:gap-8 lg:gap-12 ${
              steps.length <= 3
                ? "md:grid-cols-3"
                : steps.length === 4
                ? "md:grid-cols-2 lg:grid-cols-4"
                : "md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={stepVariants}
                whileHover="hover"
                className={`
                  relative p-8 rounded-3xl shadow-lg 
                  transform transition-all duration-300
                  ${step.bgColor} ${step.borderColor}
                  border-2 overflow-hidden
                  flex flex-col
                `}
              >
                {/* Step Number */}
                <motion.div
                  className={`
                    absolute top-6 right-6 
                    w-14 h-14 rounded-full 
                    flex items-center justify-center
                    ${step.iconBg} text-white font-bold
                    shadow-lg text-xl
                  `}
                  variants={iconVariants}
                >
                  {step.id}
                </motion.div>

                {/* Decorative corner */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 ${step.borderColor} border-b-2 border-l-2 rounded-bl-3xl`}
                ></div>

                {/* Step Image */}
                <div className="mb-8 flex justify-center mt-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                    animate={
                      isInView ? { scale: 1, opacity: 1, rotate: 0 } : {}
                    }
                    transition={{
                      duration: 0.6,
                      delay: index * 0.2,
                      type: "spring",
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl"></div>
                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-1 shadow-inner">
                      <img
                        src={step.image}
                        alt={`Step ${step.id}: ${step.title}`}
                        className="w-48 h-48 object-cover rounded-lg shadow"
                        onError={(e) => {
                          // Fallback image if KYC image fails to load
                          e.target.src = `/step-${step.id}.avif`;
                        }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Step Details */}
                <div className="text-center mb-6 flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 text-md leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Progress indicator for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex items-center justify-center mt-6 mb-2">
                    <div className="h-1 w-16 bg-gradient-to-r from-red-300 to-orange-300 rounded-full"></div>
                    <ArrowRight className="text-red-500 mx-1" size={20} />
                  </div>
                )}

                {/* Connecting Line for Desktop */}
                {index < steps.length - 1 && steps.length <= 3 && (
                  <motion.div
                    className="
                      hidden md:block absolute 
                      top-1/2 right-[-48px] 
                      w-16 h-1 
                      transform -translate-y-1/2
                    "
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "4rem" } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-red-300 to-orange-300 rounded-full"></div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : {}}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    >
                      <ArrowRight className="text-red-500" size={24} />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
          className="flex justify-center mt-20 px-4"
        >
          <NavLink
            to="/login"
            className="
              flex items-center gap-3 
              px-10 py-5 
              bg-gradient-to-r from-red-600 to-orange-600 
              text-white font-semibold text-lg
              rounded-full 
              shadow-lg 
              hover:scale-105 
              transition-transform 
              duration-300
              hover:shadow-xl
              relative overflow-hidden
              group
            "
          >
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              Get Started Now
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 flex items-center"
            >
              <ArrowRight className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.span>

            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: "-100%" }}
              animate={{ x: isInView ? "100%" : "-100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
            ></motion.div>
          </NavLink>
        </motion.div>

        {/* Refresh Button for Manual Data Reload */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="flex justify-center mt-8"
        >
          {/* <button
            onClick={fetchKycData}
            disabled={loading}
            className="
              flex items-center gap-2 
              px-6 py-3 
              bg-white/80 backdrop-blur-sm 
              text-gray-700 font-medium 
              rounded-full 
              shadow-md hover:shadow-lg 
              transition-all duration-200
              hover:bg-white/90
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Refresh Steps
          </button> */}
        </motion.div>
      </div>
    </section>
  );
};

export default ThreeStepProcess;
