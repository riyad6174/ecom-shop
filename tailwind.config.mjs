module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4169E1', // Deep sky
        secondary: '#9333EA', // Purple
        dark: '#1E1E1E',
        'dark-2': '#212121', // Top header color
        accent: '#FF4423', // Orange
        background: '#F5F6F7', // Light gray
        text: '#111827', // Dark gray
        sectionText: '#637381',
        greenText: '#1D9E34',
        footer: '#212B36',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Default font
        serif: ['Merriweather', 'serif'],
        mont: ['Montserrat', 'serif'],
        noto: ['Noto Serif Bengali', 'serif'],
      },
      container: {
        center: true,
        padding: '0.7rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [],
};
