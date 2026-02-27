import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panel2: "var(--panel-2)",
        text: "var(--text)",
        textdim: "var(--text-dim)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        warn: "var(--warn)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0, 251, 255, 0.25), 0 0 24px rgba(0, 251, 255, 0.15)"
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        pulseLine: "pulseLine 1.8s ease-in-out infinite",
        floatIn: "floatIn 420ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
