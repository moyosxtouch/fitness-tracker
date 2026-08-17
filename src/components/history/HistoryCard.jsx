import { useEffect, useMemo, useState } from "react";
import { CalendarSearch } from "lucide-react";
import RecordDetailModal from "./RecordDetailModal";
import MobileRecordCard from "./MobileRecordCard";

import HistoryTable from "./HistoryTable";
import HistoryPagination from "./HistoryPagination";
import HistoryFilters from "./HistoryFilters";
import { formatDate } from "./historyUtils";
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
        <HistoryFilters
          availableMonths={availableMonths}
          monthFilter={monthFilter}
          performanceFilter={performanceFilter}
          onMonthChange={setMonthFilter}
          onPerformanceChange={setPerformanceFilter}
          onClear={clearFilters}
        />
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
          <HistoryTable
            records={paginatedRecords}
            onOpen={(record) => {
              setSelectedRecord(record);
              setIsEditing(false);
            }}
          />

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
      <HistoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={filteredRecords.length}
        onPageChange={setCurrentPage}
      />

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

function formatLongDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
