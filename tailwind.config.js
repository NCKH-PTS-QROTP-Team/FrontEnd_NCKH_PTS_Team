/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3FA9F5",
        primaryLight: "#60B8F7",
        background: "#FFFFFF",
      },
      fontSize: {
        xs: ["12px", { lineHeight: "18px" }],
        sm: ["14px", { lineHeight: "21px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "30px" }],
        "2xl": ["24px", { lineHeight: "36px", letterSpacing: "-0.01em" }],
        "3xl": ["32px", { lineHeight: "48px", letterSpacing: "-0.02em" }],
        "4xl": ["40px", { lineHeight: "56px", letterSpacing: "-0.02em" }],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
      },
      letterSpacing: {
        tight: "-0.01em",
        tighter: "-0.02em",
      },
    },
  },
  plugins: [],
};
