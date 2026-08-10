import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Flame,
  HeartPulse,
  Moon,
  XCircle,
} from "lucide-react";

export default function CaloriesPerformanceCard({ records }) {
  const trainingRecords = records
    .filter(
      (record) =>
        record.performance === "Óptimo" ||
        record.performance === "Regular" ||
        record.performance === "Fallido",
    )
    .map(normalizeRecord);

  const restRecords = records
    .filter((record) => record.performance === "Descanso")
    .map(normalizeRecord);

  const optimalRecords = trainingRecords.filter(
    (record) => record.performance === "Óptimo",
  );

  const regularRecords = trainingRecords.filter(
    (record) => record.performance === "Regular",
  );

  const failedRecords = trainingRecords.filter(
    (record) => record.performance === "Fallido",
  );

  if (trainingRecords.length === 0 && restRecords.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <BarChart3 size={28} className="text-lime-400" />

          <div>
            <h2 className="text-2xl font-bold">Factores de rendimiento</h2>

            <p className="text-sm text-zinc-400">
              Agrega registros para analizar calorías, sueño y recuperación.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 size={28} className="text-lime-400" />

          <div>
            <h2 className="text-2xl font-bold">Factores de rendimiento</h2>

            <p className="text-sm text-zinc-400">
              Compara tus entrenamientos según calorías, sueño y recuperación
            </p>
          </div>
        </div>

        <span className="text-sm text-zinc-400">
          {trainingRecords.length} entrenamientos analizados
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PerformanceGroup
          icon={<CheckCircle2 size={24} />}
          title="Óptimo"
          records={optimalRecords}
          colorClass="bg-emerald-500/15 text-emerald-400"
        />

        <PerformanceGroup
          icon={<AlertCircle size={24} />}
          title="Regular"
          records={regularRecords}
          colorClass="bg-amber-500/15 text-amber-400"
        />

        <PerformanceGroup
          icon={<XCircle size={24} />}
          title="Fallido"
          records={failedRecords}
          colorClass="bg-red-500/15 text-red-400"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">
            Diferencias observadas
          </p>

          <PatternComparison
            optimalRecords={optimalRecords}
            regularRecords={regularRecords}
            failedRecords={failedRecords}
          />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="mb-2 text-sm text-zinc-400">Interpretación</p>

          <p className="text-lg leading-relaxed">
            {buildInterpretation({
              optimalRecords,
              regularRecords,
              failedRecords,
            })}
          </p>

          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Estos datos muestran asociaciones dentro de tus propios registros.
            No significa necesariamente que una variable sea la causa directa de
            un mejor o peor rendimiento.
          </p>
        </div>
      </div>

      {restRecords.length > 0 && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <Moon size={21} />
            </div>

            <div>
              <p className="font-semibold">Días de descanso</p>

              <p className="mt-1 text-sm text-zinc-400">
                {restRecords.length}{" "}
                {restRecords.length === 1 ? "registro" : "registros"}
                {" · "}
                {formatCalories(getAverage(restRecords, "calories"))}
                {" · "}
                {formatSleep(getAverage(restRecords, "sleepHours"))}
                {" · "}
                {formatRecovery(getAverage(restRecords, "recovery"))}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PerformanceGroup({ icon, title, records, colorClass }) {
  const calories = getAverage(records, "calories");
  const sleep = getAverage(records, "sleepHours");
  const recovery = getAverage(records, "recovery");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${colorClass}`}
      >
        {icon}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">Rendimiento</p>

          <p className="text-2xl font-bold">{title}</p>
        </div>

        <span className="text-xs text-zinc-500">
          {records.length} {records.length === 1 ? "sesión" : "sesiones"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <MetricRow
          icon={<Flame size={17} />}
          label="Calorías"
          value={formatCalories(calories)}
          iconClass="text-orange-400"
        />

        <MetricRow
          icon={<Moon size={17} />}
          label="Sueño"
          value={formatSleep(sleep)}
          iconClass="text-indigo-400"
        />

        <MetricRow
          icon={<HeartPulse size={17} />}
          label="Recuperación"
          value={formatRecovery(recovery)}
          iconClass="text-rose-400"
        />
      </div>
    </div>
  );
}

function MetricRow({ icon, label, value, iconClass }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={iconClass}>{icon}</span>

        <span className="text-sm text-zinc-400">{label}</span>
      </div>

      <span className="font-semibold">{value}</span>
    </div>
  );
}

function PatternComparison({ optimalRecords, regularRecords, failedRecords }) {
  const groups = [
    {
      label: "Óptimo",
      records: optimalRecords,
    },
    {
      label: "Regular",
      records: regularRecords,
    },
    {
      label: "Fallido",
      records: failedRecords,
    },
  ];

  return (
    <div className="space-y-4">
      <ComparisonMetric
        label="Calorías promedio"
        groups={groups}
        field="calories"
        formatter={formatCalories}
      />

      <ComparisonMetric
        label="Sueño promedio"
        groups={groups}
        field="sleepHours"
        formatter={formatSleep}
      />

      <ComparisonMetric
        label="Recuperación promedio"
        groups={groups}
        field="recovery"
        formatter={formatRecovery}
      />
    </div>
  );
}

function ComparisonMetric({ label, groups, field, formatter }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {groups.map((group) => {
          const average = getAverage(group.records, field);

          return (
            <div
              key={`${field}-${group.label}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center"
            >
              <p className="text-xs text-zinc-500">{group.label}</p>

              <p className="mt-1 text-sm font-bold">{formatter(average)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function normalizeRecord(record) {
  return {
    ...record,

    calories: toValidNumber(record.calories),

    sleepHours: toValidNumber(record.sleepHours),

    recovery: toValidNumber(record.recovery),
  };
}

function toValidNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function getAverage(records, field) {
  const values = records
    .map((record) => record[field])
    .filter(
      (value) =>
        value !== null && value !== undefined && Number.isFinite(Number(value)),
    )
    .map(Number);

  if (!values.length) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatCalories(value) {
  if (value === null) {
    return "Sin datos";
  }

  return `${Math.round(value).toLocaleString("es-MX")} kcal`;
}

function formatSleep(value) {
  if (value === null) {
    return "Sin datos";
  }

  return `${value.toFixed(1)} h`;
}

function formatRecovery(value) {
  if (value === null) {
    return "Sin datos";
  }

  return `${value.toFixed(1)}/10`;
}

function buildInterpretation({
  optimalRecords,
  regularRecords,
  failedRecords,
}) {
  if (optimalRecords.length === 0) {
    return "Todavía no hay entrenamientos óptimos suficientes para compararlos con los demás niveles de rendimiento.";
  }

  if (optimalRecords.length < 3) {
    return "Todavía tienes pocos entrenamientos óptimos registrados. Continúa acumulando datos para que las comparaciones sean más representativas.";
  }

  const optimalCalories = getAverage(optimalRecords, "calories");

  const regularCalories = getAverage(regularRecords, "calories");

  const failedCalories = getAverage(failedRecords, "calories");

  const optimalSleep = getAverage(optimalRecords, "sleepHours");

  const regularSleep = getAverage(regularRecords, "sleepHours");

  const failedSleep = getAverage(failedRecords, "sleepHours");

  const optimalRecovery = getAverage(optimalRecords, "recovery");

  const regularRecovery = getAverage(regularRecords, "recovery");

  const failedRecovery = getAverage(failedRecords, "recovery");

  const patterns = [];

  const otherSleepValues = [regularSleep, failedSleep].filter(
    (value) => value !== null,
  );

  if (optimalSleep !== null && otherSleepValues.length > 0) {
    const otherAverage =
      otherSleepValues.reduce((total, value) => total + value, 0) /
      otherSleepValues.length;

    if (optimalSleep > otherAverage + 0.25) {
      patterns.push(
        `tus sesiones óptimas coinciden con más horas de sueño (${optimalSleep.toFixed(
          1,
        )} h de promedio)`,
      );
    }
  }

  const otherRecoveryValues = [regularRecovery, failedRecovery].filter(
    (value) => value !== null,
  );

  if (optimalRecovery !== null && otherRecoveryValues.length > 0) {
    const otherAverage =
      otherRecoveryValues.reduce((total, value) => total + value, 0) /
      otherRecoveryValues.length;

    if (optimalRecovery > otherAverage + 0.5) {
      patterns.push(
        `también aparecen con una recuperación percibida mayor (${optimalRecovery.toFixed(
          1,
        )}/10)`,
      );
    }
  }

  const otherCalories = [regularCalories, failedCalories].filter(
    (value) => value !== null,
  );

  if (optimalCalories !== null && otherCalories.length > 0) {
    const otherAverage =
      otherCalories.reduce((total, value) => total + value, 0) /
      otherCalories.length;

    const difference = optimalCalories - otherAverage;

    if (Math.abs(difference) >= 100) {
      patterns.push(
        difference > 0
          ? `el consumo calórico también es aproximadamente ${Math.round(
              difference,
            ).toLocaleString("es-MX")} kcal mayor`
          : `el consumo calórico es aproximadamente ${Math.abs(
              Math.round(difference),
            ).toLocaleString("es-MX")} kcal menor`,
      );
    }
  }

  if (!patterns.length) {
    return "Por ahora no aparece una diferencia clara entre calorías, sueño o recuperación según el nivel de rendimiento. Conforme registres más días podrán aparecer patrones individuales.";
  }

  return `En tus registros actuales, ${patterns.join(
    " y ",
  )}. Esto describe un patrón observado y no demuestra por sí solo una relación causal.`;
}
