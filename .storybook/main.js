module.exports = {
  stories: ['../components/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
        controls: false,
        docs: false,
      },
    },
    '@storybook/addon-postcss',
    'storybook-dark-mode',
  ],
}
