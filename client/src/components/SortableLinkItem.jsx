import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SquarePen, Trash } from 'lucide-react';

export default function SortableLinkItem({
  link,
  isEditing,
  editingLink,
  submitting,
  onStartEditing,
  onEditingChange,
  onSave,
  onCancel,
  onDelete
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: link.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {isEditing ? (
        <form onSubmit={onSave} className="space-y-3">
          <input
            value={editingLink.title}
            onChange={(event) => onEditingChange({
              ...editingLink,
              title: event.target.value
            })}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          <input
            type="url"
            value={editingLink.url}
            onChange={(event) => onEditingChange({
              ...editingLink,
              url: event.target.value
            })}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button 
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:cursor-pointer"
              >
                Cancelar
              </button>
            </div>
        </form>
      ) : (
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reordenar ${link.title}`}
            className="mt-1 cursor-grab touch-none rounded p-1 text-indigo-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          >
            ⋮⋮
          </button>

          <div className="min-w-0 flex-1">
            <p className="font-medium">{link.title}</p>

            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate text-sm text-indigo-600 hover:underline"
            >
              {link.url}
            </a>
            <p className="mt-2 text-xs text-slate-200">
              {link.clicks ?? 0} {(link.clicks ?? 0) === 1 ? "clic" : "clics"}
            </p>
          </div>

          <div className="flex min-w-0 shrink-0 gap-1 text-sm">
            <button
              type="button"
              onClick={() => onStartEditing(link)}
              className="rounded-lg px-1 py-1.5 text-slate-600 md:px-2 md:py-1.5 hover:bg-slate-100 hover:cursor-pointer"
            >
              <SquarePen className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(link.id)}
              className="rounded-lg px-1 py-1.5 text-red-600 md:px-2 md:py-1.5 hover:bg-red-50 hover:cursor-pointer"
            >
              <Trash className="h-4 w-4" />
            </button>
        </div>
      </div>
      )}
    </article>
  )
  }