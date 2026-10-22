module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sa: {
          title: "#9ec8ed",
          blue: "#a8c3e7",
          dim: "#4b5b6a",
          muted: "#7d8b99",
          field: "#1d1f22",
          line: "#2a3038",
        },
      },
      fontFamily: {
        beckett: ["Beckett", "serif"],
        bankGothic: ["Bank Gothic", "sans-serif"],
        futura: ["Futura LT Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
