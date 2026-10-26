"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./login.module.css";
import IntelligentBackground from "./IntelligentBackground";

type IconName = "lock" | "eye" | "eyeOff" | "user" | "shield" | "arrow" | "google";

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "google") {
    // Logo de Google (multicolor, no monocromo con currentColor como el
    // resto): es el único ícono de marca aquí, para el botón "Continuar con
    // Google" — estándar de reconocimiento del proveedor, no una marca propia.
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z" />
        <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
      </svg>
    );
  }
  const paths = {
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function validateUsuario(value: string) {
  if (!value.trim()) return "Ingresa tu usuario.";
  return "";
}

function validatePassword(value: string) {
  if (!value) return "Ingresa tu contraseña.";
  return "";
}

export default function LoginFormulario({ googleDisponible }: Readonly<{ googleDisponible: boolean }>) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [usuarioError, setUsuarioError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const brandContentRef = useRef<HTMLDivElement>(null);
  const usuarioRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const usuarioValue = usuarioRef.current?.value ?? "";
    const passwordValue = passwordRef.current?.value ?? "";
    const uError = validateUsuario(usuarioValue);
    const pError = validatePassword(passwordValue);
    setUsuarioError(uError);
    setPasswordError(pError);
    if (uError) { usuarioRef.current?.focus(); return; }
    if (pError) { passwordRef.current?.focus(); return; }

    setNotice("");
    setLoading(true);
    const resultado = await signIn("demo", { usuario: usuarioValue, contrasena: passwordValue, redirect: false });
    setLoading(false);
    if (resultado?.error) {
      setNotice("Usuario o contraseña incorrectos. En esta demostración, usa demo / demo.");
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  async function continuarConGoogle() {
    if (!googleDisponible) {
      setNotice("El acceso con Google todavía no está configurado en este entorno.");
      return;
    }
    setNotice("");
    setGoogleLoading(true);
    await signIn("google", { redirectTo: "/panel" });
  }

  return (
    <main className={styles.screen}>
      <div className={styles.pattern} aria-hidden="true" />
      <IntelligentBackground avoidRef={brandContentRef} />
      <div className={styles.window}>
        <div className={styles.content}>
          <section className={styles.brand} aria-label="Acerca de FlowGuard">
            <div className={styles.brandContent} ref={brandContentRef}>
              <img className={styles.logo} src="/logo.png" alt="" />
              <div className={styles.wordmark}>FlowGuard</div>
              <p className={styles.tagline}>DETECT <span>·</span> VERIFY <span>·</span> PROTECT</p>
              <h1>Supervisa aprobaciones.<br />Detecta riesgos.<br />Protege tu organización.</h1>
            </div>
          </section>
          <section className={styles.formPanel} aria-label="Inicio de sesión">
            <div className={styles.card}>
              <header className={styles.cardHeader}>
                <h2>Bienvenido a FlowGuard</h2>
                <p>Inicia sesión para continuar</p>
              </header>

              <form onSubmit={submit} noValidate>
                <label className={styles.label} htmlFor="usuario">Usuario</label>
                <div className={`${styles.inputWrap} ${usuarioError ? styles.inputError : ""}`}>
                  <Icon name="user" />
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    autoComplete="username"
                    placeholder="demo"
                    ref={usuarioRef}
                    autoFocus
                    aria-invalid={!!usuarioError}
                    aria-describedby={usuarioError ? "usuario-error" : undefined}
                    onBlur={(event) => setUsuarioError(validateUsuario(event.currentTarget.value))}
                    onChange={() => { if (usuarioError) setUsuarioError(""); }}
                  />
                </div>
                {usuarioError && <p id="usuario-error" className={styles.fieldError} role="alert">{usuarioError}</p>}

                <label className={styles.label} htmlFor="password">Contraseña</label>
                <div className={`${styles.inputWrap} ${passwordError ? styles.inputError : ""}`}>
                  <Icon name="lock" />
                  <input
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="demo"
                    ref={passwordRef}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    onBlur={(event) => setPasswordError(validatePassword(event.currentTarget.value))}
                    onChange={() => { if (passwordError) setPasswordError(""); }}
                  />
                  <button className={styles.visibility} type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible}>
                    <Icon name={visible ? "eyeOff" : "eye"} />
                  </button>
                </div>
                {passwordError && <p id="password-error" className={styles.fieldError} role="alert">{passwordError}</p>}

                <div className={styles.options}>
                  <label className={styles.remember}><input type="checkbox" name="remember" /> <span>Recordarme</span></label>
                  <button type="button" className={styles.textButton} onClick={() => setNotice("La recuperación de contraseña estará disponible próximamente.")}>¿Olvidaste tu contraseña?</button>
                </div>
                <button className={styles.primary} type="submit" disabled={loading} aria-busy={loading}>
                  {loading ? (<><span className={styles.spinner} aria-hidden="true" /> Iniciando sesión…</>) : (<>Iniciar sesión <Icon name="arrow" /></>)}
                </button>
              </form>
              <div className={styles.separator}><span>o</span></div>
              <button
                className={styles.secondary}
                type="button"
                onClick={continuarConGoogle}
                disabled={googleLoading}
                aria-busy={googleLoading}
              >
                <Icon name="google" /> {googleLoading ? "Redirigiendo…" : "Continuar con Google"}
              </button>
              <div className={styles.notice} role="status" aria-live="polite">{notice}</div>
              <footer className={styles.security}><Icon name="shield" /><p>Uso exclusivo para personal autorizado.<br />Acceso de demostración: usuario <strong>demo</strong>, contraseña <strong>demo</strong>.</p></footer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
