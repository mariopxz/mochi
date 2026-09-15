import { Link } from "react-router-dom";

export default function AuthLayout({
  title,
  description,
  children,
  footer,
}) {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
          <Link
            to="/"
            className="w-fit rounded-lg text-2xl font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            mochi 🍡
          </Link>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                TU ESPACIO EN INTERNET
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>

            <div className="mt-8">{children}</div>

            <div className="mt-7">{footer}</div>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 mochi 🍡
          </p>
        </section>

        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:block">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />

          <div className="relative flex h-full items-center justify-center p-12">
            <div className="relative w-full max-w-sm">
              <div className="absolute -left-10 top-16 rounded-2xl bg-white p-4 shadow-xl">
                <p className="text-xs font-medium text-slate-500">
                  Tu URL personal
                </p>

                <p className="mt-1 text-sm font-bold text-indigo-600">
                  mochi/marioreiares
                </p>
              </div>

              <div className="relative rounded-[2.5rem] border-[9px] border-slate-900 bg-slate-900 p-2 shadow-2xl">
                <div className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

                <div className="min-h-[510px] rounded-[2rem] bg-gradient-to-b from-violet-100 via-indigo-50 to-white px-6 py-14">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white ring-4 ring-white">
                      M
                    </div>

                    <p className="mt-4 text-lg font-bold text-slate-900">
                      Mario Reiares
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      @marioreiares
                    </p>
                  </div>

                  <div className="mt-9 space-y-3">
                    <div className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200">
                      Mi portfolio
                    </div>

                    <div className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200">
                      LinkedIn
                    </div>

                    <div className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200">
                      Último proyecto
                    </div>
                  </div>

                  <p className="mt-10 text-center text-xs text-slate-400">
                    Hecho con mochi 🍡
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-7 -right-8 rounded-2xl bg-white p-4 shadow-xl">
                <p className="text-xs font-medium text-slate-500">
                  Links compartidos
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-600">
                  1 perfil
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}