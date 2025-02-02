"use client";

import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="relative group">
      {/* Tooltip */}
      <div
        className={`
          absolute left-full top-1/2 -translate-y-1/2 ml-2
          px-2 py-1 text-sm rounded-md
          bg-gray-800 text-white
          transition-opacity duration-200
          ${showTooltip ? "opacity-100" : "opacity-0"}
          pointer-events-none
          before:absolute before:top-1/2 before:right-full before:-translate-y-1/2
          before:border-4 before:border-transparent before:border-r-gray-800
          whitespace-nowrap /* Added this line to prevent text wrapping */
        `}
        style={{ zIndex: 10 }} // Ensure tooltip is above other elements if needed
      >
        {theme === "light" ? "Switch to Dark" : "Switch to Light"}
      </div>

      {/* Button */}
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          p-3 rounded-full transition-all duration-300
          hover:scale-110 active:scale-95
          ${
            theme === "light"
              ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }
        `}
        aria-describedby="theme-tooltip"
      >
        {theme === "light" ? (
          <FiSun className="w-5 h-5" />
        ) : (
          <FiMoon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default ThemeSwitcher;
