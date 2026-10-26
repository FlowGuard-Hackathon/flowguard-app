import { redirect } from "next/navigation";
import { auth, googleDisponible } from "../../lib/auth";
import LoginFormulario from "./LoginFormulario";

export default async function PaginaLogin() {
  const sesion = await auth();
  if (sesion) redirect("/panel");

  return <LoginFormulario googleDisponible={googleDisponible} />;
}
