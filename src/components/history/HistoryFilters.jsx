import { RotateCcw } from "lucide-react";
import { formatMonth } from "./historyUtils";

export default function HistoryFilters({
  availableMonths,
  monthFilter,
  performanceFilter,
  onMonthChange,
  onPerformanceChange,
  onClear,
}) {
  const filtersAreActive = monthFilter !== "all" || performanceFilter !== "all";

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Mes
        </span>

        <select
          value={monthFilter}
          onChange={(event) => onMonthChange(event.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
        >
          <option value="all">Todos los meses</option>

          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Rendimiento
        </span>

        <select
          value={performanceFilter}
          onChange={(event) => onPerformanceChange(event.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
        >
          <option value="all">Todos</option>
          <option value="Óptimo">Óptimo</option>
          <option value="Regular">Regular</option>
          <option value="Fallido">Fallido</option>
          <option value="Descanso">Descanso</option>
        </select>
      </label>

      <button
        type="button"
        onClick={onClear}
        disabled={!filtersAreActive}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCcw size={18} />
        Limpiar
      </button>
    </div>
  );
}
