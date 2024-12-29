/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
          light: '#81C784'
        },
        text: {
          DEFAULT: '#333333',
          light: '#666666'
        }
      },
      boxShadow: {
        'default': '0 2px 4px rgba(0,0,0,0.1)',
      },
      spacing: {
        '128': '32rem',
      },
      minHeight: {
        'screen-75': '75vh',
      }
    },
  },
  plugins: [],
}

