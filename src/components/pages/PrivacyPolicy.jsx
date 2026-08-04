import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Bell, Mail, Phone } from "lucide-react";

const sections = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Information We Collect",
    content: [
      {
        heading: "Personal Information",
        text: "When you register on Sangam Wholesale, we collect your name, mobile number, shop name, pincode, email address, and business details including GSTIN or Shop & Establishment Licence.",
      },
      {
        heading: "Transaction Information",
        text: "We collect data related to your orders, payment history, delivery addresses, and purchase behaviour to provide a seamless shopping experience.",
      },
      {
        heading: "Device & Usage Information",
        text: "We automatically collect information about your device, browser, IP address, and how you interact with our platform to improve our services.",
      },
    ],
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "How We Use Your Information",
    content: [
      {
        heading: "Order Processing",
        text: "Your information is used to process orders, manage deliveries, handle returns, and send order-related notifications.",
      },
      {
        heading: "Account Management",
        text: "We use your data to manage your account, verify your KYC documents, and maintain your business profile on our platform.",
      },
      {
        heading: "Platform Improvement",
        text: "Usage data helps us understand user behaviour, fix issues, and improve the overall platform experience for all wholesalers.",
      },
      {
        heading: "Marketing & Communication",
        text: "With your consent, we may send promotional offers, new product notifications, and platform updates via SMS, email, or app notifications.",
      },
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Data Security",
    content: [
      {
        heading: "Encryption",
        text: "All sensitive data including payment information and personal details are encrypted using industry-standard SSL/TLS protocols during transmission.",
      },
      {
        heading: "Access Controls",
        text: "We implement strict access controls ensuring only authorised personnel can access user data, and only when necessary to provide our services.",
      },
      {
        heading: "Data Storage",
        text: "Your data is stored on secure servers located in India, complying with applicable Indian data protection laws and regulations.",
      },
    ],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Sharing of Information",
    content: [
      {
        heading: "Third-Party Partners",
        text: "We share necessary information with our logistics partners, payment processors, and technology service providers solely to fulfil your orders and provide our services.",
      },
      {
        heading: "Legal Requirements",
        text: "We may disclose your information if required by law, court order, or government authority, or to protect the rights and safety of Sangam Wholesale and its users.",
      },
      {
        heading: "No Sale of Data",
        text: "We do not sell, rent, or trade your personal information to any third party for their marketing purposes under any circumstances.",
      },
    ],
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Your Rights & Choices",
    content: [
      {
        heading: "Access & Correction",
        text: "You have the right to access, review, and update your personal information at any time through your account settings on our platform.",
      },
      {
        heading: "Data Deletion",
        text: "You may request deletion of your account and associated personal data by contacting our support team. Some data may be retained as required by law.",
      },
      {
        heading: "Opt-Out",
        text: "You can opt out of marketing communications at any time by updating your notification preferences in your account or by contacting us directly.",
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

const PrivacyPolicy = () => {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base">
            We value your trust. This policy explains how Sangam Wholesale
            collects, uses, and protects your personal information.
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
            This Privacy Policy applies to all users of the Sangam Wholesale
            platform, including our website and mobile applications. By using our
            services, you agree to the collection and use of information in
            accordance with this policy. Please read it carefully before using
            our platform.
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

        {/* Cookies Note */}
        <motion.div
          custom={sections.length}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5"
        >
          <h2 className="text-base font-bold text-gray-800 mb-2">
            Cookies & Tracking
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We use cookies and similar tracking technologies to enhance your
            experience on our platform, remember your preferences, and analyse
            traffic patterns. You can control cookie settings through your
            browser. Disabling cookies may affect certain features of our
            platform.
          </p>
        </motion.div>

        {/* Changes Note */}
        <motion.div
          custom={sections.length + 1}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5"
        >
          <h2 className="text-base font-bold text-gray-800 mb-2">
            Changes to This Policy
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of any significant changes by posting the new policy on this
            page and updating the "Last updated" date. We encourage you to
            review this policy periodically.
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
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or the handling of your data, please reach out to us:
          </p>
          <div className="space-y-2">
            <a
              href="mailto:support@sangamwholesale.com"
              className="flex items-center gap-2 text-white/90 hover:text-white text-sm transition-colors"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
             sales@sagamwholesale@gmail.com  
            </a>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
