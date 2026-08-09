import { useEffect, useMemo, useState } from "react";
import {
  CalendarSearch,
  ChevronRight,
  Moon,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

export default function HistoryCard({ records, onEditRecord, onDeleteRecord }) {
  const [monthFilter, setMonthFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");

  const [selectedRecord, setSelectedRecord] = useState(null);

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

  function handleDelete(record) {
    const confirmed = window.confirm(
      `¿Eliminar el registro del ${formatDate(record.date)}?`,
    );

    if (!confirmed) {
      return;
    }

    onDeleteRecord(record.id);
    setSelectedRecord(null);
  }

  function handleEdit(record) {
    setSelectedRecord(null);
    onEditRecord(record);
  }

  const filtersAreActive = monthFilter !== "all" || performanceFilter !== "all";

  if (records.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <CalendarSearch size={28} className="text-lime-400" />

          <h2 className="text-2xl font-bold">Historial</h2>
        </div>

        <p className="mt-4 text-zinc-400">Todavía no tienes registros.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarSearch size={28} className="text-lime-400" />

          <div>
            <h2 className="text-2xl font-bold">Historial</h2>

            <p className="mt-1 text-sm text-zinc-400">
              Consulta tus registros y abre cualquiera para ver todos sus
              detalles.
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
        <>
          {/* DESKTOP */}
          <div className="hidden overflow-hidden rounded-2xl border border-zinc-800 md:block">
            <table className="w-full">
              <thead className="bg-zinc-950">
                <tr className="text-left">
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader>Calorías</TableHeader>
                  <TableHeader>Peso</TableHeader>
                  <TableHeader>Rendimiento</TableHeader>

                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                    Detalles
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-zinc-800 transition hover:bg-zinc-800/40"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      {formatDate(record.date)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {Number(record.calories).toLocaleString("es-MX")} kcal
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {Number(record.weight).toFixed(1)} kg
                    </td>

                    <td className="px-4 py-4">
                      <PerformanceBadge performance={record.performance} />
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                      >
                        Ver
                        <ChevronRight size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MÓVIL */}
          <div className="grid gap-3 md:hidden">
            {filteredRecords.map((record) => (
              <MobileRecordCard
                key={record.id}
                record={record}
                onOpen={() => setSelectedRecord(record)}
              />
            ))}
          </div>
        </>
      )}

      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={() => handleEdit(selectedRecord)}
          onDelete={() => handleDelete(selectedRecord)}
        />
      )}
    </section>
  );
}

function MobileRecordCard({ record, onOpen }) {
  const hasSleep = isValidNumber(record.sleepHours);

  const hasRecovery = isValidNumber(record.recovery);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{formatDate(record.date)}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <div>
              <p className="text-xs text-zinc-500">Calorías</p>

              <p className="font-bold">
                {Number(record.calories).toLocaleString("es-MX")} kcal
              </p>
            </div>

            <div>
              <p className="text-xs text-zinc-500">Peso</p>

              <p className="font-bold">{Number(record.weight).toFixed(1)} kg</p>
            </div>
          </div>
        </div>

        <PerformanceBadge performance={record.performance} />
      </div>

      {(hasSleep || hasRecovery || record.notes) && (
        <div className="mt-4 border-t border-zinc-800 pt-3">
          {(hasSleep || hasRecovery) && (
            <div className="mb-2 flex flex-wrap gap-3 text-xs text-zinc-400">
              {hasSleep && (
                <span className="inline-flex items-center gap-1">
                  <Moon size={14} className="text-indigo-400" />
                  {Number(record.sleepHours).toFixed(1)}h
                </span>
              )}

              {hasRecovery && (
                <span>
                  Recuperación{" "}
                  <strong className={getRecoveryColor(Number(record.recovery))}>
                    {record.recovery}/10
                  </strong>
                </span>
              )}
            </div>
          )}

          {record.notes && (
            <p className="line-clamp-1 text-sm text-zinc-500">{record.notes}</p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-lime-400">
        Ver detalles
        <ChevronRight size={15} />
      </div>
    </button>
  );
}

function RecordDetailModal({ record, onClose, onEdit, onDelete }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-800 p-5">
          <div>
            <p className="text-sm text-zinc-500">Registro diario</p>

            <h3 className="mt-1 text-2xl font-bold">
              {formatLongDate(record.date)}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBox
              label="Calorías"
              value={`${Number(record.calories).toLocaleString("es-MX")} kcal`}
            />

            <DetailBox
              label="Peso"
              value={`${Number(record.weight).toFixed(1)} kg`}
            />

            <DetailBox
              label="Rendimiento"
              value={record.performance || "Sin registro"}
            />

            <DetailBox
              label="Sueño"
              value={
                isValidNumber(record.sleepHours)
                  ? `${Number(record.sleepHours).toFixed(1)} h`
                  : "Sin dato"
              }
            />

            <DetailBox
              label="Recuperación"
              value={
                isValidNumber(record.recovery)
                  ? `${Number(record.recovery)}/10`
                  : "Sin dato"
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Notas
            </p>

            <p className="mt-2 leading-relaxed text-zinc-300">
              {record.notes || "Sin notas registradas."}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 font-semibold text-sky-400 transition hover:bg-sky-500/20"
            >
              <Pencil size={18} />
              Editar
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>

      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-sm font-medium text-zinc-400">{children}</th>
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
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[performance] ?? "border-zinc-700 bg-zinc-800 text-zinc-300"
      }`}
    >
      {performance || "Sin registro"}
    </span>
  );
}

function getRecoveryColor(recovery) {
  if (recovery >= 8) {
    return "text-emerald-400";
  }

  if (recovery >= 5) {
    return "text-amber-400";
  }

  return "text-red-400";
}

function isValidNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
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
