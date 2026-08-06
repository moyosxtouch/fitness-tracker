import {
  Activity,
  ArrowDown,
  ArrowUp,
  Flame,
  Minus,
  Scale,
} from "lucide-react";

export default function PhaseStatusCard({ records, settings }) {
  const validRecords = records
    .filter(
      (record) =>
        record.date &&
        Number.isFinite(Number(record.calories)) &&
        Number.isFinite(Number(record.weight)),
    )
    .map((record) => ({
      ...record,
      calories: Number(record.calories),
      weight: Number(record.weight),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (validRecords.length < 2) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <Activity className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Estado actual</h2>

            <p className="text-sm text-zinc-400">
              Necesitas al menos dos registros para analizar la tendencia.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const recentRecords = validRecords.slice(-14);

  const firstHalf = recentRecords.slice(0, Math.ceil(recentRecords.length / 2));

  const secondHalf = recentRecords.slice(Math.ceil(recentRecords.length / 2));

  const firstWeightAverage = getAverageWeight(firstHalf);

  const recentWeightAverage = getAverageWeight(secondHalf);

  const weightChange = Number(
    (recentWeightAverage - firstWeightAverage).toFixed(2),
  );

  const averageCalories = getAverageCalories(recentRecords);

  const status = getStatus(weightChange);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Estado actual</h2>

            <p className="text-sm text-zinc-400">
              Estimación basada en tus últimos {recentRecords.length} registros
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Scale size={23} />}
          title="Cambio de peso"
          value={`${weightChange > 0 ? "+" : ""}${weightChange.toFixed(2)} kg`}
          description="Comparación entre los registros recientes"
          iconClass={getWeightColor(weightChange)}
        />

        <MetricCard
          icon={<Flame size={23} />}
          title="Promedio calórico"
          value={`${averageCalories.toLocaleString("es-MX")} kcal`}
          description={`Tu objetivo configurado es de ${Number(
            settings.goalCalories,
          ).toLocaleString("es-MX")} kcal`}
          iconClass="bg-orange-500/15 text-orange-400"
        />

        <MetricCard
          icon={getStatusIcon(status)}
          title="Tendencia estimada"
          value={status.label}
          description={getModeComparison(status, settings.mode)}
          iconClass={status.iconClass}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="mb-2 text-sm text-zinc-400">Interpretación</p>

        <p className="text-lg leading-relaxed">
          {buildInterpretation({
            status,
            weightChange,
            averageCalories,
            goalCalories: settings.goalCalories,
          })}
        </p>

        <p className="mt-3 text-xs text-zinc-500">
          Esta estimación mejora conforme acumulas más registros. Cambios
          diarios de agua, glucógeno y digestión pueden modificar temporalmente
          el peso.
        </p>
      </div>
    </section>
  );
}

function MetricCard({ icon, title, value, description, iconClass }) {
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

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.badgeClass}`}
    >
      {getStatusIcon(status, 17)}
      {status.label}
    </span>
  );
}

function getStatus(weightChange) {
  if (weightChange <= -0.15) {
    return {
      key: "losing",
      label: "Bajando",
      iconClass: "bg-emerald-500/15 text-emerald-400",
      badgeClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
    };
  }

  if (weightChange >= 0.15) {
    return {
      key: "gaining",
      label: "Subiendo",
      iconClass: "bg-violet-500/15 text-violet-400",
      badgeClass: "border-violet-500/30 bg-violet-500/15 text-violet-400",
    };
  }

  return {
    key: "maintaining",
    label: "Mantenimiento",
    iconClass: "bg-sky-500/15 text-sky-400",
    badgeClass: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  };
}

function getStatusIcon(status, size = 23) {
  if (status.key === "losing") {
    return <ArrowDown size={size} />;
  }

  if (status.key === "gaining") {
    return <ArrowUp size={size} />;
  }

  return <Minus size={size} />;
}

function getWeightColor(weightChange) {
  if (weightChange < -0.15) {
    return "bg-emerald-500/15 text-emerald-400";
  }

  if (weightChange > 0.15) {
    return "bg-violet-500/15 text-violet-400";
  }

  return "bg-sky-500/15 text-sky-400";
}

function getAverageWeight(records) {
  if (!records.length) {
    return 0;
  }

  return (
    records.reduce((total, record) => total + record.weight, 0) / records.length
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

function getModeComparison(status, mode) {
  if (status.key === "losing" && mode === "Déficit") {
    return "La tendencia coincide con tu etapa configurada";
  }

  if (status.key === "maintaining" && mode === "Mantenimiento") {
    return "La tendencia coincide con tu etapa configurada";
  }

  if (status.key === "gaining" && mode === "Superávit") {
    return "La tendencia coincide con tu etapa configurada";
  }

  return `Tu configuración actual indica: ${mode}`;
}

function buildInterpretation({
  status,
  weightChange,
  averageCalories,
  goalCalories,
}) {
  const caloriesDifference = averageCalories - Number(goalCalories);

  if (status.key === "losing") {
    return `Con un consumo promedio de ${averageCalories.toLocaleString(
      "es-MX",
    )} kcal, tu peso reciente bajó aproximadamente ${Math.abs(
      weightChange,
    ).toFixed(
      2,
    )} kg. Por ahora, estos registros sugieren que continúas en déficit.`;
  }

  if (status.key === "gaining") {
    return `Con un consumo promedio de ${averageCalories.toLocaleString(
      "es-MX",
    )} kcal, tu peso reciente subió aproximadamente ${weightChange.toFixed(
      2,
    )} kg. Estos registros sugieren una tendencia de superávit.`;
  }

  const comparisonText =
    caloriesDifference > 0
      ? `Esto ocurre consumiendo aproximadamente ${Math.abs(
          caloriesDifference,
        ).toLocaleString("es-MX")} kcal por encima de tu meta configurada.`
      : caloriesDifference < 0
        ? `Esto ocurre consumiendo aproximadamente ${Math.abs(
            caloriesDifference,
          ).toLocaleString("es-MX")} kcal por debajo de tu meta configurada.`
        : "Tu promedio coincide con la meta configurada.";

  return `Tu peso reciente se mantiene relativamente estable con un promedio de ${averageCalories.toLocaleString(
    "es-MX",
  )} kcal. ${comparisonText}`;
}
