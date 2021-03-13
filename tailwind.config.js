const colors = require('tailwindcss/colors')

const isStorybook = process.env.STORYBOOK === 'true'

module.exports = {
  purge: [
    './pages/**/*.{ts,tsx}',
    isStorybook
      ? './components/**/*.{ts,tsx}'
      : './components/**/*!(.stories).{ts,tsx}',
  ],
  darkMode: isStorybook ? 'class' : 'media',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-t-to-b':
          'linear-gradient(to top, transparent 50%, var(--tw-gradient-from), var(--tw-gradient-from) 1.5rem, var(--tw-gradient-stops)), linear-gradient(to bottom, transparent 50%, var(--tw-gradient-from), var(--tw-gradient-from) 1.5rem, var(--tw-gradient-stops))',
      },
      colors: {
        gray: colors.coolGray,
      },
      gridTemplateColumns: {
        header: 'max-content minmax(0,1fr)',
      },
      transitionDuration: {
        0: '0ms',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'focus-visible'],
      backgroundOpacity: ['focus-visible'],
      borderColor: ['focus-visible'],
      borderOpacity: ['focus-visible'],
      boxShadow: ['focus-visible'],
      opacity: ['focus-visible'],
      outline: ['focus-visible'],
      ringColor: ['focus-visible'],
      ringOffsetColor: ['focus-visible'],
      ringOffsetWidth: ['focus-visible'],
      ringOpacity: ['focus-visible'],
      ringWidth: ['focus-visible'],
      textColor: ['active', 'focus-visible'],
      textDecoration: ['focus-visible'],
      textOpacity: ['focus-visible'],
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
}
