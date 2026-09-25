import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { clickLink, getProfile } from "../services/api";

export default function Profile() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reservedRoute, setReservedRoute] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setNotFound(false);
      setReservedRoute(false);
      setError("");

      try {
        const { data } = await getProfile(username);

        setUser(data.user);
        setLinks(data.links);
      } catch (err) {
        if (err.response?.data?.code === 'USER-NOT-FOUND') {
          setNotFound(true);
        } else if (err.response?.data?.code === 'ROUTE-RESERVED') {
          setReservedRoute(true);
        } else {
          setError(err.response?.data?.message || "No se pudo cargar el perfil.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleLinkClick = (id) => {
    clickLink(id).catch(() => undefined); // Ignorar errores al registrar el click
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Cargando perfil...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm text-center">
          <p className="text-5xl">🍡</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Usuario no encontrado
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            El perfil @{username} no existe o ya no está disponible.
          </p>
        </div>
      </main>
    );
  }

  if (reservedRoute) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm text-center">
          <p className="text-5xl">🍡</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Ruta reservada
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            La ruta {username} no está disponible.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-slate-50 to-white px-4 py-10 sm:px-6">
    <div className="mx-auto w-full max-w-md">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-indigo-100/60">
        <div className="h-32 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />

        <div className="-mt-12 px-5 pb-7 text-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`Avatar de ${user.name || user.username}`}
              className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-4xl font-bold text-white shadow-lg">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {user.name || user.username}
          </h1>

          <p className="mt-1 text-sm font-medium text-indigo-600">
            @{user.username}
          </p>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {user.bio || "Todavía no ha añadido una biografía."}
          </p>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {links.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500 shadow-sm">
            Este perfil todavía no tiene links.
          </p>
        ) : (
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleLinkClick(link.id)}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="min-w-0 flex-1 text-center">
                {link.title}
              </span>

              <span className="ml-3 text-lg text-indigo-500 transition group-hover:translate-x-1">
                ↗
              </span>
            </a>
          ))
        )}
      </section>

      <footer className="mt-8 text-center text-xs text-slate-400">
        Hecho con <span className="font-medium text-indigo-600">mochi 🍡</span>
      </footer>
    </div>
  </main>
);
}
