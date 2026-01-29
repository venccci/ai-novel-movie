/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 暗色主题配色
        background: '#000000',
        foreground: '#f3f4f6',
        card: '#0a0a0a',
        'card-foreground': '#f9fafb',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1f2937',
          foreground: '#f9fafb',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          foreground: '#ffffff',
        },
        border: '#374151',
        input: '#4b5563',
        ring: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        "animate-in": "animate-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-from-bottom-4": "slide-in-from-bottom-4 0.3s ease-out",
      },
    },
  },
  plugins: [],
}
