"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./login.module.css";
import IntelligentBackground from "./IntelligentBackground";

type IconName = "mail" | "lock" | "eye" | "eyeOff" | "building" | "shield" | "arrow";

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4M8 7h1m6 0h1M8 11h1m6 0h1"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function validateEmail(value: string) {
  if (!value.trim()) return "Ingresa tu correo electrónico.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un correo electrónico válido.";
  return "";
}

function validatePassword(value: string) {
  if (!value) return "Ingresa tu contraseña.";
  return "";
}

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const brandContentRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailValue = emailRef.current?.value ?? "";
    const passwordValue = passwordRef.current?.value ?? "";
    const eError = validateEmail(emailValue);
    const pError = validatePassword(passwordValue);
    setEmailError(eError);
    setPasswordError(pError);
    if (eError) { emailRef.current?.focus(); return; }
    if (pError) { passwordRef.current?.focus(); return; }

    setNotice("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setNotice("La autenticación estará disponible próximamente.");
    }, 900);
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
                <label className={styles.label} htmlFor="email">Correo electrónico</label>
                <div className={`${styles.inputWrap} ${emailError ? styles.inputError : ""}`}>
                  <Icon name="mail" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="maria.gonzalez@empresa.com"
                    ref={emailRef}
                    autoFocus
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    onBlur={(event) => setEmailError(validateEmail(event.currentTarget.value))}
                    onChange={() => { if (emailError) setEmailError(""); }}
                  />
                </div>
                {emailError && <p id="email-error" className={styles.fieldError} role="alert">{emailError}</p>}

                <label className={styles.label} htmlFor="password">Contraseña</label>
                <div className={`${styles.inputWrap} ${passwordError ? styles.inputError : ""}`}>
                  <Icon name="lock" />
                  <input
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••"
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
              <button className={styles.secondary} type="button" onClick={() => setNotice("El acceso SSO estará disponible próximamente.")}><Icon name="building" /> Continuar con SSO (empresa)</button>
              <div className={styles.notice} role="status" aria-live="polite">{notice}</div>
              <footer className={styles.security}><Icon name="shield" /><p>Uso exclusivo para personal autorizado.<br />El acceso está sujeto a las políticas de seguridad de la organización.</p></footer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}






