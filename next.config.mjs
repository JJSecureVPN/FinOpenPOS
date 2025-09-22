/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily removing output: 'export' to test compilation
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
