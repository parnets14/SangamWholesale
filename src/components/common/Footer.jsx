
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/sangamwholesale.png";
const footerLinks = [
  {
    title: "Help",
    items: [
      { label: "Careers", to: "/careers" },
      { label: "About Us", to: "/about-us" },
      { label: "News Room", to: "/news-room" },
      { label: "Contact Us", to: "/contact-us" },
      { label: "Regulatory", to: "/regulatory" },
    ],
  },
  {
    title: "Terms",
    items: [
      { label: "Terms of Use", to: "/terms-of-use" },
      { label: "Privacy Policy", to: "/privacy-policy" },
      {
        label: "Anti Counterfeiting Policy",
        to: "/anti-counterfeiting-policy",
      },
    ],
  },
  {
    title: "Policies",
    items: [
      { label: "Returns Policy", to: "/returns-policy" },
      {
        label: "Undelivered Shipment (RTO) Policy",
        to: "/undelivered-shipment-policy",
      },
    ],
  },
  {
    title: "Social",
    items: [
      { label: "Facebook", to: "https://facebook.com", external: true },
      { label: "Twitter", to: "https://twitter.com", external: true },
      { label: "Blog", to: "/blog" },
    ],
  },
];

const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-900 text-white py-24 px-6 md:px-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col md:flex-row gap-10 justify-between">
        {/* Logo Section */}
        <motion.div
          className="flex-shrink-0 flex flex-col items-center"
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg border border-gray-700">
            <img
              src={logo}
              alt="Sangam Wholesale"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-3 text-white font-bold text-lg text-center">Sangam Wholesale</p>
        </motion.div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-sm w-full">
          {footerLinks.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
            >
              <p className="font-semibold mb-2">{section.title}</p>
              <ul className="space-y-1">
                {section.items.map(({ label, to, external }, i) => (
                  <li key={i}>
                    {external ? (
                      <a
                        href={to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-300 transition duration-200 cursor-pointer"
                      >
                        {label}
                      </a>
                    ) : (
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          `hover:text-gray-300 transition duration-200 cursor-pointer ${
                            isActive ? "text-green-950font-semibold" : ""
                          }`
                        }
                      >
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
    </motion.footer>
  );
};

export default Footer;
