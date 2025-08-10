import React, { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("bookwise_theme") || "light");

  useEffect(() => {
    localStorage.setItem("bookwise_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{ borderRadius: "1rem", padding: "0.4rem 0.8rem", border: "1px solid #ccc", cursor: "pointer" }}
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeToggle; 