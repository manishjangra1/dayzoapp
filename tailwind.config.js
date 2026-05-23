/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#050505",
        darkCard: "#121212",
        primaryOrange: "#FF4B2B",
        primaryRed: "#FF416C",
        xpPurple: "#8A2387",
        xpPink: "#E94057",
        mintGreen: "#00F2FE",
      },
    },
  },
  plugins: [],
}
