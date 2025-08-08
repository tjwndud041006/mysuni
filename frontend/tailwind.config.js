// tailwind.config.js

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 경로에 맞게
  ],
  safelist: [
    "from-purple-500", "to-purple-600", "to-purple-50", "border-purple-100",
    "from-red-500", "to-red-600", "to-red-50", "border-red-100",
    // 필요한 색 전부 추가
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
