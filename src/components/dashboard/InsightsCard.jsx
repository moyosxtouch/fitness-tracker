import {
  Brain,
  Dumbbell,
  Flame,
  Minus,
  Moon,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function InsightsCard({ records }) {
  const sortedRecords = [...records]
    .filter((record) => record.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedRecords.length === 0) {
    return null;
  }

  const calorieRecords = sortedRecords.filter((record) =>
    Number.isFinite(Number(record.calories)),
  );

  const weightRecords = sortedRecords.filter((record) =>
    Number.isFinite(Number(record.weight)),
  );

  // Descanso no cuenta como una sesión de gimnasio.
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

  const weightDifference =
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
        <Brain className="text-lime-400" size={28} />

        <div>
          <h2 className="text-2xl font-bold">Insights</h2>

          <p className="text-sm text-zinc-400">
            Resumen automático de tus registros
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Insight
          icon={<Flame size={24} />}
          title="Promedio calórico"
          value={`${averageCalories.toLocaleString("es-MX")} kcal`}
          description={`Promedio de ${calorieRecords.length} registros`}
          iconClass="bg-orange-500/15 text-orange-400"
        />

        <Insight
          icon={<WeightIcon difference={weightDifference} />}
          title="Cambio de peso"
          value={`${weightDifference > 0 ? "+" : ""}${weightDifference.toFixed(
            1,
          )} kg`}
          description={getWeightMessage(weightDifference)}
          iconClass={getWeightIconClass(weightDifference)}
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
              weightDifference,
              optimalPercentage,
              optimalAverageCalories,
              averageCalories,
              trainingCount: trainingRecords.length,
              restCount: restRecords.length,
            })}
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            Los días de descanso cuentan para calorías y peso, pero no modifican
            el porcentaje de rendimiento del gimnasio.
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

      <p className="mt-2 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

function WeightIcon({ difference }) {
  if (difference < 0) {
    return <TrendingDown size={24} />;
  }

  if (difference > 0) {
    return <TrendingUp size={24} />;
  }

  return <Minus size={24} />;
}

function getWeightIconClass(difference) {
  if (difference < 0) {
    return "bg-emerald-500/15 text-emerald-400";
  }

  if (difference > 0) {
    return "bg-amber-500/15 text-amber-400";
  }

  return "bg-zinc-800 text-zinc-400";
}

function getWeightMessage(difference) {
  if (difference < 0) {
    return "Tendencia descendente";
  }

  if (difference > 0) {
    return "Tendencia ascendente";
  }

  return "Peso estable";
}

function buildSummary({
  weightDifference,
  optimalPercentage,
  optimalAverageCalories,
  averageCalories,
  trainingCount,
  restCount,
}) {
  const weightText =
    weightDifference < 0
      ? `Has bajado ${Math.abs(weightDifference).toFixed(
          1,
        )} kg desde tu primer registro.`
      : weightDifference > 0
        ? `Has subido ${weightDifference.toFixed(
            1,
          )} kg desde tu primer registro.`
        : "Tu peso se mantiene estable.";

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

  return `${weightText} ${performanceText} ${caloriesText} ${restText}`.trim();
}
