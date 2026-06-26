/** @type {import('next').NextConfig} */
const nextConfig = {
  // Post-NDA documents (PDFs, scans) can be large; raise the server action /
  // route body limit so base64-encoded uploads aren't rejected.
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
