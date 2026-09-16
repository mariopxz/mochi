import { Link } from "react-router-dom";
import ProfilePreview from "./ProfilePreview";

const demoProfile = {
  name: "Clara Soler",
  username: "clarasoler",
  bio: "Diseñadora digital y amante de las ideas que conectan personas. ✦",
  avatar:
    "https://i.pinimg.com/736x/62/81/86/6281868b01a8ae0ce4c91643b11aa0be.jpg",
  links: [
    {
      title: "Mi portfolio",
    },
    {
      title: "Último proyecto — Nébula Studio",
    },
    {
      title: "Instagram",
    },
  ],
};

export default function AuthLayout({ title, description, children, footer }) {
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

          <p className="text-xs text-slate-400">© 2026 mochi 🍡</p>
        </section>

        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:block">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />

          <div className="relative flex h-full items-center justify-center p-12">
            <div className="relative w-full max-w-sm">
              <div className="absolute z-10 -left-10 top-16 rounded-2xl bg-white p-4 shadow-xl">
                <p className="text-xs font-medium text-slate-500">
                  Tu URL personal
                </p>

                <p className="mt-1 text-sm font-bold text-indigo-600">
                  mochi/{demoProfile.username}
                </p>
              </div>

              <div className="rounded-[2.5rem] border-[9px] border-slate-900 bg-slate-900 p-2 shadow-2xl">
                <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

                <ProfilePreview profile={demoProfile} links={demoProfile.links} />
              </div>

              <div className="absolute -bottom-7 -right-8 rounded-2xl bg-white p-4 shadow-xl">
                <p className="text-xs font-medium text-slate-500">
                  Comparte todo desde
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
