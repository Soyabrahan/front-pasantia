/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

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
    allowedDevOrigins: [
      "10.200.23.71",
      "localhost:3000",
      "127.0.0.1:3000",
      "172.16.1.185:3000",
      "172.16.1.185",
    ],
  },
  // Configurar proxy inverso en desarrollo para reemplazar Nginx
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${apiBaseUrl}/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
