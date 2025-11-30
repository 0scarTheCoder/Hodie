/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hodie-primary': '#4F60FA',
        'hodie-text': '#73799B',
        'hodie-secondary': '#CAC9D1',
        'hodie-bg': '#F4F7FF',
        'hodie-dark': '#32373C',
        'hodie-white': '#FFFFFF',
        // Keep legacy colors for compatibility
        'brand-blue': '#2563eb',
        'brand-light-blue': '#3b82f6',
        'brand-green': '#10b981',
        'brand-gray': '#6b7280',
        'brand-light-gray': '#f3f4f6',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}