const colors = require('tailwindcss/colors')

const isStorybook = process.env.STORYBOOK === 'true'

module.exports = {
  mode: 'jit',
  purge: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // TODO https://github.com/FullHuman/purgecss/issues/158
    // './components/**/*!(.stories).{ts,tsx}',
  ],
  darkMode: isStorybook ? 'class' : 'media',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-t-to-b':
          'linear-gradient(to top, transparent 50%, var(--tw-gradient-from), var(--tw-gradient-from) 1.5rem, var(--tw-gradient-stops)), linear-gradient(to bottom, transparent 50%, var(--tw-gradient-from), var(--tw-gradient-from) 1.5rem, var(--tw-gradient-stops))',
      },
      colors: {
        gray: colors.blueGray,
      },
      gridTemplateColumns: {
        header: 'max-content minmax(0,1fr)',
      },
      transitionDuration: {
        0: '0ms',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
}
