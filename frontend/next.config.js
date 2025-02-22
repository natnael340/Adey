/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "192.168.51.172",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
