import {
  Activity,
  ArrowDown,
  ArrowUp,
  Dumbbell,
  Flame,
  Minus,
  Moon,
  Scale,
} from "lucide-react";

import { getWeightTrend } from "../../utils/weightTrend";

export default function InsightsCard({ records }) {
  const sortedRecords = [...records]
    .filter((record) => record.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedRecords.length === 0) {
    return null;
  }

  const trend = getWeightTrend(records);

  const calorieRecords = sortedRecords.filter((record) =>
    Number.isFinite(Number(record.calories)),
  );

  const weightRecords = sortedRecords.filter((record) =>
    Number.isFinite(Number(record.weight)),
  );

  const trainingRecords = sortedRecords.filter(
    (record) =>
      record.performance === "Óptimo" ||
      record.performance === "Regular" ||
      record.performance === "Fallido",
  );

  const restRecords = sortedRecords.filter(
    (record) => record.performance === "Descanso",
  );

  const optimalRecords = trainingRecords.filter(
    (record) => record.performance === "Óptimo",
  );

  const averageCalories = calorieRecords.length
    ? Math.round(
        calorieRecords.reduce(
          (total, record) => total + Number(record.calories),
          0,
        ) / calorieRecords.length,
      )
    : 0;

  const firstWeight =
    weightRecords.length > 0 ? Number(weightRecords[0].weight) : null;

  const latestWeight =
    weightRecords.length > 0
      ? Number(weightRecords[weightRecords.length - 1].weight)
      : null;

  const totalWeightChange =
    firstWeight !== null && latestWeight !== null
      ? Number((latestWeight - firstWeight).toFixed(1))
      : 0;

  const optimalPercentage = trainingRecords.length
    ? Math.round((optimalRecords.length / trainingRecords.length) * 100)
    : 0;

  const optimalAverageCalories =
    optimalRecords.length > 0
      ? Math.round(
          optimalRecords.reduce(
            (total, record) => total + Number(record.calories),
            0,
          ) / optimalRecords.length,
        )
      : 0;

  const restAverageCalories =
    restRecords.length > 0
      ? Math.round(
          restRecords.reduce(
            (total, record) => total + Number(record.calories),
            0,
          ) / restRecords.length,
        )
      : 0;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <Activity size={28} className="text-lime-400" />

        <div>
          <h2 className="text-2xl font-bold">Insights</h2>

          <p className="text-sm text-zinc-400">
            Resumen automático de tus registros
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Insight
          icon={<Flame size={24} />}
          title="Promedio calórico"
          value={`${averageCalories.toLocaleString("es-MX")} kcal`}
          description={`Promedio de ${calorieRecords.length} registros`}
          iconClass="bg-orange-500/15 text-orange-400"
        />

        <Insight
          icon={<Scale size={24} />}
          title="Cambio total"
          value={`${totalWeightChange > 0 ? "+" : ""}${totalWeightChange.toFixed(
            1,
          )} kg`}
          description={getTotalWeightMessage(totalWeightChange)}
          iconClass={getTotalWeightColor(totalWeightChange)}
        />

        <Insight
          icon={getTrendIcon(trend.status)}
          title="Tendencia reciente"
          value={trend.label}
          description={getTrendMessage(trend)}
          iconClass={getTrendColor(trend.status)}
        />

        <Insight
          icon={<Dumbbell size={24} />}
          title="Rendimiento óptimo"
          value={trainingRecords.length ? `${optimalPercentage}%` : "Sin datos"}
          description={
            trainingRecords.length
              ? `${optimalRecords.length} de ${trainingRecords.length} entrenamientos`
              : "Todavía no hay entrenamientos registrados"
          }
          iconClass="bg-emerald-500/15 text-emerald-400"
        />

        <Insight
          icon={<Moon size={24} />}
          title="Días de descanso"
          value={restRecords.length}
          description={
            restRecords.length > 0
              ? `Promedio: ${restAverageCalories.toLocaleString("es-MX")} kcal`
              : "Todavía no hay descansos registrados"
          }
          iconClass="bg-sky-500/15 text-sky-400"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-2 text-sm text-zinc-400">
            Calorías en entrenamientos óptimos
          </p>

          <p className="text-3xl font-bold">
            {optimalAverageCalories
              ? `${optimalAverageCalories.toLocaleString("es-MX")} kcal`
              : "Sin datos"}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {optimalAverageCalories
              ? "Promedio únicamente de sesiones marcadas como óptimas."
              : "Registra sesiones óptimas para calcular este promedio."}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-2 text-sm text-zinc-400">Resumen</p>

          <p className="text-lg leading-relaxed">
            {buildSummary({
              totalWeightChange,
              trend,
              optimalPercentage,
              optimalAverageCalories,
              averageCalories,
              trainingCount: trainingRecords.length,
              restCount: restRecords.length,
            })}
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            El cambio total compara tu primer y último registro. La tendencia
            reciente se calcula por separado usando promedios semanales.
          </p>
        </div>
      </div>
    </section>
  );
}

function Insight({ icon, title, value, description, iconClass }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-sm text-zinc-400">{title}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>

      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function getTrendIcon(status) {
  if (status === "down") {
    return <ArrowDown size={24} />;
  }

  if (status === "up") {
    return <ArrowUp size={24} />;
  }

  return <Minus size={24} />;
}

function getTrendColor(status) {
  if (status === "down") {
    return "bg-emerald-500/15 text-emerald-400";
  }

  if (status === "up") {
    return "bg-violet-500/15 text-violet-400";
  }

  if (status === "stable") {
    return "bg-sky-500/15 text-sky-400";
  }

  return "bg-zinc-800 text-zinc-500";
}

function getTrendMessage(trend) {
  if (trend.status === "insufficient") {
    return "Recopilando suficientes semanas";
  }

  if (trend.weeklyChange === null) {
    return "Sin cambio estimado";
  }

  const sign = trend.weeklyChange > 0 ? "+" : "";

  return `${sign}${trend.weeklyChange.toFixed(2)} kg/sem estimados`;
}

function getTotalWeightColor(difference) {
  if (difference < 0) {
    return "bg-emerald-500/15 text-emerald-400";
  }

  if (difference > 0) {
    return "bg-violet-500/15 text-violet-400";
  }

  return "bg-zinc-800 text-zinc-400";
}

function getTotalWeightMessage(difference) {
  if (difference < 0) {
    return "Desde tu primer registro";
  }

  if (difference > 0) {
    return "Desde tu primer registro";
  }

  return "Sin cambio acumulado";
}

function buildSummary({
  totalWeightChange,
  trend,
  optimalPercentage,
  optimalAverageCalories,
  averageCalories,
  trainingCount,
  restCount,
}) {
  const weightText =
    totalWeightChange < 0
      ? `Desde tu primer registro has bajado ${Math.abs(
          totalWeightChange,
        ).toFixed(1)} kg.`
      : totalWeightChange > 0
        ? `Desde tu primer registro has subido ${totalWeightChange.toFixed(
            1,
          )} kg.`
        : "Tu primer y último registro tienen el mismo peso.";

  const trendText =
    trend.status === "insufficient"
      ? "Todavía no hay suficientes semanas para determinar una tendencia reciente."
      : `La tendencia reciente es ${trend.label.toLowerCase()}, con un cambio estimado de ${
          trend.weeklyChange > 0 ? "+" : ""
        }${trend.weeklyChange.toFixed(2)} kg por semana.`;

  const performanceText =
    trainingCount === 0
      ? "Todavía no hay suficientes entrenamientos para evaluar el rendimiento."
      : `Tu rendimiento fue óptimo en el ${optimalPercentage}% de tus ${trainingCount} entrenamientos registrados.`;

  const caloriesText = optimalAverageCalories
    ? `En tus sesiones óptimas consumes en promedio ${optimalAverageCalories.toLocaleString(
        "es-MX",
      )} kcal.`
    : `Tu promedio general es de ${averageCalories.toLocaleString(
        "es-MX",
      )} kcal.`;

  const restText =
    restCount > 0
      ? `También tienes ${restCount} ${
          restCount === 1 ? "día de descanso" : "días de descanso"
        } registrado${restCount === 1 ? "" : "s"}.`
      : "";

  return `${weightText} ${trendText} ${performanceText} ${caloriesText} ${restText}`.trim();
}
