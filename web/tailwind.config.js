/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        hemp: {
          green: "#4AA94A",     // Primary
          sage: "#96D196",      // Secondary
          forest: "#2F6D2F",    // Dark accent
          mist: "#ECF7EC",      // Neutral light
          ink: "#1B3A1B",       // Neutral dark
          brown: "#8D6B47",     // Warm accent
          cream: "#F3EDE5",     // Highlight
        },
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.08)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.6s ease-out",
        slideInRight: 'slideInRight 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
