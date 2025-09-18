/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // Scan all JS/TS/React files inside src
    "./public/index.html"          // Optional: if you use HTML in public
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}