import { useEffect, useMemo, useState } from "react";
import { CalendarSearch, ChevronRight, Moon, RotateCcw } from "lucide-react";
import RecordDetailModal from "./RecordDetailModal";
import MobileRecordCard from "./MobileRecordCard";
import PerformanceBadge from "./PerformanceBadge";
import {
  formatDate,
  formatMonth,
  getRecoveryColor,
  isValidNumber,
} from "./historyUtils";
export default function HistoryCard({ records, onSaveRecord, onDeleteRecord }) {
  const [monthFilter, setMonthFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const RECORDS_PER_PAGE = 7;

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [monthFilter, performanceFilter]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / RECORDS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  const endIndex = startIndex + RECORDS_PER_PAGE;

  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
                  <TableHeader>Sueño</TableHeader>
                  <TableHeader>Recuperación</TableHeader>

                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                    Detalles
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedRecords.map((record) => (
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
                    <td className="whitespace-nowrap px-4 py-4">
                      {isValidNumber(record.sleepHours) ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Moon size={15} className="text-indigo-400" />
                          {Number(record.sleepHours).toFixed(1)} h
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {isValidNumber(record.recovery) ? (
                        <span
                          className={`font-semibold ${getRecoveryColor(
                            Number(record.recovery),
                          )}`}
                        >
                          {Number(record.recovery)}/10
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
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
            {paginatedRecords.map((record) => (
              <MobileRecordCard
                key={record.id}
                record={record}
                onOpen={() => {
                  setSelectedRecord(record);
                  setIsEditing(false);
                }}
              />
            ))}
          </div>
        </>
      )}
      {filteredRecords.length > RECORDS_PER_PAGE && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-5 sm:flex-row">
          <p className="text-sm text-zinc-500">
            Mostrando {startIndex + 1}–
            {Math.min(endIndex, filteredRecords.length)} de{" "}
            {filteredRecords.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="px-2 text-sm text-zinc-400">
              Página <strong className="text-white">{currentPage}</strong> de{" "}
              {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          isEditing={isEditing}
          onStartEdit={() => setIsEditing(true)}
          onCancelEdit={() => setIsEditing(false)}
          onClose={() => {
            setSelectedRecord(null);
            setIsEditing(false);
          }}
          onSave={(updatedRecord) => {
            onSaveRecord(updatedRecord);

            setSelectedRecord(updatedRecord);
            setIsEditing(false);
          }}
          onDelete={() => handleDelete(selectedRecord)}
        />
      )}
    </section>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-sm font-medium text-zinc-400">{children}</th>
  );
}

function formatLongDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
