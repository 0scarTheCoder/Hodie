/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#2563eb',
        'brand-light-blue': '#3b82f6',
        'brand-green': '#10b981',
        'brand-gray': '#6b7280',
        'brand-light-gray': '#f3f4f6',
      },
    },
  },
  plugins: [],
}