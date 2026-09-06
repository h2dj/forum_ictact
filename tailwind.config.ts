import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#26232a",
        canvas: "#fbf9f6",
        brand: {
          50: "#f2f1ff",
          100: "#e6e3ff",
          200: "#cfc9ff",
          300: "#aea3ff",
          400: "#8a79ff",
          500: "#6c56f9",
          600: "#5940dd",
          700: "#4630b0",
        },
      },
      boxShadow: {
        note: "0 1px 2px rgba(38,35,42,0.04), 0 6px 16px rgba(38,35,42,0.06)",
        pop: "0 10px 30px rgba(89,64,221,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.25s ease-out",
        "float-y": "float-y 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
