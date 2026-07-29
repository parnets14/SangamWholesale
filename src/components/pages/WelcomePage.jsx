import { motion } from "framer-motion";

import HeroSection from "../home/HeroSection";
import CategoriesPage from "../home/CategoriesPage";
import AppDownloadSection from "../home/AppDownloadSection";
import ThreeStepProcess from "../home/ThreeStepProcess";
import He from "../home/He";
import StatsSection from "../home/StatsSection";
import MobileAppSection from "../home/MobileAppSection";
// import TopBrandsSection from "../home/TopBrandsSection";
import TestimonialSection from "../home/testimonials";
import CategoryPage from "../rr/CategoryPage";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const WelcomePage = () => {
  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <HeroSection />
      </motion.section>

      {/* Categories */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* <CategoriesPage /> */}
        <CategoryPage />
      </motion.section>

      {/* Three Step Process */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ThreeStepProcess />
      </motion.section>

      {/* He Section */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <He />
      </motion.section>

      {/* Stats */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <StatsSection />
      </motion.section>

      {/* Mobile App Promo */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <MobileAppSection />
      </motion.section>

      {/* Top Brands
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <TopBrandsSection />
      </motion.section> */}

      {/* Testimonials */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <TestimonialSection />
      </motion.section>

      {/* App Download */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <AppDownloadSection />
      </motion.section>
    </div>
  );
};

export default WelcomePage;
