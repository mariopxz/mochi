import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, SquarePen, Trash2 } from "lucide-react";

export default function SortableSeparatorItem({
  separator,
  isEditing,
  editingName,
  submitting,
  onStartEditing,
  onEditingChange,
  onSave,
  onCancel,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `separator:${separator.id}`,
    disabled: isEditing,
  });

  const verticalTransform = transform
    ? { ...transform, x: 0 }
    : null;
  const style = {
    transform: CSS.Transform.toString(verticalTransform),
    transition,
  };

  if (isEditing) {
    return (
      <article
        ref={setNodeRef}
        style={style}
        className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm"
      >
        <form onSubmit={onSave} className="flex flex-col gap-3">
          <span className="block text-xs font-semibold tracking-wide text-violet-700">
            Nombre del separador
          </span>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={editingName}
              onChange={(event) => onEditingChange(event.target.value)}
              required
              maxLength={80}
              autoFocus
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="group relative w-full min-w-0 touch-none select-none overflow-hidden rounded-2xl border border-dashed border-violet-300 bg-violet-50/70 px-4 py-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reordenar separador ${separator.name}`}
          className="cursor-grab touch-none rounded-lg p-1 text-violet-400 transition hover:bg-violet-100 hover:text-violet-700 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1 items-center gap-3">

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-violet-900">
                {separator.name}
              </p>
            </div>
            <p className=" text-xs text-violet-500">
              Separador de contenido
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onStartEditing(separator)}
            className="rounded-lg p-2 text-violet-700 transition hover:bg-violet-100 cursor-pointer"
            aria-label="Editar separador"
          >
            <SquarePen className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={separator.id === undefined || separator.id === null}
            onClick={() => separator.id !== undefined && separator.id !== null && onDelete(separator)}
            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Eliminar separador"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
