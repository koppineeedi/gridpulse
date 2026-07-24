/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        cardBg: "#151d30",
        cardBorder: "#222f4d",
        brandBlue: "#3b82f6",
        brandGreen: "#10b981",
        brandAmber: "#f59e0b",
        brandRed: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
}
