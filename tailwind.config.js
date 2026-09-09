/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:    { 50: "#FDFBF7", 100: "#F8F4EE", 200: "#F1EAE0", 300: "#E5DCCD", 400: "#D4C6B2" },
        parchment:{ DEFAULT: "#F8F4EE", dark: "#F1EAE0" },
        chocolate:{ 50: "#F4F0EA", 100: "#E8DFD3", 200: "#D2C4B0", 300: "#B39F83", 400: "#8D7A5F", 500: "#6B5A42", 600: "#4E4030", 700: "#3A2F23", 800: "#2A2218", 900: "#1E1810" },
        caramel:  { 50: "#FAF5EE", 100: "#F2E6D4", 200: "#E3CBA6", 300: "#D0AC78", 400: "#B88953", 500: "#96682F", 600: "#75511F", 700: "#573D18" },
        dustyrose:{ 50: "#FBF4F4", 100: "#F4E3E3", 200: "#E7C7C7", 300: "#D4A1A1", 400: "#B97777", 500: "#955656", 600: "#753F3F", 700: "#59302F" },
        sage:     { 50: "#F3F6F2", 100: "#E3EBE1", 200: "#C7D5C3", 300: "#A3B99D", 400: "#7A9674", 500: "#5B7955", 600: "#466043", 700: "#374A35" },
        wine:     { 50: "#F8F2F4", 100: "#EDDEE2", 200: "#D9BBC2", 300: "#BE8E9A", 400: "#9E6070", 500: "#7C414F", 600: "#61303C", 700: "#48242D" },
        saffron:  { 50: "#FDF7EC", 100: "#FBEBC4", 200: "#F6D88A", 300: "#EEBC45", 400: "#E29E12", 500: "#C67F06", 600: "#9E6005", 700: "#7A4A07" },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out both",
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-down": "slideDown 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
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
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Archivo", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "warm": "0 1px 2px rgba(30, 24, 16, 0.05)",
        "warm-lg": "0 4px 12px rgba(30, 24, 16, 0.08)",
        "warm-xl": "0 8px 24px rgba(30, 24, 16, 0.10)",
        "sharp": "4px 4px 0 rgba(30, 24, 16, 0.9)",
        "sharp-saffron": "4px 4px 0 rgba(198, 127, 6, 0.9)",
      },
    },
  },
  plugins: [],
}