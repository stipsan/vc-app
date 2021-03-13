module.exports = {
  stories: ['../components/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        controls: false,
        docs: false,
      },
    },
    '@storybook/addon-postcss',
  ],
}
