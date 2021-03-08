module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      gridTemplateColumns: {
        header: 'max-content minmax(0,1fr)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['focus-visible'],
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
      textColor: ['focus-visible'],
      textDecoration: ['focus-visible'],
      textOpacity: ['focus-visible'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
