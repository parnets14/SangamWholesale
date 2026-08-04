import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { CheckCircle, ShieldCheck, Zap, Star } from "lucide-react";
import toast from "react-hot-toast";

// ─── SET REAL STORE LINKS HERE WHEN APP IS PUBLISHED ───────────────────────
// Replace null with the actual URL string to activate the button
// e.g. "https://play.google.com/store/apps/details?id=com.sangamwholesale"
const GOOGLE_PLAY_URL = null;
const APP_STORE_URL   = null;
// ────────────────────────────────────────────────────────────────────────────

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
    description: "Loved by retailers across India",
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

  const handleStoreClick = (store, url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      const isPlay = store === "Google Play";
      toast.custom(
        () => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #702834",
              borderRadius: "10px",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontFamily: "sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              color: "#111",
              minWidth: "240px",
            }}
          >
            {isPlay
              ? <FaGooglePlay style={{ color: "#702834", fontSize: "20px", flexShrink: 0 }} />
              : <FaApple style={{ color: "#000", fontSize: "20px", flexShrink: 0 }} />
            }
            <span>{store} app coming soon!</span>
          </div>
        ),
        { duration: 3000 }
      );
    }
  };

  return (
    <div className="bg-white min-h-screen mt-20">
      {/* Hero */}
      <div
        className="text-white py-20 px-6 text-center"
        style={{ background: "linear-gradient(135deg, #702834, #4a1220)" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Download the Sangam Wholesale App
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-red-100 max-w-xl mx-auto"
        >
          India's leading B2B wholesale platform — now in your pocket.
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
            <span style={{ color: "#702834" }}>Quick &amp; Easy Buying</span>
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
                className="bg-white p-4 rounded-xl shadow-md border-l-4 hover:shadow-lg transition-all duration-300"
                style={{ borderLeftColor: "#702834" }}
              >
                <div className="flex items-center gap-4">
                  <f.icon
                    className="w-9 h-9 shrink-0"
                    style={{ color: "#702834" }}
                  />
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
              {/* App Store */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStoreClick("App Store", APP_STORE_URL)}
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Download on App Store"
              >
                <FaApple className="text-2xl flex-shrink-0" />
                <span className="text-left">
                  <span className="block text-xs leading-none opacity-75">
                    Download on the
                  </span>
                  <span className="block text-base font-semibold leading-tight mt-0.5">
                    App Store
                  </span>
                </span>
                {!APP_STORE_URL && (
                  <span className="ml-1 text-xs bg-white/20 rounded-full px-2 py-0.5 font-medium">
                    Soon
                  </span>
                )}
              </motion.button>

              {/* Google Play */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStoreClick("Google Play", GOOGLE_PLAY_URL)}
                className="flex items-center gap-3 text-white px-6 py-3 rounded-full shadow-lg transition-colors cursor-pointer"
                style={{ backgroundColor: "#702834" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#5a1f29")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#702834")
                }
                aria-label="Get it on Google Play"
              >
                <FaGooglePlay className="text-2xl flex-shrink-0" />
                <span className="text-left">
                  <span className="block text-xs leading-none opacity-75">
                    Get it on
                  </span>
                  <span className="block text-base font-semibold leading-tight mt-0.5">
                    Google Play
                  </span>
                </span>
                {!GOOGLE_PLAY_URL && (
                  <span className="ml-1 text-xs bg-white/20 rounded-full px-2 py-0.5 font-medium">
                    Soon
                  </span>
                )}
              </motion.button>
            </div>

            {/* Status note */}
            <p className="text-gray-400 text-xs mt-3 flex items-center gap-1">
              <span></span>
              <span>
                {GOOGLE_PLAY_URL || APP_STORE_URL
                  ? "Click a button above to download the app."
                  : "App launching soon — stay tuned for updates!"}
              </span>
            </p>
          </motion.div>
        </div>

        {/* Right: Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0 flex justify-center"
        >
          <div
            className="relative rounded-full w-64 h-64 md:w-80 md:h-80 flex items-center justify-center shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: "#f9eef0" }}
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
      </section>
    </div>
  );
}
