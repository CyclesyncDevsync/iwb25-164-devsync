/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {

      colors: {
        // Base theme colors
        primary: {
          DEFAULT: '#00684A', // MongoDB Green
          light: '#47A16B', // Light MongoDB Green
        },
        secondary: {
          DEFAULT: '#001E2B', // Dark Navy
          light: '#F9FAFB', // Light Gray
        },
        
        // Role-based colors
        admin: {
          DEFAULT: '#00684A', // Green for system control
          dark: '#47A16B',
        },
        agent: {
          DEFAULT: '#0066CC', // Professional Blue
          dark: '#60A5FA',
        },
        supplier: {
          DEFAULT: '#10B981', // Emerald Green
          dark: '#34D399',
        },
        buyer: {
          DEFAULT: '#8B5CF6', // Purple
          dark: '#A78BFA',
        },
        
        // Dark theme colors
        dark: {
          bg: '#1F2937', // Dark Gray
          surface: '#374151', // Medium Gray
        },
        
        // Status colors
        status: {
          pending: '#F59E0B', // Yellow
          verified: '#10B981', // Green
          rejected: '#EF4444', // Red
          auction: '#8B5CF6', // Purple
          completed: '#3B82F6', // Blue
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out infinite 2s',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
      },
    },
  },
  plugins: [],
}