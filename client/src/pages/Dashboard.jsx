import { useEffect, useState } from "react";
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
import { createLink, deleteLink, getLinks, reorderLinks, updateLink } from "../services/api";
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
    const loadLinks = async () => {
      try {
        const { data } = await getLinks();
        setLinks(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "No se pudieron cargar tus links.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      const linksWithPositions = updatedLinks.map((link, position) =>({
        id: link.id,
        position,
      }));

      await reorderLinks(linksWithPositions);
    } catch (err) {
      // Si la base de datos no se actualiza, volvemos al orden anterior.
      setLinks(previousLinks);
      setError(err.response?.data?.message || "No se pudo guardar el nuevo orden de los links.")
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
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Hola, {user?.username} 👋</h1>
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

        <aside className="lg:sticky lg:top-6 lg:self-start">
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
