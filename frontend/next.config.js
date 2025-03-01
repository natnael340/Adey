/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "s3.us-east-2.amazonaws.com",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
