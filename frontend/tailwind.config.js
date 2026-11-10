/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", light: "#3B82F6", dark: "#1D4ED8" },
        accent: { DEFAULT: "#059669", light: "#10B981", dark: "#047857" },
        surface: { DEFAULT: "#F8FAFC", card: "#FFFFFF", muted: "#F1F5FD" },
        ink: { DEFAULT: "#0F172A", muted: "#475569", light: "#94A3B8" },
        border: "#E4ECFC",
        danger: { DEFAULT: "#DC2626", light: "#FEE2E2" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        success: { DEFAULT: "#059669", light: "#D1FAE5" },
      },
      fontFamily: {
        sans: ['"Fira Sans"', "system-ui", "sans-serif"],
        mono: ['"Fira Code"', "monospace"],
      },
    },
  },
  plugins: [],
};
