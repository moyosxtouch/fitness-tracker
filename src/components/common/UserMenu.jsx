import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  const displayName = user.displayName || "Usuario";
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 pr-2 text-sm transition hover:border-lime-400"
        aria-expanded={open}
        aria-label="Abrir menú de usuario"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 font-bold text-black">
            {initial}
          </span>
        )}

        <span className="hidden max-w-32 truncate font-semibold text-zinc-200 xl:block">
          {displayName}
        </span>

        <ChevronDown
          size={15}
          className={`hidden text-zinc-500 transition xl:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
          <div className="border-b border-zinc-800 p-4">
            <p className="truncate font-semibold">{displayName}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
