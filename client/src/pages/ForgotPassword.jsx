import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { requestPasswordReset } from "../services/api";
import PageTitle from "../components/PageTitle";

export default function ForgotPassword() {
  return (
    <>
      <PageTitle title="Recuperar contraseña" />
      <ForgotPasswordContent />
    </>
  );
}

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo iniciar la recuperación de contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recupera el acceso a tu cuenta."
      description="Introduce tu correo y te ayudaremos a volver a entrar en Mochi."
      footer={
        <p className="text-center text-sm text-slate-500">
          ¿Ya recuerdas tu contraseña?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {submitted ? (
        <div
          role="status"
          className="rounded-xl bg-indigo-50 px-4 py-4 text-sm leading-6 text-indigo-700"
        >
          Si el correo pertenece a una cuenta, recibirás las instrucciones para
          recuperar tu contraseña.
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
              htmlFor="recovery-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
