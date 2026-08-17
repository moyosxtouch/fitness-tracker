export default function HistoryPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalRecords,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-5 sm:flex-row">
      <p className="text-sm text-zinc-500">
        Mostrando {startIndex + 1}–{Math.min(endIndex, totalRecords)} de{" "}
        {totalRecords}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
