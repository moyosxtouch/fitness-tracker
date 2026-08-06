import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Flame,
  Moon,
} from "lucide-react";

export default function CaloriesPerformanceCard({ records }) {
  const trainingRecords = records
    .filter(
      (record) =>
        Number.isFinite(Number(record.calories)) &&
        (record.performance === "Óptimo" ||
          record.performance === "Regular" ||
          record.performance === "Fallido"),
    )
    .map((record) => ({
      ...record,
      calories: Number(record.calories),
    }));

  const restRecords = records
    .filter(
      (record) =>
        Number.isFinite(Number(record.calories)) &&
        record.performance === "Descanso",
    )
    .map((record) => ({
      ...record,
      calories: Number(record.calories),
    }));

  const optimalRecords = trainingRecords.filter(
    (record) => record.performance === "Óptimo",
  );

  const regularRecords = trainingRecords.filter(
    (record) => record.performance === "Regular",
  );

  const failedRecords = trainingRecords.filter(
    (record) => record.performance === "Fallido",
  );

  const optimalAverage = getAverageCalories(optimalRecords);

  const regularAverage = getAverageCalories(regularRecords);

  const failedAverage = getAverageCalories(failedRecords);

  const restAverage = getAverageCalories(restRecords);

  const optimalRange = getCaloriesRange(optimalRecords);

  if (trainingRecords.length === 0 && restRecords.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Calorías y rendimiento</h2>

            <p className="text-sm text-zinc-400">
              Agrega registros para analizar la relación entre tu consumo y tus
              entrenamientos.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Calorías y rendimiento</h2>

            <p className="text-sm text-zinc-400">
              Relación entre consumo calórico y calidad del entrenamiento
            </p>
          </div>
        </div>

        <span className="text-sm text-zinc-400">
          {trainingRecords.length} entrenamientos analizados
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PerformanceAverage
          icon={<CheckCircle2 size={24} />}
          title="Rendimiento óptimo"
          average={optimalAverage}
          count={optimalRecords.length}
          colorClass="bg-emerald-500/15 text-emerald-400"
        />

        <PerformanceAverage
          icon={<AlertCircle size={24} />}
          title="Rendimiento regular"
          average={regularAverage}
          count={regularRecords.length}
          colorClass="bg-amber-500/15 text-amber-400"
        />

        <PerformanceAverage
          icon={<XCircle size={24} />}
          title="Rendimiento fallido"
          average={failedAverage}
          count={failedRecords.length}
          colorClass="bg-red-500/15 text-red-400"
        />

        <PerformanceAverage
          icon={<Moon size={24} />}
          title="Días de descanso"
          average={restAverage}
          count={restRecords.length}
          colorClass="bg-sky-500/15 text-sky-400"
          label="descansos"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
              <Flame size={24} />
            </div>

            <div>
              <p className="text-sm text-zinc-400">
                Rango observado en días óptimos
              </p>

              <p className="text-2xl font-bold">{formatRange(optimalRange)}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-400">
            Este rango utiliza únicamente sesiones marcadas como rendimiento
            óptimo.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-2 text-sm text-zinc-400">Interpretación</p>

          <p className="text-lg leading-relaxed">
            {buildInterpretation({
              optimalRecords,
              regularRecords,
              failedRecords,
              optimalAverage,
              regularAverage,
              failedAverage,
              optimalRange,
              restRecords,
              restAverage,
            })}
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            Los días de descanso se muestran por separado y no se interpretan
            como rendimiento del gimnasio.
          </p>
        </div>
      </div>
    </section>
  );
}

function PerformanceAverage({
  icon,
  title,
  average,
  count,
  colorClass,
  label = "entrenamientos",
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${colorClass}`}
      >
        {icon}
      </div>

      <p className="text-sm text-zinc-400">{title}</p>

      <p className="mt-1 text-2xl font-bold">
        {average ? `${average.toLocaleString("es-MX")} kcal` : "Sin datos"}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {count === 1
          ? `1 ${label === "descansos" ? "descanso" : "entrenamiento"}`
          : `${count} ${label}`}
      </p>
    </div>
  );
}

function getAverageCalories(records) {
  if (!records.length) {
    return 0;
  }

  return Math.round(
    records.reduce((total, record) => total + record.calories, 0) /
      records.length,
  );
}

function getCaloriesRange(records) {
  if (!records.length) {
    return null;
  }

  const calories = records.map((record) => record.calories);

  return {
    minimum: Math.min(...calories),
    maximum: Math.max(...calories),
  };
}

function formatRange(range) {
  if (!range) {
    return "Sin datos";
  }

  if (range.minimum === range.maximum) {
    return `${range.minimum.toLocaleString("es-MX")} kcal`;
  }

  return `${range.minimum.toLocaleString(
    "es-MX",
  )}–${range.maximum.toLocaleString("es-MX")} kcal`;
}

function buildInterpretation({
  optimalRecords,
  regularRecords,
  failedRecords,
  optimalAverage,
  regularAverage,
  failedAverage,
  optimalRange,
  restRecords,
  restAverage,
}) {
  if (optimalRecords.length === 0) {
    const restText = restRecords.length
      ? ` Tus días de descanso tienen un promedio de ${restAverage.toLocaleString(
          "es-MX",
        )} kcal.`
      : "";

    return `Todavía no tienes registros con rendimiento óptimo. Continúa registrando tus sesiones para detectar con qué consumo rindes mejor.${restText}`;
  }

  if (optimalRecords.length < 3) {
    return `Tus días óptimos tienen un promedio de ${optimalAverage.toLocaleString(
      "es-MX",
    )} kcal, pero todavía necesitas más registros para identificar un patrón confiable.`;
  }

  const comparisons = [];

  if (regularAverage && optimalAverage > regularAverage) {
    comparisons.push(
      `en los días óptimos consumes ${(
        optimalAverage - regularAverage
      ).toLocaleString("es-MX")} kcal más que en los días regulares`,
    );
  }

  if (failedAverage && optimalAverage > failedAverage) {
    comparisons.push(
      `${(optimalAverage - failedAverage).toLocaleString(
        "es-MX",
      )} kcal más que en los días fallidos`,
    );
  }

  const restText = restRecords.length
    ? ` Tus días de descanso tienen un promedio de ${restAverage.toLocaleString(
        "es-MX",
      )} kcal.`
    : "";

  if (comparisons.length > 0) {
    return `Por ahora, ${comparisons.join(
      " y ",
    )}. Tus mejores sesiones aparecen dentro del rango de ${formatRange(
      optimalRange,
    )}.${restText}`;
  }

  if (regularRecords.length === 0 && failedRecords.length === 0) {
    return `Todos tus entrenamientos registrados son óptimos, con un promedio de ${optimalAverage.toLocaleString(
      "es-MX",
    )} kcal. Necesitas sesiones con otros resultados para compararlas.${restText}`;
  }

  return `Tus entrenamientos óptimos tienen un promedio de ${optimalAverage.toLocaleString(
    "es-MX",
  )} kcal. Por ahora no aparece una diferencia clara frente a los demás niveles de rendimiento.${restText}`;
}
