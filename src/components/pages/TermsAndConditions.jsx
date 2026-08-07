import { motion } from "framer-motion";
import { FileText, ShoppingBag, Truck, CreditCard, AlertCircle, Scale, Mail } from "lucide-react";

const sections = [
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Use of Platform",
    content: [
      {
        heading: "Eligibility",
        text: "Sangam Wholesale is exclusively for registered business owners, retailers, and wholesalers. By registering, you confirm that you are operating a legitimate business entity.",
      },
      {
        heading: "Account Responsibility",
        text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      },
      {
        heading: "Accurate Information",
        text: "You agree to provide accurate, current, and complete information during registration including your business name, address, and GSTIN where applicable.",
      },
    ],
  },
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Orders & Pricing",
    content: [
      {
        heading: "Order Placement",
        text: "All orders placed on Sangam Wholesale are subject to product availability. We reserve the right to cancel or modify any order if the product is out of stock or if pricing errors are detected.",
      },
      {
        heading: "Pricing",
        text: "Prices listed on the platform are wholesale prices exclusive of GST unless stated otherwise. Final invoice amounts will include applicable taxes as per government regulations.",
      },
      {
        heading: "Minimum Order Quantity",
        text: "Certain products may have a minimum order quantity (MOQ). These will be clearly indicated on the product listing page.",
      },
    ],
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Delivery & Shipping",
    content: [
      {
        heading: "Delivery Timeline",
        text: "Estimated delivery timelines are mentioned on each product page. Actual delivery may vary due to logistics conditions, public holidays, or unforeseen circumstances.",
      },
      {
        heading: "Delivery Address",
        text: "It is your responsibility to provide an accurate delivery address. Sangam Wholesale is not liable for orders delivered to incorrect addresses provided by the buyer.",
      },
      {
        heading: "Undelivered Orders",
        text: "If an order cannot be delivered due to an incorrect address or unavailability of recipient, it may be returned to origin (RTO). Re-delivery charges may apply.",
      },
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Payments & Refunds",
    content: [
      {
        heading: "Payment Methods",
        text: "We accept payments via UPI, net banking, debit/credit cards, and other available payment gateways. All transactions are secured and encrypted.",
      },
      {
        heading: "Refund Policy",
        text: "Refunds are processed for damaged, defective, or incorrectly delivered products. Refund requests must be raised within 48 hours of delivery with supporting evidence.",
      },
      {
        heading: "Refund Timeline",
        text: "Approved refunds will be credited to your original payment method within 5–7 business days after verification.",
      },
    ],
  },
  {
    icon: <AlertCircle className="w-5 h-5" />,
    title: "Prohibited Activities",
    content: [
      {
        heading: "Misuse of Platform",
        text: "You may not use the platform for any unlawful purpose, including but not limited to reselling counterfeit goods, fraudulent transactions, or any activity that violates applicable laws.",
      },
      {
        heading: "Account Sharing",
        text: "Sharing your account credentials with unauthorized persons is strictly prohibited. Each account is intended for a single registered business.",
      },
      {
        heading: "Interference",
        text: "You may not attempt to interfere with, compromise, or disrupt the platform's systems, servers, or networks in any manner.",
      },
    ],
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "Limitation of Liability",
    content: [
      {
        heading: "Platform Availability",
        text: "Sangam Wholesale is provided on an 'as is' basis. We do not guarantee uninterrupted or error-free access to the platform at all times.",
      },
      {
        heading: "Indirect Damages",
        text: "Sangam Wholesale shall not be liable for any indirect, incidental, or consequential damages arising out of or related to your use of the platform.",
      },
      {
        heading: "Third-Party Services",
        text: "We are not responsible for the actions, content, or services of third-party logistics partners, payment processors, or other service providers integrated with our platform.",
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

const TermsAndConditions = () => {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Terms & Conditions
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base">
            Please read these terms carefully before using the Sangam Wholesale
            platform. By accessing our services, you agree to be bound by these terms.
          </p>
          <p className="mt-4 text-white/60 text-xs">
            Last updated: January 1, 2025
          </p>
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
            These Terms & Conditions govern your use of the Sangam Wholesale
            platform, including our website and mobile applications. By creating
            an account or placing an order, you acknowledge that you have read,
            understood, and agree to be bound by these terms. If you do not
            agree, please discontinue use of our platform.
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
              {/* Section Header */}
              <div className="flex items-center gap-3 px-6 py-4 bg-[#702834]/5 border-b border-gray-100">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#702834] text-white flex-shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-base md:text-lg font-bold text-gray-800">
                  {section.title}
                </h2>
              </div>

              {/* Section Body */}
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

        {/* Governing Law */}
        <motion.div
          custom={sections.length}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5"
        >
          <h2 className="text-base font-bold text-gray-800 mb-2">
            Governing Law
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            These Terms & Conditions shall be governed by and construed in
            accordance with the laws of India. Any disputes arising out of or in
            connection with these terms shall be subject to the exclusive
            jurisdiction of the courts in Maharashtra, India.
          </p>
        </motion.div>

        {/* Changes Note */}
        <motion.div
          custom={sections.length + 1}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5"
        >
          <h2 className="text-base font-bold text-gray-800 mb-2">
            Changes to These Terms
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sangam Wholesale reserves the right to modify these Terms &
            Conditions at any time. Continued use of the platform after any
            changes constitutes your acceptance of the revised terms. We
            recommend reviewing this page periodically.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          custom={sections.length + 2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 bg-[#702834] text-white rounded-2xl px-6 py-6"
        >
          <h2 className="text-base font-bold mb-3">Contact Us</h2>
          <p className="text-white/80 text-sm mb-4">
            If you have any questions about these Terms & Conditions, please
            reach out to us:
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

export default TermsAndConditions;
