import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const token = searchParams.get("token");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, newPassword: password });
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea una nueva contraseña."
      description="Elige una contraseña segura para volver a acceder a tu cuenta de Mochi."
      footer={
        <p className="text-center text-sm text-slate-500">
          ¿Recuerdas tu contraseña?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {!token ? (
        <div
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-4 text-sm leading-6 text-red-700"
        >
          El enlace de recuperación no es válido o está incompleto. Solicita
          uno nuevo para continuar.
        </div>
      ) : submitted ? (
        <div
          role="status"
          className="rounded-xl bg-indigo-50 px-4 py-4 text-sm leading-6 text-indigo-700"
        >
          Tu contraseña se ha actualizado correctamente. Ya puedes iniciar
          sesión con ella.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nueva contraseña
            </label>

            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Repite la contraseña
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
