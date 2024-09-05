module.exports = {
  theme: {
    fontFamily: { 
      'sans': ['Helvetica', 'Arial', 'sans-serif'],
    }
  },
  plugins: [require("@tailwindcss/typography"),require("daisyui")],
  daisyui: {
      styled: true,
      themes: [{
          amsconnect: {
            primary: "#0F238C",
            secondary: "#060E38",
            "accent": "#5ED1FA",
            "neutral": "#B1132F",
            "red-500": "#B1132F",
            "base-100": "#cfd0dc",
            "base-300": "#A1A2AC",
          },
      },
      "light", "dark"],
      base: true,
      utils: true,
      logs: true,
      rtl: false,
      prefix: "",
      darkTheme: "amsconnect",

  },
};