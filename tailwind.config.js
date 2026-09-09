/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:    { 50: "#FBF7F1", 100: "#F5EEE3", 200: "#ECE0CF", 300: "#DCCBAC", 400: "#C9B48C" },
        parchment:{ DEFAULT: "#F5EEE3", dark: "#ECE0CF" },
        chocolate:{ 50: "#F5F0EA", 100: "#E7DECB", 200: "#CFBC98", 300: "#B39A68", 400: "#8F7342", 500: "#70561F", 600: "#57421B", 700: "#40301A", 800: "#2B2013", 900: "#1A1208" },
        caramel:  { 50: "#FAF4EC", 100: "#F2E5CC", 200: "#E5CC99", 300: "#D3AF6E", 400: "#BC8C3A", 500: "#9E6F22", 600: "#7C5417", 700: "#5E4011" },
        dustyrose:{ 50: "#FAF3F1", 100: "#F2E0DC", 200: "#E2BFB7", 300: "#CC988C", 400: "#AB6F63", 500: "#8C5045", 600: "#703F35", 700: "#57302A" },
        sage:     { 50: "#F2F5EF", 100: "#E0E7D8", 200: "#C1CFB2", 300: "#9EB28B", 400: "#7B9166", 500: "#60734D", 600: "#4B5A3C", 700: "#3A4630" },
        wine:     { 50: "#F8F2F4", 100: "#EADDE2", 200: "#D3B7C0", 300: "#B58B98", 400: "#925F6D", 500: "#74454F", 600: "#5B343C", 700: "#46282E" },
        saffron:  { 50: "#FCF5E8", 100: "#F8E4B6", 200: "#F0CD79", 300: "#E5AD38", 400: "#D89308", 500: "#C37806", 600: "#9B5E05", 700: "#7A4905" },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out both",
        "fade-in-up": "fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-down": "slideDown 0.2s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 28s linear infinite",
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
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "Archivo", "system-ui", "sans-serif"],
        sans: ["Archivo", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "warm": "4px 4px 0 rgba(26, 18, 8, 0.95)",
        "warm-lg": "6px 6px 0 rgba(26, 18, 8, 0.9)",
        "warm-xl": "8px 8px 0 rgba(26, 18, 8, 0.85)",
        "sharp": "4px 4px 0 rgba(26, 18, 8, 0.95)",
        "sharp-saffron": "4px 4px 0 rgba(195, 120, 6, 0.95)",
      },
    },
  },
  plugins: [],
}