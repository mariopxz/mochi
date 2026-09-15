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
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <section className="text-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`Avatar de ${user.username}`}
              className="mx-auto h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-white"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-4xl font-bold text-white shadow-md ring-4 ring-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            @{user.username}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {user.bio || "Todavía no ha añadido una biografía."}
          </p>
        </section>

        <section className="mt-8 space-y-3">
          {links.length === 0 ? (
            <p className="rounded-xl bg-white px-4 py-3 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
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
                className="block w-full rounded-xl bg-white px-5 py-4 text-center text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {link.title}
              </a>
            ))
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Hecho con mochi 🍡
        </footer>
      </div>
    </main>
  );
}
