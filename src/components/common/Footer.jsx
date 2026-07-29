
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/Udaanlogo.png";
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
          className="flex-shrink-0"
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold">
            <img
              src={logo}
              alt="Udaan Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
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
