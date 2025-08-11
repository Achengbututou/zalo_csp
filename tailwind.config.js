module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
  theme: {
    extend: {
      colors: {
        primary: "var(--zmp-primary-color)",
        gray: "#767A7F",
        divider: "#E9EBED",
        green: "#288F4E",
        background: "#ffffff",
        skeleton: "rgba(0, 0, 0, 0.1)",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      scale: {
        98: "0.98",
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.75rem",
      },
    },
  },
};
