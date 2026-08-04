import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const mobile = location.state?.mobile;

  // Already logged in → Home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/Home", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Mobile missing → Login
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !mobile) {
      navigate("/login", { replace: true });
    }
  }, [mobile, authLoading, isAuthenticated, navigate]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    if (!mobile) {
      toast.error("Mobile number is missing");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mobile, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = data.user;   // { _id, phone, userDetails, businessDetails }
        const authToken = data.token;

        // Backend stores name inside userDetails.fullName
        // and business inside businessDetails.businessName
        const hasPersonalDetails =
          userData?.userDetails?.fullName &&
          userData.userDetails.fullName.trim() !== "";

        const hasBusinessDetails =
          userData?.businessDetails?.businessName &&
          userData.businessDetails.businessName.trim() !== "";

        if (hasPersonalDetails && hasBusinessDetails) {
          // ✅ Returning user — login directly
          login(userData, authToken);
          toast.success("Welcome back!");
          navigate("/Home", { replace: true });
        } else if (hasPersonalDetails && !hasBusinessDetails) {
          // Personal done, business missing
          toast.success("OTP verified! Please complete business details.");
          navigate("/business-details", {
            state: { mobile, token: authToken, user: userData },
            replace: true,
          });
        } else {
          // ❌ New user — full registration flow
          toast.success("OTP verified! Please complete your profile.");
          navigate("/personal-details", {
            state: { mobile, token: authToken, user: userData },
            replace: true,
          });
        }
      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!mobile) return;
    setLoading(true);
    try {
      const response = await fetch("https://sangamwholesale.com/api/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mobile }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("OTP resent successfully!");
        setOtp("");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mobile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2" style={{ color: "#702834" }}>
            Verify OTP
          </h2>
          <p className="text-sm text-gray-700">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-medium" style={{ color: "#702834" }}>
              +91-{mobile}
            </span>
          </p>
        </div>

        <div className="mb-6">
          <input
            type="tel"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyPress={(e) => {
              if (e.key === "Enter" && otp.length === 6 && !loading) handleVerifyOtp();
            }}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-md border-2 focus:outline-none focus:ring-2 text-center text-lg tracking-widest transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ borderColor: "#702834" }}
            placeholder="Enter 6-digit OTP"
          />
        </div>

        <motion.button
          whileHover={!loading && otp.length === 6 ? { scale: 1.02 } : {}}
          whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition-all duration-300 mb-4 ${
            otp.length !== 6 || loading ? "bg-gray-300 cursor-not-allowed" : ""
          }`}
          style={otp.length === 6 && !loading ? { backgroundColor: "#702834" } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify & Continue"
          )}
        </motion.button>

        <div className="text-center">
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className={`text-sm font-medium transition-colors duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ color: "#702834" }}
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
