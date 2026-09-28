import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfilePreview from "../components/ProfilePreview";
import PageTitle from "../components/PageTitle";
import { demoProfile } from "../constants/demoProfile";

const features = [
  {
    icon: "🔗",
    title: "Todos tus enlaces",
    description:
      "Comparte tu portfolio, redes, proyectos y cualquier enlace desde una sola URL.",
  },
  {
    icon: "↕️",
    title: "Ordénalos a tu manera",
    description:
      "Arrastra y suelta tus enlaces para decidir qué debe ver primero tu audiencia.",
  },
  {
    icon: "📊",
    title: "Entiende tus clics",
    description:
      "Consulta qué enlaces interesan más a las personas que visitan tu perfil.",
  },
];

export default function Home() {
  return (
    <>
      <PageTitle title="Tu espacio en internet" />
      <HomeContent />
    </>
  );
}

function HomeContent() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleClaimUsername = (event) => {
    event.preventDefault();

    const cleanUsername = username.trim().replace(/^@/, "");

    if (!cleanUsername) return;

    navigate(`/register?username=${encodeURIComponent(cleanUsername)}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          to="/"
          className="rounded-lg text-xl font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          mochi 🍡
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
          >
            Crear perfil
          </Link>
        </nav>
      </header>

      <section className="relative">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-indigo-100 via-violet-50 to-slate-50" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Tu espacio en internet, simplificado
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Todos tus enlaces.
              <span className="block text-indigo-600">Un solo lugar.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Mochi te ayuda a crear un perfil personal para compartir todo lo
              que haces, sin perder a tu audiencia entre enlaces.
            </p>

            <form
              onSubmit={handleClaimUsername}
              className="mt-8 max-w-xl rounded-2xl bg-indigo-600 p-3 shadow-xl shadow-indigo-200"
            >
              <p className="mb-3 px-1 text-sm font-medium text-indigo-100">
                Reclama tu perfil gratuito
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 overflow-hidden rounded-xl bg-white">
                  <span className="flex items-center bg-indigo-50 px-3 text-sm font-medium text-indigo-500">
                    mochiapp.es/
                  </span>

                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="tu-username"
                    aria-label="Elige tu username"
                    className="min-w-0 flex-1 px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover:cursor-pointer"
                >
                  Crear perfil gratis
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              <span>✓ Sin tarjeta</span>
              <span>✓ Configuración rápida</span>
              <a
                href="#como-funciona"
                className="font-medium text-indigo-600 hover:underline"
              >
                Ver cómo funciona
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Sin ningúna suscripción. Crea tu perfil en unos minutos.
            </p>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="relative mx-auto rounded-[2.7rem] border-[9px] border-slate-900 bg-slate-900 p-2 shadow-2xl shadow-indigo-200">
              <div className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

              <ProfilePreview profile={demoProfile} links={demoProfile.links} />
            </div>

            <div className="relative -mt-8 -ml-2 w-fit rounded-2xl border border-indigo-100 bg-white p-4 shadow-xl md:-ml-18 md:-mt-16">
              <p className="text-xs font-medium text-slate-500">
                Tus enlaces están creciendo
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span className="h-4 w-2 rounded-t bg-indigo-200" />
                <span className="h-7 w-2 rounded-t bg-indigo-300" />
                <span className="h-5 w-2 rounded-t bg-indigo-300" />
                <span className="h-10 w-2 rounded-t bg-indigo-500" />
                <span className="h-8 w-2 rounded-t bg-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">1 perfil</p>
            <p className="mt-1 text-sm text-slate-500">para compartir todo</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              Enlaces ilimitados
            </p>
            <p className="mt-1 text-sm text-slate-500">
              organiza lo que importa
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">Clics reales</p>
            <p className="mt-1 text-sm text-slate-500">
              entiende a tu audiencia
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-indigo-600">
            TODO LO QUE NECESITAS
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Menos enlaces perdidos. Más conexiones.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
            Una experiencia sencilla para ti y clara para quienes visitan tu
            perfil.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                {feature.icon}
              </span>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="como-funciona"
        className="bg-slate-900 px-4 py-20 text-white sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-indigo-300">
              EMPIEZA EN MINUTOS
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Tu perfil público, listo para compartir.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <p className="text-sm font-semibold text-indigo-300">01</p>

              <h3 className="mt-5 text-lg font-semibold">Crea tu cuenta</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Elige tu nombre de usuario y consigue una URL personal para compartir.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <p className="text-sm font-semibold text-indigo-300">02</p>

              <h3 className="mt-5 text-lg font-semibold">Añade tus enlaces</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Incluye tus redes, trabajo, contenido o cualquier enlace que
                quieras destacar.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <p className="text-sm font-semibold text-indigo-300">03</p>

              <h3 className="mt-5 text-lg font-semibold">Compártelo</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Añade tu URL de Mochi a tus perfiles y descubre qué interesa a
                tu audiencia.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-14 text-center shadow-xl shadow-indigo-200 sm:px-12">
          <p className="text-sm font-semibold text-indigo-100">
            TU ESPACIO, TU HISTORIA
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Haz que cada enlace cuente.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
            Crea tu perfil de Mochi, reúne todo lo que haces y compártelo con el
            mundo desde una única URL.
          </p>

          <Link
            to="/register"
            className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
          <p className="font-semibold text-indigo-600">mochi 🍡</p>

          <p>Un lugar simple para compartir lo que importa.</p>

          <Link
            to="/login"
            className="font-medium text-slate-600 transition hover:text-indigo-600"
          >
            Iniciar sesión
          </Link>
        </div>
      </footer>
    </main>
  );
}
