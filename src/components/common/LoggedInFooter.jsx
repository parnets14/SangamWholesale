import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { FaFacebookF, FaTwitter } from "react-icons/fa";
import { MdOutlineArticle } from "react-icons/md";
import { Home, Info, Download, ShieldCheck, FileText, RotateCcw } from "lucide-react";
import logo from "../../assets/images/sangamwholesale.png";

const footerLinks = [
  {
    title: "Quick Links",
    items: [
      { label: "Home", to: "/", icon: Home },
      { label: "About Us", to: "/about", icon: Info },
      { label: "Download App", to: "/download", icon: Download },
    ],
  },
  {
    title: "Policies",
    items: [
      { label: "Privacy Policy", to: "/privacy-policy", icon: ShieldCheck },
      { label: "Terms & Conditions", to: "/terms-and-conditions", icon: FileText },
      { label: "Return Policy", to: "/return-policy", icon: RotateCcw },
    ],
  },
  {
    title: "Follow Us",
    items: [
      { label: "Facebook", to: "https://facebook.com", external: true, icon: FaFacebookF },
      { label: "Twitter", to: "https://twitter.com", external: true, icon: FaTwitter },
      { label: "Blog", to: "/blog", icon: MdOutlineArticle },
    ],
  },
];

const LoggedInFooter = () => {
  return (
    <footer style={{ backgroundColor: "#0d1b2a" }} className="text-white">

      {/* Top divider accent */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #702834, #a84455, #702834)" }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="flex flex-col lg:flex-row gap-12 justify-between items-start">

          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center lg:items-start gap-4 lg:max-w-xs"
          >
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-xl flex items-center justify-center border-2"
              style={{ borderColor: "#702834" }}
            >
              <img src={logo} alt="Sangam Wholesale" className="w-full h-full object-cover" />
            </div>

            <div className="text-center lg:text-left">
              <p className="text-white font-bold text-xl tracking-wide">Sangam Wholesale</p>
              <p className="text-sm mt-1" style={{ color: "#b0bec5" }}>
                Your trusted B2B wholesale partner
              </p>
            </div>

            {/* App download badge */}
            <NavLink
              to="/download"
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all border"
              style={{ borderColor: "#702834", backgroundColor: "rgba(112,40,52,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(112,40,52,0.15)")}
            >
              📱 Download the App
            </NavLink>
          </motion.div>

          {/* Links */}
          <div className="flex flex-row flex-wrap gap-12 flex-1 justify-start lg:justify-end">
            {footerLinks.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
                className="min-w-[130px]"
              >
                <p
                  className="font-bold text-xs tracking-widest uppercase mb-4"
                  style={{ color: "#e87a8a" }}
                >
                  {section.title}
                </p>
                <ul className="space-y-3">
                  {section.items.map(({ label, to, external, icon: Icon }, i) => (
                    <li key={i}>
                      {external ? (
                        <a
                          href={to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm transition-colors duration-200"
                          style={{ color: "#d1d9e0" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d9e0")}
                        >
                          {Icon && (
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                              style={{ backgroundColor: "#702834" }}
                            >
                              <Icon />
                            </span>
                          )}
                          {label}
                        </a>
                      ) : (
                        <NavLink
                          to={to}
                          className="flex items-center gap-2 text-sm transition-colors duration-200"
                          style={{ color: "#d1d9e0" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d9e0")}
                        >
                          {Icon && <Icon size={14} className="flex-shrink-0 opacity-70" />}
                          {label}
                        </NavLink>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderColor: "#1a2d3f" }} className="border-t">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: "#b0bec5" }}>
          <p>&copy; {new Date().getFullYear()} Sangam Wholesale. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</NavLink>
            <span style={{ color: "#1a2d3f" }}>|</span>
            <NavLink to="/terms-and-conditions" className="hover:text-white transition-colors duration-200">Terms & Conditions</NavLink>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default LoggedInFooter;
