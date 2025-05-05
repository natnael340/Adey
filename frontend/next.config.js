/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // production
      {
        hostname: "s3.us-east-2.amazonaws.com",
      },
      // development
      {
        hostname: "192.168.51.172",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
