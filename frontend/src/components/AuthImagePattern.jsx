import React from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] p-12 transition-colors duration-500">
      <div className="max-w-md text-center">
        {/* iOS-style Grid Pattern */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm 
              ${i % 2 === 0 ? "animate-pulse" : "opacity-60"} transition-all duration-700`}
            />
          ))}
        </div>

        {/* Typography */}
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed px-4">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthImagePattern;