import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // flowguard-src se instala como dependencia local (file:../flowguard-src),
  // fuera de la raíz de este proyecto: sin esto, Next/Turbopack no sigue el
  // symlink de node_modules hacia un directorio externo.
  experimental: {
    externalDir: true,
  },
  // Next 16 restringe `quality` a [75] por defecto — sin esto, el
  // quality={100} de ImagenHero.tsx (public/hero-lp.png) se recorta a 75 en
  // silencio y pierde nitidez en un mockup con texto pequeño y brillos.
  images: {
    qualities: [75, 100],
  },
  // El círculo "N" de Next.js en la esquina (indicador de modo desarrollo)
  // no es parte del diseño del producto; se apaga para que las capturas y
  // la demo no se confundan con algo que construimos nosotros.
  devIndicators: false,
};

export default nextConfig;
