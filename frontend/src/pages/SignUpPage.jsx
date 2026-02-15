import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { toast } from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signUp, isSigningUp, authUser } = useAuthStore();

  if (authUser) return <Navigate to="/" />;

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      signUp(formData);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-black transition-colors duration-500">
      {/* Left Side - Form Section */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-3 group">
              <div className="size-14 rounded-[1.25rem] bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center 
              group-hover:scale-105 transition-all duration-300 shadow-sm">
                <MessageSquare className="size-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h1 className="text-3xl font-extrabold mt-4 tracking-tight text-gray-900 dark:text-white">
                Create Account
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Join the NexTalk community</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 ml-1 tracking-wider uppercase">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <User className="size-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl 
                  text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all 
                  placeholder:text-gray-400 dark:text-white"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 ml-1 tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="size-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl 
                  text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all 
                  placeholder:text-gray-400 dark:text-white"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 ml-1 tracking-wider uppercase">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="size-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl 
                  text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all 
                  placeholder:text-gray-400 dark:text-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:opacity-70 transition-opacity"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-gray-400" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-5 text-gray-400" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 ml-1 tracking-wider uppercase">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="size-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" strokeWidth={1.5} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl 
                  text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all 
                  placeholder:text-gray-400 dark:text-white"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:opacity-70 transition-opacity"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5 text-gray-400" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-5 text-gray-400" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 mt-6 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-semibold 
              rounded-2xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 decoration-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;