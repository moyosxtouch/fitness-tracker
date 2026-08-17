export default function PerformanceBadge({ performance }) {
  const styles = {
    Óptimo: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
    Regular: "border-amber-500/30 bg-amber-500/15 text-amber-400",
    Fallido: "border-red-500/30 bg-red-500/15 text-red-400",
    Descanso: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[performance] ?? "border-zinc-700 bg-zinc-800 text-zinc-300"
      }`}
    >
      {performance || "Sin registro"}
    </span>
  );
}
