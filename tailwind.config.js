// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        },
      },
      animation: {
        'pulse-scale': 'pulse-scale 1.5s ease-in-out infinite',
      },
    },
  },
};
