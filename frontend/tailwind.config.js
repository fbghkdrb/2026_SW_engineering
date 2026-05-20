/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'wt-sky':          '#D6EEFA',
        'wt-sky-dark':     '#BAE0F7',
        'wt-orange':       '#FF6B35',
        'wt-orange-light': '#FFF3EE',
        'wt-navy':         '#1A3A5C',
      },
    },
  },
  plugins: [],
};
