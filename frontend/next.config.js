/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Ensure CSS modules work correctly with Tailwind CSS
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig; 