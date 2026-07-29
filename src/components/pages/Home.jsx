import { motion } from "framer-motion";

import HeroSection from "../home/HeroSection";
import CategoryPage from "../rr/CategoryPage";


// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const HomePage = () => {
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
      </motion.section>
<CategoryPage />
    </div>
  );
};

export default HomePage;
