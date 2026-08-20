import {
  Activity,
  BarChart3,
  Camera,
  History,
  PlusCircle,
  Settings,
} from "lucide-react";
import UserMenu from "./UserMenu";

const links = [
  {
    href: "#registro",
    label: "Registro",
    icon: PlusCircle,
  },
  {
    href: "#analisis",
    label: "Análisis",
    icon: BarChart3,
  },
  {
    href: "#progreso",
    label: "Progreso",
    icon: Activity,
  },
  {
    href: "#fotos",
    label: "Fotos",
    icon: Camera,
  },
  {
    href: "#historial",
    label: "Historial",
    icon: History,
  },
];

export default function AppHeader({ user, onOpenSettings, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <a href="#inicio" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-black">
            <Activity size={22} />
          </div>

          <div className="hidden sm:block">
            <p className="font-bold leading-tight">Fitness Tracker</p>

            <p className="text-xs text-zinc-500">Bitácora personal</p>
          </div>
        </a>

        <div className="flex min-w-0 items-center gap-2">
          <nav className="flex gap-1 overflow-x-auto">
            {links.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <Icon size={16} />

                <span className="hidden lg:inline">{label}</span>
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-lime-400 hover:text-white"
            aria-label="Abrir configuración"
          >
            <Settings size={17} />

            <span className="hidden md:inline">Configuración</span>
          </button>
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
