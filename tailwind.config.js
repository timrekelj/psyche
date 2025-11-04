/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'instrument-serif': ['InstrumentSerif-Regular', 'serif'],
        'instrument-serif-italic': ['InstrumentSerif-Italic', 'serif'],
      },
      fontSize: {
        'xs': '0.8rem',
        'sm': '1em',
        'base': '1.2rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
    },
  },
  plugins: [],
}
