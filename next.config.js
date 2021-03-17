module.exports = {
  experimental: {
    reactMode: 'concurrent',
    profiling: process.env.VERCEL_ENV !== 'production',
  },
}
