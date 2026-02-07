export default {
  darkMode: 'class',
  content: [
    './index.html',
    './admin/index.html',
    './index.tsx',
    './App.tsx',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './admin/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        accent: '#F59E0B',
        background: '#F9FAFB',
      },
    },
  },
};
