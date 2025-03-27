// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        background: '#0f172a',
        accent: '#4ecdc4',
        critical: '#ff6b6b',
        sensor: '#22d3ee',
        system: '#6366f1',
        event: '#facc15',
      },
      boxShadow: {
        card: '0 0 0 1px #1f2937, 0 10px 15px -3px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
