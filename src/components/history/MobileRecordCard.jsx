import { ChevronRight, Moon } from "lucide-react";
import PerformanceBadge from "./PerformanceBadge";
import { formatDate, getRecoveryColor, isValidNumber } from "./historyUtils";

export default function MobileRecordCard({ record, onOpen }) {
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
