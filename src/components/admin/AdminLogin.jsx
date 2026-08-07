import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import toast from "react-hot-toast";
import { MdLock, MdEmail } from "react-icons/md";
import logo from "../../assets/images/sangamwholesale.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sangam Wholesale - Admin";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Login successful");
        navigate("/admin/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f1f5f9" }}>
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Top accent */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #702834, #a84455, #702834)" }} />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-md border-2 mb-3 flex items-center justify-center" style={{ borderColor: "#702834" }}>
                <img src={logo} alt="Sangam Wholesale" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Login</h1>
              <p className="text-sm text-gray-500 mt-1">Sangam Wholesale Panel</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="email"
                    placeholder="admin@sangamwholesale.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": "#702834" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-colors mt-2"
                style={{ backgroundColor: isLoading ? "#a84455" : "#702834" }}
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#5a1f29"; }}
                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#702834"; }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Sangam Wholesale. All rights reserved.
        </p>
      </div>
    </div>
  );
}
