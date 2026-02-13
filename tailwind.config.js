/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX/TS/TSX files in src/
    "./public/index.html"        // Also scan public/index.html for classes
  ],
  theme: {
    extend: {
      backgroundImage: {
        // Define a custom background image utility class `bg-hero`
        // The path here is relative to the `public` folder of your project
        hero: "url('images/bghero.jpg')",
      }
    },
  },
  plugins: [],
}