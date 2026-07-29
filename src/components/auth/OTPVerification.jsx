import React, { useState } from "react";
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
  const { login } = useAuth();
  const mobile = location.state?.mobile;

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
      const response = await fetch(
        "/api/user/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: mobile,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Store user data and token in AuthContext
        login(data.user, data.token);

        toast.success("Login successful!");

        // Navigate to home page
        // navigate("/Home");
        navigate("/Home", { replace: true });
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && otp.length === 6 && !loading) {
      handleVerifyOtp();
    }
  };

  const handleResendOTP = async () => {
    if (!mobile) {
      toast.error("Mobile number is missing");

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://sangamwholesale.com/api/user/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: mobile,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.otp}'OTP sent successfully!'`);
        setOtp("");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/login");
  };

  if (!mobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Mobile number missing. Please go back.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-green-700 mb-2">Verify OTP</h2>
          <p className="text-sm text-gray-700">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-medium text-green-700">+91-{mobile}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <input
            type="tel"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className={`
              w-full px-4 py-3 border border-green-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-green-500 
              text-center text-lg tracking-widest transition-all duration-200
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
            placeholder="123456"
          />
        </div>

        {/* Verify Button */}
        <motion.button
          whileHover={!loading && otp.length === 6 ? { scale: 1.02 } : {}}
          whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || loading}
          className={`
            w-full py-3 rounded-md text-white font-semibold 
            transition-all duration-300 mb-4
            ${
              otp.length === 6 && !loading
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
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

        {/* Resend OTP */}
        <div className="text-center">
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className={`
              text-sm text-green-600 hover:text-green-700 
              transition-colors duration-200
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
