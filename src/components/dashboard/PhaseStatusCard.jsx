import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleAlert,
  Flame,
  Minus,
  Scale,
  Target,
} from "lucide-react";

import {
  getWeightTrend,
  isTrendAlignedWithGoal,
} from "../../utils/weightTrend";

export default function PhaseStatusCard({ records, settings }) {
  const trend = getWeightTrend(records);

  const aligned = isTrendAlignedWithGoal(settings.mode, trend);

  const calorieRecords = records
    .filter((record) => Number.isFinite(Number(record.calories)) && record.date)
    .map((record) => ({
      ...record,
      calories: Number(record.calories),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  const averageCalories = getAverageCalories(calorieRecords);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Estado actual</h2>

            <p className="text-sm text-zinc-400">
              Objetivo personal y tendencia observada
            </p>
          </div>
        </div>

        <TrendBadge trend={trend} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Target size={23} />}
          title="Objetivo"
          value={settings.mode}
          description="Objetivo configurado por el usuario"
          iconClass="bg-lime-400/15 text-lime-400"
        />

        <MetricCard
          icon={getTrendIcon(trend.status)}
          title="Tendencia observada"
          value={trend.label}
          description={getTrendDescription(trend)}
          iconClass={getTrendColor(trend.status)}
        />

        <MetricCard
          icon={<Scale size={23} />}
          title="Promedio actual"
          value={
            trend.latestAverage !== null
              ? `${trend.latestAverage.toFixed(2)} kg`
              : "Sin datos"
          }
          description={
            trend.weeksUsed
              ? `Análisis de ${trend.weeksUsed} semanas`
              : "Todavía recopilando datos"
          }
          iconClass="bg-sky-500/15 text-sky-400"
        />

        <MetricCard
          icon={<Flame size={23} />}
          title="Promedio calórico"
          value={
            averageCalories
              ? `${averageCalories.toLocaleString("es-MX")} kcal`
              : "Sin datos"
          }
          description={`Meta configurada: ${Number(
            settings.goalCalories,
          ).toLocaleString("es-MX")} kcal`}
          iconClass="bg-orange-500/15 text-orange-400"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <AlignmentCard goal={settings.mode} trend={trend} aligned={aligned} />

        <TrendDetails trend={trend} />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="mb-2 text-sm text-zinc-400">Interpretación</p>

        <p className="text-lg leading-relaxed">
          {buildInterpretation({
            goal: settings.mode,
            trend,
            aligned,
            averageCalories,
            goalCalories: settings.goalCalories,
          })}
        </p>

        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          La tendencia se calcula utilizando promedios semanales y varias
          semanas de registros. Un cambio aislado de peso no se interpreta
          automáticamente como pérdida o ganancia sostenida.
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

      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function TrendBadge({ trend }) {
  const styles = {
    down: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",

    stable: "border-sky-500/30 bg-sky-500/15 text-sky-400",

    up: "border-violet-500/30 bg-violet-500/15 text-violet-400",

    insufficient: "border-zinc-700 bg-zinc-800 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
        styles[trend.status] ?? styles.insufficient
      }`}
    >
      {getTrendIcon(trend.status, 17)}

      {trend.label}
    </span>
  );
}

function AlignmentCard({ goal, trend, aligned }) {
  if (trend.status === "insufficient") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-3 flex items-center gap-3">
          <CircleAlert size={25} className="text-zinc-500" />

          <div>
            <p className="font-semibold">Recopilando datos</p>

            <p className="text-sm text-zinc-500">Objetivo: {goal}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-400">
          Todavía no hay suficientes semanas con pesajes para determinar si la
          tendencia está alineada con tu objetivo.
        </p>
      </div>
    );
  }

  if (aligned) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="mb-3 flex items-center gap-3">
          <CheckCircle2 size={26} className="text-emerald-400" />

          <div>
            <p className="font-bold text-emerald-300">
              Vas acorde con tu objetivo
            </p>

            <p className="text-sm text-emerald-400/70">{goal}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300">
          La tendencia observada actualmente es{" "}
          <strong>{trend.label.toLowerCase()}</strong>, lo que coincide con el
          objetivo que configuraste.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="mb-3 flex items-center gap-3">
        <CircleAlert size={26} className="text-amber-400" />

        <div>
          <p className="font-bold text-amber-300">Revisa la tendencia</p>

          <p className="text-sm text-amber-400/70">Objetivo: {goal}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-300">
        Tu tendencia actual es <strong>{trend.label.toLowerCase()}</strong>, por
        lo que todavía no coincide con el objetivo configurado.
      </p>
    </div>
  );
}

function TrendDetails({ trend }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="mb-4 font-semibold">Detalle de tendencia</p>

      <div className="space-y-3">
        <DetailRow
          label="Cambio estimado"
          value={
            trend.weeklyChange !== null
              ? `${trend.weeklyChange > 0 ? "+" : ""}${trend.weeklyChange.toFixed(
                  2,
                )} kg/sem`
              : "Sin datos"
          }
        />

        <DetailRow
          label="Cambio porcentual"
          value={
            trend.weeklyChangePercent !== null
              ? `${trend.weeklyChangePercent > 0 ? "+" : ""}${trend.weeklyChangePercent.toFixed(
                  2,
                )}%/sem`
              : "Sin datos"
          }
        />

        <DetailRow
          label="Semanas utilizadas"
          value={trend.weeksUsed ? trend.weeksUsed : "—"}
        />

        <DetailRow label="Dirección" value={trend.label} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-500">{label}</span>

      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function getTrendIcon(status, size = 23) {
  if (status === "down") {
    return <ArrowDown size={size} />;
  }

  if (status === "up") {
    return <ArrowUp size={size} />;
  }

  return <Minus size={size} />;
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

function getTrendDescription(trend) {
  if (trend.status === "insufficient") {
    return "Se necesitan más semanas de pesajes";
  }

  if (trend.weeklyChange === null) {
    return "Sin cambio estimado";
  }

  const sign = trend.weeklyChange > 0 ? "+" : "";

  return `${sign}${trend.weeklyChange.toFixed(2)} kg por semana estimados`;
}

function getAverageCalories(records) {
  if (!records.length) {
    return 0;
  }

  return Math.round(
    records.reduce((total, record) => total + Number(record.calories), 0) /
      records.length,
  );
}

function buildInterpretation({
  goal,
  trend,
  aligned,
  averageCalories,
  goalCalories,
}) {
  if (trend.status === "insufficient") {
    return `Tu objetivo actual es ${goal.toLowerCase()}. La aplicación todavía está recopilando suficientes semanas de peso para determinar una tendencia fiable.`;
  }

  const directionText = {
    down: "una tendencia descendente",

    stable: "una tendencia relativamente estable",

    up: "una tendencia ascendente",
  };

  const changeText =
    trend.weeklyChange !== null
      ? `La pendiente estimada es de ${
          trend.weeklyChange > 0 ? "+" : ""
        }${trend.weeklyChange.toFixed(2)} kg por semana.`
      : "";

  const alignmentText =
    aligned === true
      ? "Por ahora, esta evolución coincide con tu objetivo."
      : "Por ahora, esta evolución no coincide con la dirección esperada para tu objetivo.";

  const caloriesText = averageCalories
    ? ` En tus últimos registros estás consumiendo un promedio de ${averageCalories.toLocaleString(
        "es-MX",
      )} kcal frente a una meta configurada de ${Number(
        goalCalories,
      ).toLocaleString("es-MX")} kcal.`
    : "";

  return `Tus promedios semanales muestran ${
    directionText[trend.status]
  }. ${changeText} ${alignmentText}${caloriesText}`;
}
