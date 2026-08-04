import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Agar already logged in hai toh Home bhejo
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/Home", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 120,
      },
    },
  };

  const handleMobileLogin = async () => {
    if (mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
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
        navigate("/otp", { state: { mobile } });
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && mobile.length === 10 && !loading) {
      handleMobileLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <Phone className="mx-auto mb-4" size={48} style={{ color: '#702834' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#702834' }}>Mobile Login</h2>
          <p className="text-gray-600 mt-2">
            Enter your 10 digit mobile number to continue
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={20} style={{ color: '#702834' }} />
            </div>
            <input
              type="tel"
              maxLength="10"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              onKeyPress={handleKeyPress}
              placeholder="Enter mobile number"
              disabled={loading}
              className={`
                w-full pl-10 pr-4 py-3 
                rounded-lg border-2
                focus:outline-none focus:ring-2
                text-lg transition-all duration-200
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              style={{ borderColor: '#702834' }}
            />
          </div>

          <motion.button
            whileHover={!loading && mobile.length === 10 ? { scale: 1.05 } : {}}
            whileTap={!loading && mobile.length === 10 ? { scale: 0.95 } : {}}
            onClick={handleMobileLogin}
            disabled={mobile.length !== 10 || loading}
            className={`
              w-full py-3 rounded-lg text-white font-semibold 
              flex items-center justify-center space-x-2
              transition-all duration-300
              ${mobile.length !== 10 || loading ? "bg-gray-300 cursor-not-allowed" : ""}
            `}
            style={mobile.length === 10 && !loading ? { backgroundColor: '#702834' } : {}}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Get OTP</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500">
            <p>We'll send a verification code to your mobile number</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
