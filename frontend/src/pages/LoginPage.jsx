import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { logIn, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    logIn(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-black transition-colors duration-500">
      {/* Left Side - Form Section */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-16">
        <div className="w-full max-w-sm space-y-10">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-3 group">
              <div className="size-14 rounded-[1.25rem] bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center 
              group-hover:scale-105 transition-all duration-300 shadow-sm">
                <MessageSquare className="size-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h1 className="text-3xl font-extrabold mt-4 tracking-tight text-gray-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Sign in to NexTalk</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 ml-1 tracking-wide uppercase">
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
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 ml-1 tracking-wide uppercase">
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

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-semibold 
              rounded-2xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              New here?{" "}
              <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 decoration-2">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title="Welcome back!"
        subtitle="Sign in to continue your conversations and catch up with your messages."
      />
    </div>
  );
};

export default LoginPage;