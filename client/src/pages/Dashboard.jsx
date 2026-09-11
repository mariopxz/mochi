import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  createLink,
  deleteLink,
  getLinks,
  reorderLinks,
  updateLink,
  getMe,
} from "../services/api";
import SortableLinkItem from "../components/SortableLinkItem";
import { useAuth } from "../context/useAuth";

const emptyLink = { title: "", url: "" };

function normaliseUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState(emptyLink);
  const [editingId, setEditingId] = useState(null);
  const [editingLink, setEditingLink] = useState(emptyLink);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [{ data: userData }, { data: links }] = await Promise.all([
          getMe(),
          getLinks(),
        ]);

        setUserData(userData);
        setLinks(links);
      } catch (err) {
        setError(
          err.response?.data?.message || "No se pudieron cargar tus links.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

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

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = { ...newLink, url: normaliseUrl(newLink.url.trim()) };
      const { data } = await createLink(payload);
      setLinks((current) => [...current, data]);
      setNewLink(emptyLink);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el link.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (link) => {
    setEditingId(link.id);
    setEditingLink({ title: link.title, url: link.url });
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...editingLink,
        url: normaliseUrl(editingLink.url.trim()),
      };
      const { data } = await updateLink(editingId, payload);
      setLinks((current) =>
        current.map((link) =>
          String(link.id) === String(editingId) ? { ...link, ...data } : link,
        ),
      );
      setEditingId(null);
      setEditingLink(emptyLink);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el link.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Quieres eliminar este link? Esta acción no se puede deshacer.",
      )
    )
      return;

    setError("");
    try {
      await deleteLink(id);
      setLinks((current) =>
        current.filter((link) => String(link.id) !== String(id)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo eliminar el link.");
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((link) => link.id === active.id);
    const newIndex = links.findIndex((link) => link.id === over.id);

    const previousLinks = links;
    const updatedLinks = arrayMove(links, oldIndex, newIndex);

    // Actualizamos la interfaz inmediatamente
    setLinks(updatedLinks);
    setError("");

    try {
      const linksWithPositions = updatedLinks.map((link, position) => ({
        id: link.id,
        position,
      }));

      await reorderLinks(linksWithPositions);
    } catch (err) {
      // Si la base de datos no se actualiza, volvemos al orden anterior.
      setLinks(previousLinks);
      setError(
        err.response?.data?.message ||
          "No se pudo guardar el nuevo orden de los links.",
      );
    }
  };

  const previewLinks = links.map((link) => (
    <a
      key={link.id}
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow"
    >
      {link.title}
    </a>
  ));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xl font-bold text-indigo-600">mochi 🍡</p>
            <p className="text-sm text-slate-500">
              Gestiona los links de tu perfil
            </p>
          </div>
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
            
            <div ref={menuRef} className={`absolute top-0 right-0 mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg transition-all duration-200 
              ${menuOpen 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-95 pointer-events-none"}`}>
            <div className={`flex flex-col gap-3 w-60 transition-all duration-200 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
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
              <button
                className={`flex flex-row items-center gap-2 text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer transition-all duration-400 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              >
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#45556c"><path d="M5 20V19C5 15.134 8.13401 12 12 12V12C15.866 12 19 15.134 19 19V20" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Account settings
              </button>
              <button
                className={`flex flex-row items-center gap-2 text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer transition-all duration-600 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              >
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#45556c"><path d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 18.01L12.01 17.9989" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Help center
              </button>
              <button
                onClick={handleLogout}
                className={`flex flex-row items-center gap-2 text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer transition-all duration-800 ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              >
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#45556c"><path d="M12 12H19M19 12L16 15M19 12L16 9" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18" stroke="#45556c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Hola, {userData?.name} 👋</h1>
            <p className="mt-1 text-sm text-slate-500">
              Añade, edita y organiza los enlaces que compartirás.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold">Añadir un link</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={newLink.title}
                onChange={(event) =>
                  setNewLink({ ...newLink, title: event.target.value })
                }
                placeholder="Título (ej. Mi portfolio)"
                required
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={(event) =>
                  setNewLink({ ...newLink, url: event.target.value })
                }
                placeholder="https://ejemplo.com"
                required
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              disabled={submitting}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Añadir link"}
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="font-semibold">Tus links ({links.length})</h2>
            {loading ? (
              <p className="text-sm text-slate-500">Cargando links...</p>
            ) : links.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Aún no tienes links. Añade el primero arriba.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={links.map((link) => link.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {links.map((link) => (
                      <SortableLinkItem
                        key={link.id}
                        link={link}
                        isEditing={editingId === link.id}
                        editingLink={editingLink}
                        submitting={submitting}
                        onStartEditing={startEditing}
                        onEditingChange={setEditingLink}
                        onSave={handleUpdate}
                        onCancel={() => setEditingId(null)}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </section>

        <aside className="lg:top-6 lg:self-start">
          <p className="mb-3 text-sm font-medium text-slate-500">
            VISTA PREVIA
          </p>
          <div className="rounded-[2rem] bg-gradient-to-b from-indigo-100 to-violet-50 p-3 shadow-xl ring-8 ring-slate-800">
            <div className="min-h-[540px] rounded-[1.5rem] bg-slate-50 px-5 py-12">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white">
                  {user?.username?.[0]?.toUpperCase() || "M"}
                </div>
                <p className="mt-3 font-semibold">@{user?.username}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Tus links, en un solo lugar.
                </p>
              </div>
              <div className="space-y-3">{previewLinks}</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
