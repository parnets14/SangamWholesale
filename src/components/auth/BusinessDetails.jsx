import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, FileText, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const BusinessDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const mobile = location.state?.mobile || "";
  const token = location.state?.token || "";
  const user = location.state?.user || null;

  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [gst, setGst] = useState(user?.gst || "");
  const [loading, setLoading] = useState(false);

  const validateGST = (value) => {
    if (!value) return true; // GST is optional
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value.toUpperCase());
  };

  const handleContinue = async () => {
    if (!businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    if (gst && !validateGST(gst)) {
      toast.error("Please enter a valid GST number (e.g. 22AAAAA0000A1Z5)");
      return;
    }

    setLoading(true);

    const updatedUser = {
      ...user,
      businessName: businessName.trim(),
      gst: gst.trim().toUpperCase() || null,
    };

    try {
      const response = await fetch("/api/user/update-business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: businessName.trim(),
          gst: gst.trim().toUpperCase() || undefined,
        }),
      });

      const data = await response.json();

      const finalUser = response.ok ? (data.user || updatedUser) : updatedUser;

      // Store auth and go to Home
      login(finalUser, token);
      toast.success("Welcome to Sangam Wholesale!");
      navigate("/Home", { replace: true });
    } catch (error) {
      console.error("Error updating business:", error);
      // Still proceed even on network error
      login(updatedUser, token);
      toast.success("Welcome to Sangam Wholesale!");
      navigate("/Home", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 pt-24 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: "#702834" }}
          >
            ✓
          </div>
          <div
            className="w-12 h-1 rounded"
            style={{ backgroundColor: "#702834" }}
          ></div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: "#702834" }}
          >
            2
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "#f9eef0" }}
          >
            <Briefcase size={28} style={{ color: "#702834" }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#702834" }}>
            Business Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tell us about your business
          </p>
        </div>

        {/* Business Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name <span style={{ color: "#702834" }}>*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase size={18} style={{ color: "#702834" }} />
            </div>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Enter your business name"
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm transition-all duration-200"
              style={{ borderColor: "#702834" }}
            />
          </div>
        </div>

        {/* GST Number (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST Number{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={18} style={{ color: "#702834" }} />
            </div>
            <input
              type="text"
              value={gst}
              onChange={(e) => setGst(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              maxLength={15}
              placeholder="e.g. 22AAAAA0000A1Z5"
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm tracking-wider transition-all duration-200"
              style={{ borderColor: "#d1d5db" }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            15-digit GST Identification Number (optional)
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300"
          style={{ backgroundColor: loading ? "#d1d5db" : "#702834" }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Setting up...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can update these details later from your profile
        </p>
      </motion.div>
    </div>
  );
};

export default BusinessDetails;
