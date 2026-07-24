import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        kiosk: {
          bg: "#0B1220",
          panel: "#121A2B",
          border: "#22304A",
          accent: "#3DDC97",
          accentDim: "#1F8F63",
          danger: "#F2545B",
          text: "#E7ECF5",
          subtext: "#8C9BB5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
