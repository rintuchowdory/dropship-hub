/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0d10",
        sidebar: "#0e1216",
        card: "#12161a",
        border: "#1e293b",
        accent: "#22c55e",
        accentdim: "#143328",
        muted: "#64748b",
        ink: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
