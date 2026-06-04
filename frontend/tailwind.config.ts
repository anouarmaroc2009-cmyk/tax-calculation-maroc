import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {
    colors: {
      primary: { DEFAULT: '#1a56db', hover: '#1648c0', light: '#e8f0fe' },
      accent: { DEFAULT: '#059669', hover: '#047857', light: '#d1fae5' },
      danger: { DEFAULT: '#dc2626', hover: '#b91c1c', light: '#fee2e2' },
      warning: { DEFAULT: '#d97706', hover: '#b45309', light: '#fef3c7' },
    },
  } },
  plugins: [],
};
export default config;
