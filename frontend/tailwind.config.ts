import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ['class'], content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './contexts/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: { extend: { colors: { navy: { 50:'#eef4ff', 100:'#d8e6ff', 500:'#2453a6', 700:'#102a5c', 800:'#0b1d3d', 900:'#06152e' }, gold: { 50:'#fff8e1', 100:'#ffefb7', 400:'#d7a928', 500:'#c79a1b', 600:'#a77c13' } }, boxShadow: { premium: '0 18px 50px rgba(6,21,46,.14)' }, animation: { 'fade-in':'fadeIn .35s ease-out' }, keyframes: { fadeIn: { '0%': { opacity:'0', transform:'translateY(8px)' }, '100%': { opacity:'1', transform:'translateY(0)' } } } } },
  plugins: []
};
export default config;
