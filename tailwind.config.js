/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "sf-pro": [
          "SF Pro Display",
          "SF Pro",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        "sf-mono": [
          "SF Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        "apple-dark": {
          900: "#0A0A0C", // Darkest
          800: "#1A1A1C", // Card background
          700: "#2D2D2F", // Border
          600: "#3D3D3F", // Toggle background
          500: "#4D4D4F", // Hover border
          400: "#6D6D6F", // Muted svg
          300: "#8E8E93", // Muted text
          200: "#A1A1A6", // Secondary text
          100: "#F5F5F7", // Primary text
        },
      },
      boxShadow: {
        "apple-sm":
          "0 0.125rem 0.25rem rgba(0, 0, 0, 0.15), 0 0 0.0625rem rgba(0, 0, 0, 0.1)",
        apple: "0 0.5rem 1rem rgba(0, 0, 0, 0.2)",
        "apple-md": "0 0.75rem 1.5rem rgba(0, 0, 0, 0.25)",
        "apple-lg": "0 1rem 2rem rgba(0, 0, 0, 0.3)",
        "apple-xl": "0 1.5rem 3rem rgba(0, 0, 0, 0.35)",
        "apple-glow": "0 0 1rem rgba(59, 130, 246, 0.3)",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
        gradient: "gradient 8s ease infinite",
        slideUpFade: "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s infinite linear",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        fadeInDelay: "fadeIn 0.5s ease-out 0.2s forwards",
        float: "float 6s ease-in-out infinite",
        slideLeft: "slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideRight: "slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        scaleIn: "scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        scaleOut: "scaleOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        blurIn: "blurIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        blurOut: "blurOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        gradient: {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        slideUpFade: {
          "0%": {
            opacity: 0,
            transform: "translateY(1rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
        pulse: {
          "0%, 100%": {
            opacity: 0.8,
          },
          "50%": {
            opacity: 0.2,
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        slideLeft: {
          "0%": {
            opacity: 0,
            transform: "translateX(1rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
        slideRight: {
          "0%": {
            opacity: 0,
            transform: "translateX(-1rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
        scaleIn: {
          "0%": {
            opacity: 0,
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
        scaleOut: {
          "0%": {
            opacity: 1,
            transform: "scale(1)",
          },
          "100%": {
            opacity: 0,
            transform: "scale(0.95)",
          },
        },
        blurIn: {
          "0%": {
            opacity: 0,
            transform: "translateY(0.5rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        blurOut: {
          "0%": {
            opacity: 1,
            transform: "translateY(0)",
          },
          "100%": {
            opacity: 0,
            transform: "translateY(0.5rem)",
          },
        },
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
