import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#4B9CD3",       // Carolina blue
          slate: "#1E293B",      // dark slate
          slateSoft: "#334155",
          slateLight: "#475569",
        },
      },
    },
  },
  plugins: [],
};

export default config;