/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
    "./src/design-system/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Core semantic tokens mapped to theme variables or presets
        brandOrange: '#FF4B2B',
        brandRed: '#FF416C',
        brandPurple: '#8A2387',
        brandPink: '#E94057',
        brandMint: '#00F2FE',
        
        // Semantic overrides
        darkBg: "#08080A",
        darkCard: "#121216",
        primaryOrange: "#FF4B2B",
        primaryRed: "#FF416C",
        xpPurple: "#8A2387",
        xpPink: "#E94057",
        mintGreen: "#00F2FE",
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'base': '16px',
        'lg': '20px',
        'xl': '24px',
        'xxl': '32px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
        '5xl': '64px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      fontFamily: {
        display: ['Inter-Black', 'sans-serif'],
        bold: ['Inter-Bold', 'sans-serif'],
        semibold: ['Inter-SemiBold', 'sans-serif'],
        medium: ['Inter-Medium', 'sans-serif'],
        regular: ['Inter-Regular', 'sans-serif'],
        light: ['Inter-Light', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
