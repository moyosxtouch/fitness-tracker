import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  const styles = {
    success: {
      container: "border-emerald-500/30 bg-emerald-950 text-emerald-100",
      icon: <CheckCircle2 size={21} className="text-emerald-400" />,
    },

    error: {
      container: "border-red-500/30 bg-red-950 text-red-100",
      icon: <XCircle size={21} className="text-red-400" />,
    },

    info: {
      container: "border-sky-500/30 bg-sky-950 text-sky-100",
      icon: <Info size={21} className="text-sky-400" />,
    },
  };

  const currentStyle = styles[toast.type] ?? styles.info;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] w-[calc(100%-2.5rem)] max-w-sm">
      <div
        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl ${currentStyle.container}`}
      >
        <div className="mt-0.5 shrink-0">{currentStyle.icon}</div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">{toast.title}</p>

          {toast.message && (
            <p className="mt-1 text-sm opacity-80">{toast.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-white/10 hover:opacity-100"
          aria-label="Cerrar notificación"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
