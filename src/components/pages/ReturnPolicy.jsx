import { motion } from "framer-motion";
import { RefreshCw, PackageCheck, Clock, CreditCard, AlertTriangle, Mail } from "lucide-react";

const sections = [
  {
    icon: <PackageCheck className="w-5 h-5" />,
    title: "Eligible Returns",
    content: [
      {
        heading: "Damaged or Defective Products",
        text: "If you receive a product that is damaged, defective, or broken, you are eligible for a full return or replacement. Evidence such as photos or videos must be shared within 48 hours of delivery.",
      },
      {
        heading: "Wrong Product Delivered",
        text: "If the product delivered does not match your order (wrong item, wrong size, or wrong quantity), you are entitled to a return or exchange at no additional cost.",
      },
      {
        heading: "Expired Products",
        text: "Products delivered with an expired or near-expiry date (less than 30% shelf life remaining) are eligible for return. Please raise the request immediately upon receipt.",
      },
    ],
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Return Window & Process",
    content: [
      {
        heading: "48-Hour Return Window",
        text: "All return requests must be raised within 48 hours of delivery. Requests raised after this window may not be accepted except in exceptional circumstances.",
      },
      {
        heading: "How to Raise a Return",
        text: "Log in to your Sangam Wholesale account, go to 'My Orders', select the relevant order, and tap 'Request Return'. Attach supporting images or videos as evidence.",
      },
      {
        heading: "Pickup Arrangement",
        text: "Once your return is approved, our logistics partner will arrange a pickup from your registered delivery address within 2–3 business days.",
      },
    ],
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Non-Returnable Items",
    content: [
      {
        heading: "Perishable Goods",
        text: "Fresh produce, dairy, and other perishable items cannot be returned once delivered unless they arrive in a damaged or spoiled condition.",
      },
      {
        heading: "Opened Packaging",
        text: "Products with tampered, opened, or broken seals — unless defective — are not eligible for return.",
      },
      {
        heading: "Change of Mind",
        text: "Returns are not accepted for change of mind, ordering the wrong product, or price-related reasons. Please verify your cart before placing an order.",
      },
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Refunds",
    content: [
      {
        heading: "Refund Method",
        text: "Approved refunds will be credited back to your original payment method — UPI, bank account, or wallet — depending on how the order was paid.",
      },
      {
        heading: "Refund Timeline",
        text: "Once the return pickup is completed and verified, refunds are processed within 5–7 business days. You will receive a confirmation notification.",
      },
      {
        heading: "Partial Refunds",
        text: "In cases where only part of an order is returned, a proportional refund will be issued for the returned items only.",
      },
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Return Rejection",
    content: [
      {
        heading: "Insufficient Evidence",
        text: "Return requests without adequate supporting evidence (photos/videos) may be rejected. Ensure clear media is provided at the time of raising the request.",
      },
      {
        heading: "Misuse of Return Policy",
        text: "Sangam Wholesale reserves the right to reject returns if fraudulent or repetitive misuse of the return policy is detected. Accounts with repeated abuse may be suspended.",
      },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-[#702834] text-white py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Return Policy</h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base">
            We want you to be completely satisfied with every order. Here's everything you need to know about returns and refunds.
          </p>
          <p className="mt-4 text-white/60 text-xs">Last updated: January 1, 2025</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm"
        >
          <p className="text-gray-700 leading-relaxed text-sm md:text-base">
            At Sangam Wholesale, we strive to deliver quality products on time. In the rare event that something goes wrong, our return policy is designed to make the process simple and fair. Please read this policy carefully before raising a return request.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 bg-[#702834]/5 border-b border-gray-100">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#702834] text-white flex-shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-base md:text-lg font-bold text-gray-800">
                  {section.title}
                </h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                {section.content.map((item, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-semibold text-[#702834] mb-1">
                      {item.heading}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div
          custom={sections.length}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 bg-[#702834] text-white rounded-2xl px-6 py-6"
        >
          <h2 className="text-base font-bold mb-3">Need Help with a Return?</h2>
          <p className="text-white/80 text-sm mb-4">
            If you face any issues raising a return or have questions about your refund status, reach out to our support team.
          </p>
          <a
            href="mailto:sales@sangamwholesale.com"
            className="flex items-center gap-2 text-white/90 hover:text-white text-sm transition-colors"
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            sales@sangamwholesale.com
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
