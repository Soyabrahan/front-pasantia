/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  // Solo usar 'export' en producción para permitir 'rewrites' en desarrollo
  ...(isDev ? {} : { output: "export" }),
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    viewTransition: true,
    // Permitir acceso desde la IP del servidor de Ferrominera
    allowedDevOrigins: ["10.200.23.71", "localhost:3000"],
  },
  // Configurar proxy inverso en desarrollo para reemplazar Nginx
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${process.env.NEXT_PUBLIC_API_URL || "http://10.200.23.71:3001"}/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
