/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['tesseract.js', 'pdf-parse']
};

export default nextConfig;
