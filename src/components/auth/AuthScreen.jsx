import { useState } from "react";
import { Dumbbell, LoaderCircle } from "lucide-react";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
} from "../../services/authService";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const isRegistering = mode === "register";

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isRegistering && form.name.trim().length < 2) {
      setError("Escribe tu nombre.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (isRegistering && form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);

      if (isRegistering) {
        await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      } else {
        await loginUser({
          email: form.email,
          password: form.password,
        });
      }
    } catch (firebaseError) {
      console.error("Error de autenticación:", firebaseError);
      setError(getAuthErrorMessage(firebaseError.code));
    } finally {
      setSubmitting(false);
    }
  }
  async function handlePasswordReset() {
    setError("");
    setMessage("");

    if (!form.email.trim()) {
      setError("Escribe tu correo electrónico para recuperar la contraseña.");

      return;
    }

    try {
      setResettingPassword(true);

      await requestPasswordReset(form.email);

      setMessage(
        "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.",
      );
    } catch (firebaseError) {
      console.error(
        "No se pudo enviar el correo de recuperación:",
        firebaseError,
      );

      setError(getAuthErrorMessage(firebaseError.code));
    } finally {
      setResettingPassword(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400 text-black">
            <Dumbbell size={30} />
          </div>

          <h1 className="text-3xl font-bold">Fitness Tracker</h1>

          <p className="mt-2 text-sm text-zinc-400">
            {isRegistering
              ? "Crea tu cuenta y comienza a registrar tu progreso."
              : "Inicia sesión para consultar tu progreso."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => changeMode("login")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              !isRegistering
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() => changeMode("register")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isRegistering
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {isRegistering && (
            <AuthField
              label="Nombre"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          )}

          <AuthField
            label="Correo electrónico"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <AuthField
            label="Contraseña"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete={isRegistering ? "new-password" : "current-password"}
          />

          {!isRegistering && (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={resettingPassword}
              className="-mt-2 justify-self-end text-sm font-semibold text-lime-400 transition hover:text-lime-300 disabled:cursor-wait disabled:opacity-60"
            >
              {resettingPassword
                ? "Enviando correo..."
                : "¿Olvidaste tu contraseña?"}
            </button>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 p-3 text-sm text-lime-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 font-bold text-black transition hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting && <LoaderCircle size={19} className="animate-spin" />}

            {isRegistering ? "Crear cuenta" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

function AuthField({ label, type, name, value, onChange, autoComplete }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-400">{label}</span>

      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 outline-none transition focus:border-lime-400"
      />
    </label>
  );
}

function getAuthErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/weak-password": "La contraseña es demasiado débil.",
    "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
  };

  return messages[code] ?? "No fue posible completar la operación.";
}
