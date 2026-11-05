/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08090c",
        sidebar: "#0b0d11",
        card: "#11141a",
        border: "#212633",
        accent: "#7c6df2",
        accentdim: "#1e1b45",
        muted: "#7a8398",
        ink: "#e8eaf0",
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
