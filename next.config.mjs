/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Solo usar 'export' en producción para permitir 'rewrites' en desarrollo
  ...(isDev ? {} : { output: 'export' }),
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
  },
  // Configurar proxy inverso en desarrollo para reemplazar Nginx
  ...(isDev ? {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          // Puedes cambiar esta URL mediante una variable de entorno si tu backend está en otra IP
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/:path*`, 
        },
      ];
    },
  } : {})
}

export default nextConfig
