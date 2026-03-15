/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        ranchers: ['Ranchers', 'cursive'],
      },
      colors: {
        brown: '#4E1D1F',
        green: '#A0DD87',
        blue: '#9BC8E5',
        red: '#F70000',
        yellow: '#FAEA3E',
        'key-bg': '#EBEED2',
        'key-shift': '#FFA935',
      },
    },
  },
  plugins: [],
};
