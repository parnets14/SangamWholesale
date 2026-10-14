
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaApple } from "react-icons/fa";
import { CheckCircle, ShieldCheck, Zap, Star } from 'lucide-react';

const BRAND = '#702834';
const BRAND_DARK = '#5a1f29';

const MobileAppSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const features = [
    {
      icon: CheckCircle,
      title: "Best Offers",
      description: "Exclusive deals and discounts only on the app"
    },
    {
      icon: ShieldCheck,
      title: "Safe Payments",
      description: "100% secure and encrypted transactions"
    },
    {
      icon: Zap,
      title: "Fast Ordering",
      description: "Order in seconds with a smooth, intuitive experience"
    },
    {
      icon: Star,
      title: "Trusted by Thousands",
      description: "Loved by retailers across India"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 110
      }
    }
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden py-16 md:py-24 px-6 md:px-16"
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fdf6f7 100%)' }}
    >
      {/* Soft brand glow */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: '#f3dde1' }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: '#eef7f1' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">

        {/* Left Side Content */}
        <div className="w-full lg:max-w-xl">
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs md:text-sm font-semibold tracking-[0.18em] uppercase mb-5"
            style={{ color: BRAND }}
          >
            Sangam Wholesale App
          </motion.span>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8"
          >
            A Powerful Mobile App for
            <br />
            <span style={{ color: BRAND }}>Quick &amp; Easy Buying</span>
          </motion.h2>

          {/* Feature Grid — 2x2 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 border-l-4 transition-all duration-300"
                style={{ borderLeftColor: BRAND }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: '#f9eef0' }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: BRAND }} />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Download Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-10"
          >
            <p className="text-gray-500 font-semibold mb-4 text-xs uppercase tracking-[0.18em]">
              Download Our App
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://apps.apple.com/us/app/sangam-wholesale/id6797504951"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition transform hover:scale-105 shadow-lg"
              >
                <FaApple className="text-2xl" />
                <span className="text-left">
                  <span className="block text-[10px] leading-none opacity-75">Download on the</span>
                  <span className="block text-base font-semibold leading-tight mt-0.5">App Store</span>
                </span>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.sangamwholesale"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white px-6 py-3 rounded-full transition transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: BRAND }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
              >
                <img
                  src="/google-play.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-7 w-7 object-contain flex-shrink-0"
                />
                <span className="text-left">
                  <span className="block text-[10px] leading-none opacity-75">Get it on</span>
                  <span className="block text-base font-semibold leading-tight mt-0.5">Google Play</span>
                </span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Side Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-md flex justify-center flex-shrink-0"
        >
          <div
            className="relative rounded-full w-64 h-64 md:w-96 md:h-96 flex items-center justify-center shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: '#e8f3ec' }}
          >
            <video
              src="/m1.mp4"
              className="w-full h-full object-cover rounded-full"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default MobileAppSection;
