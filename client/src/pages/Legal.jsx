import { Link } from "react-router-dom";
import PageTitle from "../components/PageTitle";

const sections = [
  {
    title: "Términos de uso",
    content: [
      "Al utilizar Mochi, aceptas que seas responsable de los contenidos que publiques, especialmente de los enlaces, nombres, descripciones y perfiles que compartas con otras personas.",
      "No se permite utilizar la plataforma para distribuir contenido ilegal, violento, discriminatorio, fraudulento o que incumpla las leyes aplicables.",
      "Puedes eliminar o modificar tus datos en cualquier momento desde tu cuenta. La disponibilidad de la plataforma puede cambiar según la evolución del servicio.",
    ],
  },
  {
    title: "Política de privacidad",
    content: [
      "Mochi procesa la información necesaria para gestionar tu cuenta, publicar tu perfil y mostrar los enlaces que hayas configurado.",
      "No se publicará tu contraseña ni los datos de autenticación. La información personal se utiliza únicamente para ofrecer el servicio y mejorar la experiencia del usuario.",
      "Puedes consultar, modificar o eliminar tus datos desde la configuración de tu cuenta. La eliminación puede implicar que tu perfil ya no esté disponible.",
    ],
  },
  {
    title: "Política de cookies",
    content: [
      "La aplicación puede utilizar cookies o sesiones para mantener tu sesión autenticada y recordar tus preferencias mientras utilizas el servicio.",
      "No se utilizan cookies de terceros para publicidad ni para rastrear tu actividad fuera de Mochi.",
      "Puedes controlar las cookies desde la configuración de tu navegador. Desactivarlas puede impedir que puedas iniciar sesión o conservar tu sesión.",
    ],
  },
  {
    title: "Aviso legal",
    content: [
      "Mochi proporciona el servicio tal como está disponible. No ofrecemos garantías sobre la disponibilidad, seguridad o contenido de los enlaces externos.",
      "La responsabilidad por los enlaces, perfiles y publicaciones recae en sus autores y en las leyes aplicables a cada jurisdicción.",
      "Estos documentos pueden actualizarse cuando cambie el servicio o sus obligaciones legales. La versión publicada en esta página será la versión vigente.",
    ],
  },
];

export default function Legal() {
  return (
    <>
      <PageTitle title="Políticas legales" />
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-indigo-200 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
              Mochi
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Políticas legales
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100">
              Información clara sobre cómo utilizamos y protegemos tu información y
              cómo se aplica el servicio de Mochi.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left">
            <div>
              <p className="font-semibold text-slate-900">¿Tienes dudas?</p>
              <p className="mt-1 text-sm text-slate-500">
                Puedes contactar con el equipo desde la sección de ayuda.
              </p>
            </div>
            <Link
              to="/help"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Ir al centro de ayuda
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
