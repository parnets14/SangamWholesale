import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FaApple } from 'react-icons/fa';           
import { SiGoogleplay } from 'react-icons/si';     
import { NavLink } from 'react-router-dom';

const AppDownloadSection = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 px-4 sm:px-8 md:px-16 lg:px-24 overflow-hidden">
      <motion.div
        className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Left content */}
        <motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
            animate={{ 
              textShadow: ["0 0 0px rgba(255,255,255,0.3)", "0 0 10px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0.3)"] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Download <span className="text-red-200">Ubook</span> App Now!
          </motion.h2>
          
          <motion.p 
            className="mt-4 text-xl max-w-xl mx-auto md:mx-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Khole Munafe Ka Shutter
          </motion.p>

          {/* App download buttons */}
          <motion.div 
            className="flex flex-wrap justify-center md:justify-start gap-6 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.a
              href="https://apps.apple.com/app/idYOUR_APP_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-white/20 hover:border-white/50 transition-all"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(0,0,0,0.4)',
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)' // red-600 glow
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FaApple className="text-3xl" />
              <div className="text-left">
                <p className="text-xs opacity-80">Download on the</p>
                <p className="text-xl font-semibold">App Store</p>
              </div>
            </motion.a>

            <motion.a
              href="https://play.google.com/store/apps/details?id=YOUR_APP_PACKAGE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-white/20 hover:border-white/50 transition-all"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(0,0,0,0.4)',
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)' // red-600 glow
              }}
              whileTap={{ scale: 0.95 }}
            >
              <SiGoogleplay className="text-3xl" />
              <div className="text-left">
                <p className="text-xs opacity-80">GET IT ON</p>
                <p className="text-xl font-semibold">Google Play</p>
              </div>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Register button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 1,
            type: "spring", 
            stiffness: 300 
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <NavLink
            to="/register"
            className="bg-white text-red-600 font-bold text-lg px-8 py-4 rounded-xl shadow-lg flex items-center gap-2 hover:bg-red-50 transition-all hover:shadow-xl hover:shadow-red-300/30"
          >
            Register Now 
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight size={20} />
            </motion.span>
          </NavLink>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AppDownloadSection;
