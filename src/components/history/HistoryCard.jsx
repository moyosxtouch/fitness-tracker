import { useMemo, useState } from "react";
import { CalendarSearch, Pencil, RotateCcw, Trash2 } from "lucide-react";

export default function HistoryCard({ records, onEditRecord, onDeleteRecord }) {
  const [monthFilter, setMonthFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  );

  const availableMonths = useMemo(() => {
    const months = new Set(
      sortedRecords.map((record) => record.date.slice(0, 7)),
    );

    return [...months].sort((a, b) => b.localeCompare(a));
  }, [sortedRecords]);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter((record) => {
      const matchesMonth =
        monthFilter === "all" || record.date.startsWith(monthFilter);

      const matchesPerformance =
        performanceFilter === "all" || record.performance === performanceFilter;

      return matchesMonth && matchesPerformance;
    });
  }, [sortedRecords, monthFilter, performanceFilter]);

  function clearFilters() {
    setMonthFilter("all");
    setPerformanceFilter("all");
  }

  const filtersAreActive = monthFilter !== "all" || performanceFilter !== "all";

  if (records.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold">Historial</h2>

        <p className="mt-4 text-zinc-400">Todavía no tienes registros.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarSearch className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Historial</h2>

            <p className="mt-1 text-sm text-zinc-400">
              Consulta, edita o elimina tus registros.
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-zinc-400">Registros mostrados</p>

          <p className="text-xl font-bold">{filteredRecords.length}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Mes
          </span>

          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
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
            onChange={(event) => setPerformanceFilter(event.target.value)}
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
          onClick={clearFilters}
          disabled={!filtersAreActive}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={18} />
          Limpiar
        </button>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <p className="font-semibold">No hay registros con esos filtros.</p>

          <p className="mt-2 text-sm text-zinc-400">
            Cambia el mes o el rendimiento seleccionado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <TableHeader>Fecha</TableHeader>

                <TableHeader>Calorías</TableHeader>

                <TableHeader>Peso</TableHeader>

                <TableHeader>Rendimiento</TableHeader>

                <TableHeader>Notas</TableHeader>

                <th className="px-3 py-3 text-right text-sm font-medium text-zinc-400">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-zinc-800 transition last:border-b-0 hover:bg-zinc-800/30"
                >
                  <td className="whitespace-nowrap px-3 py-4">
                    {formatDate(record.date)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {Number(record.calories).toLocaleString("es-MX")} kcal
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {Number(record.weight).toFixed(1)} kg
                  </td>

                  <td className="px-3 py-4">
                    <PerformanceBadge performance={record.performance} />
                  </td>

                  <td
                    className="max-w-xs truncate px-3 py-4 text-zinc-400"
                    title={record.notes || "Sin notas"}
                  >
                    {record.notes || "Sin notas"}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditRecord(record)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-sky-400 transition hover:bg-sky-500/10"
                        aria-label={`Editar registro del ${record.date}`}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `¿Eliminar el registro del ${formatDate(
                              record.date,
                            )}?`,
                          );

                          if (confirmed) {
                            onDeleteRecord(record.id);
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                        aria-label={`Eliminar registro del ${record.date}`}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-3 py-3 text-sm font-medium text-zinc-400">{children}</th>
  );
}

function PerformanceBadge({ performance }) {
  const styles = {
    Óptimo: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",

    Regular: "border-amber-500/30 bg-amber-500/15 text-amber-400",

    Fallido: "border-red-500/30 bg-red-500/15 text-red-400",

    Descanso: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[performance] ?? "border-zinc-700 bg-zinc-800 text-zinc-300"
      }`}
    >
      {performance || "Sin registro"}
    </span>
  );
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  const formatted = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
