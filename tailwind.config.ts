import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page)",
        card: "var(--color-card)",
        "card-alt": "var(--color-card-alt)",
        "theme-border": "var(--color-border)",
        "theme-border-strong": "var(--color-border-strong)",
        "text-heading": "var(--color-text-heading)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        accent: {
          blue: "var(--color-blue)",
          green: "var(--color-green)",
          purple: "var(--color-purple)",
          yellow: "var(--color-yellow)",
          red: "var(--color-red)",
          orange: "var(--color-orange)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
