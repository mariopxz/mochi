import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, updateProfile } from "../services/api";
import { useAuth } from "../context/useAuth";

export default function Account() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    bio: "",
    avatar: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [{ data: userData }] = await Promise.all([getMe()]);
        setUserData(userData);
        setProfileForm({
          name: userData.name || "",
          username: userData.username || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
        });
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

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile(profileForm);

      setUserData((current) => ({
        ...current,
        ...profileForm,
      }));

      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo actualizar el perfil.",
      );
    } finally {
      setSaving(false);
    }
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
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            ACCOUNT SETTINGS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Configuración de cuenta
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Actualiza la información que verán las personas que visiten tu
            perfil.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleProfileSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profileForm.avatar ? (
              <img
                src={profileForm.avatar}
                alt="Vista previa de avatar"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-50"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-medium text-white ring-4 ring-indigo-50">
                {profileForm.username?.charAt(0).toUpperCase() || "M"}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Perfil público
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Esta información aparecerá en tu página de Mochi.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nombre visible
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Mario López"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                  @
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  placeholder="mariopxz"
                  required
                  className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Tu perfil será: /{profileForm.username || "username"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Biografía
            </label>

            <textarea
              id="bio"
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              maxLength={160}
              rows={4}
              placeholder="Cuéntale algo a las personas que visiten tu perfil."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {profileForm.bio.length}/160
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="avatar"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              URL del avatar
            </label>

            <input
              id="avatar"
              name="avatar"
              type="url"
              value={profileForm.avatar}
              onChange={handleProfileChange}
              placeholder="https://ejemplo.com/mi-avatar.jpg"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              De momento puedes pegar una URL de imagen. Más adelante
              sustituiremos este campo por subida directa a Cloudinary.
            </p>
          </div>

          <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Correo electrónico
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tu correo actual es {userData?.email}.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nuevo correo electrónico
              </label>

              <input
                type="email"
                placeholder="nuevo@email.com"
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
              />
            </div>

            <button
              type="button"
              disabled
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-400"
            >
              Cambiar correo
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Disponible cuando creemos el endpoint seguro para actualizar el
            email.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900">Contraseña</h2>

          <p className="mt-1 text-sm text-slate-500">
            Protege tu cuenta con una contraseña única y segura.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input
              type="password"
              placeholder="Contraseña actual"
              disabled
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              disabled
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
            />
          </div>

          <button
            type="button"
            disabled
            className="mt-4 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-400"
          >
            Actualizar contraseña
          </button>

          <p className="mt-3 text-xs text-slate-400">
            Disponible cuando creemos el endpoint para cambiar contraseña.
          </p>
        </section>
      </div>
    </main>
  );
}
