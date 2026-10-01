import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/AuthLayout";
import PageTitle from "../components/PageTitle";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  return (
    <>
      <PageTitle title="Iniciar sesión" />
      <LoginContent />
    </>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login: saveLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await login({ email, password });
      saveLogin(data.token, data.username);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.["ratelimit-reset"];
        if (retryAfter) {
          const minutes = Math.ceil(retryAfter / 60);
          setError(
            `Demasiados intentos. Por favor, espera ${minutes} minuto${minutes !== 1 ? "s" : ""} e inténtalo de nuevo.`,
          );
        } else {
          setError(
            "Demasiados intentos. Por favor, espera unos minutos e inténtalo de nuevo.",
          );
        }
      } else {
        setError(err.response?.data?.message || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Qué alegría verte otra vez."
      description="Inicia sesión y sigue construyendo tu espacio en internet."
      footer={
        <div className="space-y-3 text-center text-sm text-slate-500">
          <p>
            ¿Has olvidado tu contraseña?{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Recupera el acceso
            </Link>
          </p>
          <p>
            ¿Aún no tienes cuenta?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Crea tu perfil gratis
            </Link>
          </p>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 py-3 pl-4 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Iniciando sesión..." : "Entrar en Mochi"}
        </button>
      </form>
    </AuthLayout>
  );
}
