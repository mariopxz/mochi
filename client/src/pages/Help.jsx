import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe } from "../services/api";
import { useAuth } from "../context/useAuth";

export default function Help() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [{ data: userData }] = await Promise.all([getMe()]);
        setUserData(userData);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <p className="text-xl font-bold text-indigo-600">mochi 🍡</p>

            <p className="text-sm text-slate-500">
              Gestiona los links de tu perfil
            </p>
          </Link>
          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={handleMenuClick}
              className="flex  flex-row items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer"
            >
              {userData?.avatar ? (
                <img
                  src={userData?.avatar}
                  alt="avatar"
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xl text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <div
              ref={menuRef}
              className={`absolute top-0 right-0 mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg transition-all duration-200 
              ${
                menuOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div
                className={`flex flex-col gap-3 w-60 transition-all duration-200 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              >
                <div className="flex flex-row items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600">
                  <div className="flex flex-col items-start">
                    <p className="text-sm text-slate-500">{userData?.name}</p>
                    <p className="text-xs text-slate-400">{userData?.email}</p>
                  </div>

                  {userData?.avatar ? (
                    <img
                      src={userData?.avatar}
                      alt="avatar"
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xl text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <hr className="border-slate-200" />
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className={`flex flex-row items-center gap-2 text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer transition-all duration-400 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#45556c"
                  >
                    <path
                      d="M5 20V19C5 15.134 8.13401 12 12 12V12C15.866 12 19 15.134 19 19V20"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  Account settings
                </Link>
                <Link
                  to="/help"
                  onClick={() => setMenuOpen(false)}
                  className={`flex flex-row items-center gap-2 text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer transition-all duration-600 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#45556c"
                  >
                    <path
                      d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M12 18.01L12.01 17.9989"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  Help center
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex flex-row items-center gap-2 text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer transition-all duration-800 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#45556c"
                  >
                    <path
                      d="M12 12H19M19 12L16 15M19 12L16 9"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18"
                      stroke="#45556c"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            ¿Cómo podemos ayudarte?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Encuentra respuestas rápidas para crear, compartir y gestionar tu
            perfil de Mochi.
          </p>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="mt-7 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            <input
              type="search"
              placeholder="Busca una pregunta o tema"
              className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Buscar
            </button>
          </form>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">Temas frecuentes</h2>

          <p className="mt-1 text-sm text-slate-500">
            Todo lo necesario para empezar con tu perfil.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                🔗
              </span>

              <h3 className="mt-4 font-semibold text-slate-900">
                Gestionar mis links
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Añade, edita, elimina y reordena los enlaces de tu perfil.
              </p>
            </button>

            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                👤
              </span>

              <h3 className="mt-4 font-semibold text-slate-900">
                Editar mi perfil
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Actualiza tu nombre, biografía, avatar y username.
              </p>
            </button>

            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                📊
              </span>

              <h3 className="mt-4 font-semibold text-slate-900">
                Entender mis clics
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consulta cuántas veces han abierto cada uno de tus links.
              </p>
            </button>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Preguntas rápidas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Las dudas más habituales de Mochi.
            </p>

            <div className="mt-5 space-y-3">
              <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-medium text-slate-700">
                  ¿Cómo comparto mi perfil?
                  <span className="text-lg text-slate-400 transition group-open:rotate-90">
                    ›
                  </span>
                </summary>

                <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-500">
                  Tu perfil público está disponible en una URL como{" "}
                  <span className="font-medium text-indigo-600">
                    mochi.com/tu-username
                  </span>
                  . Copia esa dirección y compártela donde quieras.
                </p>
              </details>

              <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-medium text-slate-700">
                  ¿Puedo cambiar mi username?
                  <span className="text-lg text-slate-400 transition group-open:rotate-90">
                    ›
                  </span>
                </summary>

                <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-500">
                  Sí. Ve a{" "}
                  <span className="font-medium text-slate-700">
                    Account settings
                  </span>{" "}
                  desde el menú de tu avatar. Recuerda que al cambiarlo también
                  cambiará la URL de tu perfil público.
                </p>
              </details>

              <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-medium text-slate-700">
                  ¿Por qué no se ve mi avatar?
                  <span className="text-lg text-slate-400 transition group-open:rotate-90">
                    ›
                  </span>
                </summary>

                <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-500">
                  Si todavía no has añadido una imagen, Mochi mostrará la
                  primera letra de tu username como avatar. Puedes subir o
                  cambiar tu foto desde los ajustes de tu cuenta.
                </p>
              </details>
            </div>
          </div>

          <aside className="rounded-2xl bg-indigo-600 p-6 text-white">
            <p className="text-3xl">🍡</p>

            <h2 className="mt-4 text-xl font-bold">
              ¿No encuentras la respuesta?
            </h2>

            <p className="mt-2 text-sm leading-6 text-indigo-100">
              Envía tu duda y te ayudaremos a seguir construyendo tu perfil.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
            >
              Contactar con soporte
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
