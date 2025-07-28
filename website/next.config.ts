import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure pdf-parse to be external to prevent bundling issues
  serverExternalPackages: ['pdf-parse'],
  
  // Optional: If you also want to ensure compatibility with other PDF libraries
  // serverExternalPackages: ['pdf-parse', 'pdf2json', 'pdfjs-dist'],
};

export default nextConfig;
