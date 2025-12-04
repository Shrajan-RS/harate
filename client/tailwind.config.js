/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1b8c84',
          dark: '#11625c',
          light: '#e0f2f1',
        },
      },
    },
  },
  plugins: [],
};

