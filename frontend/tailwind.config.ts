import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#0a0b0f",
          2: "#111318",
          3: "#1a1d24",
          4: "#222630",
        },
        border: {
          DEFAULT: "#2a2e3a",
          2: "#363c4a",
        },
        green: {
          DEFAULT: "#00e676",
          dim: "#1a4d35",
          bg: "#002916",
        },
        red: {
          DEFAULT: "#ff4444",
          dim: "#5a1515",
          bg: "#2d0808",
        },
        yellow: {
          DEFAULT: "#ffd600",
          bg: "#2d2500",
        },
        accent: {
          DEFAULT: "#6c63ff",
          2: "#8b84ff",
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        skeleton: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
