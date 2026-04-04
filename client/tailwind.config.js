/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4ff07f",
        "primary-dark": "#25d366",
        surface: "#111125",
        "surface-low": "#1a1a2e",
        "surface-card": "#1e1e32",
        "surface-high": "#28283d",
        "on-surface": "#e2e0fc",
        "on-muted": "#bbcbb9",
        "on-variant": "#8890b5",
        "outline-soft": "rgba(60,74,61,0.4)",
      },
      fontFamily: { body: ["Inter", "sans-serif"], mono: ["Berkeley Mono", "monospace"] },
    },
  },
  plugins: [],
}
