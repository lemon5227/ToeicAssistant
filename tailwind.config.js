/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Guofeng Palette
        paper: "#F7F5F0", // Rice Paper
        ink: "#2C3E50",   // Ink Black
        cinnabar: "#C0392B", // Vermilion
        gold: "#D4AF37",  // Imperial Gold
        jade: "#27AE60",  // Jade Green
      },
      fontFamily: {
        serif: ["System"], // We'll use system serif for now, can add custom font later
      },
    },
  },
  plugins: [],
}
