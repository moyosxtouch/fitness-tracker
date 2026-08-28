import { useMemo, useState } from "react";
import { FileText, Printer } from "lucide-react";

import {
  calculateReportStats,
  filterRecordsByPeriod,
  formatReportDate,
} from "./reportUtils";

export default function ReportsCard({ records, settings, user }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const reportRecords = useMemo(
    () => filterRecordsByPeriod(records, startDate, endDate),
    [records, startDate, endDate],
  );

  const stats = useMemo(
    () => calculateReportStats(reportRecords),
    [reportRecords],
  );

  const periodLabel =
    startDate || endDate
      ? `${startDate ? formatReportDate(startDate) : "Inicio"} — ${
          endDate ? formatReportDate(endDate) : "Actualidad"
        }`
      : "Historial completo";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Reportes</h2>

            <p className="text-sm text-zinc-400">
              Genera un resumen de tu progreso y guárdalo como PDF.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          disabled={reportRecords.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Printer size={18} />
          Guardar como PDF
        </button>
      </div>

      <div className="no-print mb-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Desde</span>

          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Hasta</span>

          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>
      </div>

      <div
        id="fitness-report"
        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <div className="mb-6 border-b border-zinc-800 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
            Fitness Tracker
          </p>

          <h3 className="mt-2 text-3xl font-bold">Informe de progreso</h3>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
            <span>
              Usuario: {user?.displayName || user?.email || "Usuario"}
            </span>

            <span>Periodo: {periodLabel}</span>

            <span>
              Objetivo: {Number(settings.goalCalories).toLocaleString("es-MX")}{" "}
              kcal · {Number(settings.goalWeight).toFixed(1)} kg
            </span>
          </div>
        </div>

        {reportRecords.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No hay registros en el periodo seleccionado.
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ReportMetric label="Registros" value={stats.recordCount} />

              <ReportMetric
                label="Promedio calórico"
                value={
                  stats.averageCalories !== null
                    ? `${Math.round(stats.averageCalories).toLocaleString(
                        "es-MX",
                      )} kcal`
                    : "Sin datos"
                }
              />

              <ReportMetric
                label="Peso inicial"
                value={
                  stats.initialWeight !== null
                    ? `${stats.initialWeight.toFixed(1)} kg`
                    : "Sin datos"
                }
              />

              <ReportMetric
                label="Peso final"
                value={
                  stats.finalWeight !== null
                    ? `${stats.finalWeight.toFixed(1)} kg`
                    : "Sin datos"
                }
              />

              <ReportMetric
                label="Cambio de peso"
                value={
                  stats.weightChange !== null
                    ? `${stats.weightChange > 0 ? "+" : ""}${stats.weightChange.toFixed(1)} kg`
                    : "Sin datos"
                }
                tone={
                  stats.weightChange === null
                    ? "neutral"
                    : stats.weightChange < 0
                      ? "positive"
                      : stats.weightChange > 0
                        ? "warning"
                        : "neutral"
                }
              />

              <ReportMetric
                label="Sueño promedio"
                value={
                  stats.averageSleep !== null
                    ? `${stats.averageSleep.toFixed(1)} h`
                    : "Sin datos"
                }
              />

              <ReportMetric
                label="Recuperación"
                value={
                  stats.averageRecovery !== null
                    ? `${stats.averageRecovery.toFixed(1)}/10`
                    : "Sin datos"
                }
              />

              <ReportMetric label="Fase configurada" value={settings.mode} />
            </div>

            <div className="mb-6">
              <h4 className="mb-3 font-bold">Distribución de rendimiento</h4>

              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.performanceDistribution).map(
                  ([performance, amount]) => (
                    <span
                      key={performance}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-300"
                    >
                      {performance}: {amount}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-zinc-400">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Calorías</th>
                    <th className="p-3">Peso</th>
                    <th className="p-3">Rendimiento</th>
                    <th className="p-3">Sueño</th>
                    <th className="p-3">Recuperación</th>
                  </tr>
                </thead>

                <tbody>
                  {reportRecords.map((record) => (
                    <tr key={record.id} className="border-b border-zinc-800">
                      <td className="p-3 font-semibold">
                        {formatReportDate(record.date)}
                      </td>

                      <td className="p-3">
                        {Number(record.calories).toLocaleString("es-MX")} kcal
                      </td>

                      <td className="p-3">
                        {record.weight
                          ? `${Number(record.weight).toFixed(1)} kg`
                          : "—"}
                      </td>

                      <td className="p-3">{record.performance || "—"}</td>

                      <td className="p-3">
                        {record.sleep
                          ? `${Number(record.sleep).toFixed(1)} h`
                          : "—"}
                      </td>

                      <td className="p-3">
                        {record.recovery ? `${record.recovery}/10` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ReportMetric({ label, value, tone = "neutral" }) {
  const tones = {
    neutral: "text-white",
    positive: "text-lime-400",
    warning: "text-amber-400",
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>

      <p className={`mt-2 text-xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
