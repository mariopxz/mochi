export default function ProfilePreview({
  profile,
  links = [],
  maxLinks = 3,
}) {
  const name = profile?.name || profile?.username || "Nombre";
  const username = profile?.username || "username";
  const bio =
    profile?.bio ||
    "Aún no tienes bio. Escribe algo que te guste y que te haga sentir bien.";

  const avatarInitial = name.charAt(0).toUpperCase();
  const visibleLinks = links.slice(0, maxLinks);

  return (
    <section className="relative overflow-hidden rounded-[1.7rem] bg-white shadow-indigo-200/60">
      <div className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
      <div className="h-24 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="-mt-10 px-5 pb-6 text-center">
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={`Avatar de ${name}`}
            className="mx-auto h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
          />
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-3xl font-bold text-white shadow-lg">
            {avatarInitial}
          </div>
        )}

        <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
          {name}
        </h3>

        <p className="mt-1 text-sm font-medium text-indigo-600">
          @{username}
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {bio}
        </p>

        <div className="mt-6 space-y-2.5">
          {visibleLinks.length > 0 ? (
            visibleLinks.map((link, index) => (
              <div
                key={link.id || link.title || index}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
              >
                <span className="min-w-0 flex-1 text-center">
                  {link.title}
                </span>

                <span className="ml-3 text-indigo-500">↗</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 border border-slate-200 bg-white px-4 py-3 text-center rounded-lg">
              Aún no tienes links. Añade tu primer link en el dashboard.
            </p>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Hecho con <span className="font-medium text-indigo-600">mochi 🍡</span>
        </p>
      </div>
    </section>
  );
}