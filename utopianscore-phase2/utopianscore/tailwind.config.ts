import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // UtopianScore semantic palette
        brand: {
          blue: "#EAF2FB",      // creamy blue — atmosphere / nav surfaces
          "blue-dark": "#3E6DA8",
          orange: "#FFB07C",    // progress / activity / achievement
          "orange-dark": "#D97A3F",
          violet: "#8B7FD1",    // advanced / coding / exploration
          "violet-dark": "#5B4EA6",
        },
        ink: {
          900: "#14151A",
          700: "#3A3D46",
          500: "#6B6F7B",
          300: "#A7ABB6",
          100: "#E7E9EE",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
