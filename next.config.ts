import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // flowguard-src se instala como dependencia local (file:../flowguard-src),
  // fuera de la raíz de este proyecto: sin esto, Next/Turbopack no sigue el
  // symlink de node_modules hacia un directorio externo.
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
