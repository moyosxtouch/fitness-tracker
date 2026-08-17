import { ChevronRight, Moon } from "lucide-react";
import PerformanceBadge from "./PerformanceBadge";
import { formatDate, getRecoveryColor, isValidNumber } from "./historyUtils";

export default function HistoryTable({ records, onOpen }) {
  return (
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
          {records.map((record) => (
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
                  onClick={() => onOpen(record)}
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
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-sm font-medium text-zinc-400">{children}</th>
  );
}
