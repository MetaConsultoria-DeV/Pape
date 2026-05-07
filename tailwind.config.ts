import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        meta: {
          'blue-light': '#2AD8FF',
          blue: '#0067FF',
          'blue-accent': '#22C0FF',
          navy: '#131936',
          paper: '#F4F7FF',
          'navy-90': '#1B2240',
          'navy-70': '#3A416A',
          'navy-50': '#6B7299',
          'navy-30': '#B5BACC',
          'navy-10': '#E5E8F2',
          success: '#1FBF6A',
          warning: '#F5A623',
          danger: '#E5484D',
          info: '#22C0FF',
        },
      },
      backgroundImage: {
        'meta-gradient': 'linear-gradient(135deg, #2AD8FF 0%, #0067FF 100%)',
        'meta-gradient-h': 'linear-gradient(90deg, #2AD8FF 0%, #0067FF 100%)',
        'meta-gradient-v': 'linear-gradient(180deg, #2AD8FF 0%, #0067FF 100%)',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        body: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.12em',
      },
      boxShadow: {
        'meta-sm': '0 1px 2px rgba(19, 25, 54, 0.08)',
        'meta-md': '0 4px 12px rgba(19, 25, 54, 0.10)',
        'meta-lg': '0 12px 32px rgba(19, 25, 54, 0.14)',
        'meta-glow': '0 0 24px rgba(42, 216, 255, 0.45)',
      },
      borderRadius: {
        'meta-sm': '4px',
        'meta-md': '8px',
        'meta-lg': '16px',
        'meta-xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
