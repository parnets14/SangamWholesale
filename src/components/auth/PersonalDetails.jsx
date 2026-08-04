import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PersonalDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mobile =
    location.state?.mobile ||
    location.state?.user?.phone ||
    "";
  const token = location.state?.token || "";
  const user = location.state?.user || null;

  // Backend stores name inside user.userDetails.fullName
  const [fullName, setFullName] = useState(user?.userDetails?.fullName || "");
  const [email, setEmail] = useState(user?.userDetails?.email || "");
  const [loading, setLoading] = useState(false);

  // Guard: if no token/mobile, send back to login
  useEffect(() => {
    if (!token || !mobile) {
      toast.error("Session expired. Please login again.");
      navigate("/login", { replace: true });
    }
  }, [token, mobile, navigate]);

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleContinue = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (fullName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!validateEmail(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Backend route: POST /api/user/profile  (createUser)
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      // Build updated user object matching backend structure
      const updatedUser = {
        ...user,
        userDetails: {
          ...(user?.userDetails || {}),
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          isCompleted: true,
        },
      };

      const finalUser = response.ok ? (data.user || updatedUser) : updatedUser;

      navigate("/business-details", {
        state: { mobile, token, user: finalUser },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      const updatedUser = {
        ...user,
        userDetails: {
          ...(user?.userDetails || {}),
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          isCompleted: true,
        },
      };
      navigate("/business-details", {
        state: { mobile, token, user: updatedUser },
      });
    } finally {
      setLoading(false);
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
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: "#702834" }}
          >
            1
          </div>
          <div className="w-12 h-1 rounded" style={{ backgroundColor: "#e5c9ce" }} />
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2"
            style={{ borderColor: "#702834", color: "#702834" }}
          >
            2
          </div>
        </div>

        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "#f9eef0" }}
          >
            <User size={28} style={{ color: "#702834" }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#702834" }}>
            Your Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">Tell us a bit about yourself</p>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span style={{ color: "#702834" }}>*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} style={{ color: "#702834" }} />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyPress={(e) => { if (e.key === "Enter" && !loading) handleContinue(); }}
              disabled={loading}
              placeholder="Enter your full name"
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm transition-all duration-200"
              style={{ borderColor: "#702834" }}
            />
          </div>
        </div>

        {/* Mobile (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} style={{ color: "#702834" }} />
            </div>
            <span className="absolute inset-y-0 left-9 flex items-center text-sm font-medium text-gray-600 pr-1 border-r border-gray-300 pl-1">
              +91
            </span>
            <input
              type="tel"
              value={mobile}
              readOnly
              className="w-full pl-20 pr-4 py-3 rounded-lg border-2 text-sm bg-gray-50 cursor-not-allowed text-gray-700 font-medium"
              style={{ borderColor: "#d1d5db" }}
            />
          </div>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#702834" }}>
            <span>✓</span>
            <span>Verified via OTP</span>
          </p>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email ID <span style={{ color: "#702834" }}>*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} style={{ color: "#702834" }} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => { if (e.key === "Enter" && !loading) handleContinue(); }}
              disabled={loading}
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm transition-all duration-200"
              style={{ borderColor: "#702834" }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Order updates will be sent to this email</p>
        </div>

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
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PersonalDetails;
