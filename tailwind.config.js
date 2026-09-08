/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:    { 50: "#FFFDF8", 100: "#FDF6EC", 200: "#FAF0E4", 300: "#F0E0CC", 400: "#E8D5BC" },
        parchment:{ DEFAULT: "#FAF0E4", dark: "#F0E0CC" },
        chocolate:{ 50: "#F5EDE6", 100: "#E8D5C0", 200: "#D4B896", 300: "#C09A6C", 400: "#A47B50", 500: "#8B6340", 600: "#6B4A2E", 700: "#5D3A1A", 800: "#4A2E14", 900: "#3D2212" },
        caramel:  { 50: "#FDF5EE", 100: "#F8E8D8", 200: "#F0D4B8", 300: "#E4BB93", 400: "#D4A574", 500: "#C8956A", 600: "#B07A4A", 700: "#8E5E35" },
        dustyrose:{ 50: "#FDF2F4", 100: "#F8E1E5", 200: "#F0C5CC", 300: "#E4A5AD", 400: "#D4878F", 500: "#C4727F", 600: "#A85A66", 700: "#8E4A55" },
        sage:     { 50: "#F2F5F2", 100: "#E0E8E0", 200: "#C2D4C2", 300: "#A3BFA3", 400: "#7D9E7E", 500: "#5F8260", 600: "#4A6A4B" },
        wine:     { 50: "#FDF2F4", 100: "#F5E0E4", 200: "#E8BFC7", 300: "#D4929F", 400: "#B86878", 500: "#8B3A4A", 600: "#6B2A38", 700: "#4A1C28" },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "fade-in-up": "fadeInUp 0.6s ease-out both",
        "slide-down": "slideDown 0.3s ease-out both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "warm": "0 4px 20px rgba(93, 58, 26, 0.08)",
        "warm-lg": "0 8px 30px rgba(93, 58, 26, 0.12)",
        "warm-xl": "0 12px 40px rgba(93, 58, 26, 0.15)",
        "glow-caramel": "0 0 20px rgba(200, 149, 106, 0.2)",
      },
    },
  },
  plugins: [],
}
