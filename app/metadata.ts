import type { Metadata } from "next";

// Compartido entre los dos layouts raíz (app/(app)/layout.tsx y
// app/(auth)/layout.tsx — ver nota en ese archivo sobre por qué hay dos),
// para no tener el título/ícono duplicados y potencialmente desincronizados.
export const metadataBase: Metadata = {
  title: "FlowGuard",
  description: "Supervisión de aprobación de pagos simulados",
  icons: { icon: "/logo.png" },
};
