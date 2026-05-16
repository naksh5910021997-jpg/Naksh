/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Agar src folder use kar rahe hain
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc", // Aapka bigbeartheme background
      },
    },
  },
  plugins: [],
};