import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";

// flowguard-docs/requisitos-vistas.md § 1: el login con sesión por usuario
// queda "fuera del alcance confirmado del MVP" salvo que el equipo decida
// ampliarlo explícitamente — se decidió ampliarlo, pero acotado a dos
// accesos mínimos: Google (identidad real) y un usuario fijo de
// demostración (usuario/contraseña "demo"), sin gestión de roles ni base de
// datos de credenciales propia.
const proveedores: Provider[] = [
  Credentials({
    id: "demo",
    name: "Usuario de demostración",
    credentials: {
      usuario: { label: "Usuario", type: "text" },
      contrasena: { label: "Contraseña", type: "password" },
    },
    async authorize(credenciales) {
      if (credenciales?.usuario === "demo" && credenciales?.contrasena === "demo") {
        return { id: "demo", name: "Usuario de demostración", email: "demo@flowguard.local" };
      }
      return null;
    },
  }),
];

// Google solo se registra si hay credenciales configuradas: así el modo
// demo (usuario/contraseña "demo") sigue funcionando en local sin que haga
// falta dar de alta un proyecto en Google Cloud para poder desarrollar.
export const googleDisponible = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleDisponible) {
  proveedores.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: proveedores,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
});
