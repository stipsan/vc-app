const fs = require('fs')
const path = require('path')
const resolveConfig = require('tailwindcss/resolveConfig')
const tailwindConfig = require('./tailwind.config.js')

// Next.js don't need this logic thanks to its support for getStaticProps, but the storybook is a differen't.... story...

const { theme } = resolveConfig(tailwindConfig)

fs.writeFileSync(
  path.resolve(__dirname, 'theme.json'),
  JSON.stringify(theme, null, 2)
)
