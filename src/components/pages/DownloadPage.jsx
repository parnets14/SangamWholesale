import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { CheckCircle, ShieldCheck, Zap, Star } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Best Offers",
    description: "Exclusive deals and discounts only on the app",
  },
  {
    icon: ShieldCheck,
    title: "Safe Payments",
    description: "100% secure and encrypted transactions",
  },
  {
    icon: Zap,
    title: "Fast Ordering",
    description: "Order in seconds with a smooth, intuitive experience",
  },
  {
    icon: Star,
    title: "Trusted by Thousands",
    description: "Loved by retailers, schools, and libraries across India",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 14, stiffness: 100 },
  },
};

export default function DownloadPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="bg-white min-h-screen mt-16">
      {/* Hero */}
      <div className="text-white py-20 px-6 text-center" style={{ background: 'linear-gradient(135deg, #F44400, #d63a00)' }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Download the uBook App
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-red-100 max-w-xl mx-auto"
        >
          India's leading B2B book distribution platform — now in your pocket.
        </motion.p>
      </div>

      {/* Main Content */}
      <section
        ref={ref}
        className="max-w-5xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-12"
      >
        {/* Left: Features + Buttons */}
        <div className="flex-1 space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 leading-snug"
          >
            A Powerful App for{" "}
            <span className="text-red-500">Quick &amp; Easy Buying</span>
          </motion.h2>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="space-y-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <f.icon className="w-9 h-9 text-red-500 shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {f.title}
                    </h3>
                    <p className="text-gray-500 text-sm">{f.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Download Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-4"
          >
            <p className="text-gray-600 font-medium mb-4 text-sm uppercase tracking-wide">
              Available on
            </p>
            <div className="flex flex-wrap gap-4">
              {/* Replace href with real store links when available */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition transform hover:scale-105 shadow-lg"
                aria-label="Download on App Store"
              >
                <FaApple className="text-2xl" />
                <span>
                  <span className="block text-xs leading-none opacity-75">
                    Download on the
                  </span>
                  App Store
                </span>
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-full transition transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#702834' }}
                aria-label="Get it on Google Play"
              >
                <FaGooglePlay className="text-2xl" />
                <span>
                  <span className="block text-xs leading-none opacity-75">
                    Get it on
                  </span>
                  Google Play
                </span>
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              App coming soon — stay tuned!
            </p>
          </motion.div>
        </div>

        {/* Right: Video / Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0 flex justify-center"
        >
          <div className="relative bg-red-100 rounded-full w-64 h-64 md:w-80 md:h-80 flex items-center justify-center shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
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
      </section>
    </div>
  );
}
