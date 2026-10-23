import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // flowguard-src se instala como dependencia local (file:../flowguard-src),
  // fuera de la raíz de este proyecto: sin esto, Next/Turbopack no sigue el
  // symlink de node_modules hacia un directorio externo.
  experimental: {
    externalDir: true,
  },
  // El círculo "N" de Next.js en la esquina (indicador de modo desarrollo)
  // no es parte del diseño del producto; se apaga para que las capturas y
  // la demo no se confundan con algo que construimos nosotros.
  devIndicators: false,
};

export default nextConfig;
