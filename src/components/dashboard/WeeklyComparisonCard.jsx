import {
  ArrowDown,
  ArrowUp,
  CalendarRange,
  Flame,
  Minus,
  Scale,
} from "lucide-react";

export default function WeeklyComparisonCard({ records }) {
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

  if (validRecords.length === 0) {
    return null;
  }

  const latestDate = parseLocalDate(validRecords[validRecords.length - 1].date);

  const currentWeekDates = getWeekDates(latestDate);

  const previousWeekReference = new Date(currentWeekDates[0]);

  previousWeekReference.setDate(previousWeekReference.getDate() - 7);

  const previousWeekDates = getWeekDates(previousWeekReference);

  const currentWeek = getRecordsForDates(validRecords, currentWeekDates);

  const previousWeek = getRecordsForDates(validRecords, previousWeekDates);

  const currentCaloriesAverage = getCaloriesAverage(currentWeek);

  const previousCaloriesAverage = getCaloriesAverage(previousWeek);

  const calorieDifference =
    currentCaloriesAverage && previousCaloriesAverage
      ? currentCaloriesAverage - previousCaloriesAverage
      : 0;

  const currentWeightAverage = getWeightAverage(currentWeek);

  const previousWeightAverage = getWeightAverage(previousWeek);

  const weightDifference =
    currentWeightAverage && previousWeightAverage
      ? Number((currentWeightAverage - previousWeightAverage).toFixed(2))
      : 0;

  const currentOptimalPercentage = getOptimalPercentage(currentWeek);

  const previousOptimalPercentage = getOptimalPercentage(previousWeek);

  const performanceDifference =
    currentOptimalPercentage - previousOptimalPercentage;

  const currentTrainingCount = getTrainingRecords(currentWeek).length;

  const previousTrainingCount = getTrainingRecords(previousWeek).length;

  const currentRestDays = currentWeek.filter(
    (record) => record.performance === "Descanso",
  ).length;

  const previousRestDays = previousWeek.filter(
    (record) => record.performance === "Descanso",
  ).length;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarRange className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Comparación semanal</h2>

            <p className="text-sm text-zinc-400">
              Esta semana frente a la anterior
            </p>
          </div>
        </div>

        <span className="text-sm text-zinc-400">
          {formatWeekRange(currentWeekDates)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonCard
          icon={<Flame size={23} />}
          title="Promedio de calorías"
          currentValue={
            currentCaloriesAverage
              ? `${currentCaloriesAverage.toLocaleString("es-MX")} kcal`
              : "Sin datos"
          }
          previousValue={
            previousCaloriesAverage
              ? `${previousCaloriesAverage.toLocaleString("es-MX")} kcal`
              : "Sin datos"
          }
          difference={calorieDifference}
          differenceSuffix="kcal"
          iconClass="bg-orange-500/15 text-orange-400"
        />

        <ComparisonCard
          icon={<Scale size={23} />}
          title="Peso promedio"
          currentValue={
            currentWeightAverage
              ? `${currentWeightAverage.toFixed(2)} kg`
              : "Sin datos"
          }
          previousValue={
            previousWeightAverage
              ? `${previousWeightAverage.toFixed(2)} kg`
              : "Sin datos"
          }
          difference={weightDifference}
          differenceSuffix="kg"
          iconClass="bg-sky-500/15 text-sky-400"
          inverseColors
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <RestSummary
          title="Esta semana"
          trainingCount={currentTrainingCount}
          restDays={currentRestDays}
        />

        <RestSummary
          title="Semana anterior"
          trainingCount={previousTrainingCount}
          restDays={previousRestDays}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="mb-2 text-sm text-zinc-400">Interpretación</p>

        <p className="text-lg leading-relaxed">
          {buildWeeklySummary({
            currentWeek,
            previousWeek,
            calorieDifference,
            weightDifference,
            performanceDifference,
            currentTrainingCount,
            previousTrainingCount,
            currentRestDays,
          })}
        </p>

        <p className="mt-3 text-xs text-zinc-500">
          Los días de descanso sí cuentan para el promedio de calorías y peso,
          pero no para el porcentaje de rendimiento del gimnasio.
        </p>
      </div>
    </section>
  );
}

function ComparisonCard({
  icon,
  title,
  currentValue,
  previousValue,
  difference,
  differenceSuffix,
  iconClass,
  neutralDifference = false,
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-sm text-zinc-400">{title}</p>

      <p className="mt-1 text-2xl font-bold">{currentValue}</p>

      <p className="mt-2 text-xs text-zinc-500">
        Semana anterior: {previousValue}
      </p>

      <Difference
        value={difference}
        suffix={differenceSuffix}
        neutral={neutralDifference}
      />
    </div>
  );
}

function RestSummary({ title, trainingCount, restDays }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm font-semibold">{title}</p>

      <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
        <span>
          Entrenamientos:{" "}
          <strong className="text-white">{trainingCount}</strong>
        </span>

        <span>
          Descansos: <strong className="text-sky-400">{restDays}</strong>
        </span>
      </div>
    </div>
  );
}

function Difference({ value, suffix, neutral = false }) {
  if (!value) {
    return (
      <div className="mt-3 flex items-center gap-1 text-sm text-zinc-500">
        <Minus size={16} />
        Sin cambio
      </div>
    );
  }

  const isPositive = value > 0;

  const colorClass = neutral
    ? "text-sky-400"
    : isPositive
      ? "text-emerald-400"
      : "text-amber-400";

  return (
    <div className={`mt-3 flex items-center gap-1 text-sm ${colorClass}`}>
      {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      {isPositive ? "+" : ""}
      {Math.abs(value).toLocaleString("es-MX")} {suffix}
    </div>
  );
}

function getRecordsForDates(records, dates) {
  const keys = dates.map(formatDateKey);

  return records.filter((record) => keys.includes(record.date));
}

function getCaloriesAverage(records) {
  if (records.length === 0) {
    return 0;
  }

  return Math.round(
    records.reduce((total, record) => total + record.calories, 0) /
      records.length,
  );
}

function getWeightAverage(records) {
  if (records.length === 0) {
    return 0;
  }

  return (
    records.reduce((total, record) => total + record.weight, 0) / records.length
  );
}

function getTrainingRecords(records) {
  return records.filter(
    (record) =>
      record.performance === "Óptimo" ||
      record.performance === "Regular" ||
      record.performance === "Fallido",
  );
}

function getOptimalPercentage(records) {
  const trainingRecords = getTrainingRecords(records);

  if (trainingRecords.length === 0) {
    return 0;
  }

  const optimalRecords = trainingRecords.filter(
    (record) => record.performance === "Óptimo",
  );

  return Math.round((optimalRecords.length / trainingRecords.length) * 100);
}

function buildWeeklySummary({
  currentWeek,
  previousWeek,
  calorieDifference,
  weightDifference,
  performanceDifference,
  currentTrainingCount,
  previousTrainingCount,
  currentRestDays,
}) {
  if (currentWeek.length === 0 || previousWeek.length === 0) {
    return "Necesitas registros en dos semanas distintas para generar una comparación completa.";
  }

  const caloriesText =
    calorieDifference > 0
      ? `Esta semana consumes en promedio ${Math.abs(
          calorieDifference,
        )} kcal más al día.`
      : calorieDifference < 0
        ? `Esta semana consumes en promedio ${Math.abs(
            calorieDifference,
          )} kcal menos al día.`
        : "Tu promedio calórico se mantiene igual.";

  const weightText =
    weightDifference < 0
      ? `El promedio semanal fue ${Math.abs(weightDifference).toFixed(
          2,
        )} kg menor que la semana anterior.`
      : weightDifference > 0
        ? `El promedio semanal fue ${weightDifference.toFixed(
            2,
          )} kg mayor que la semana anterior.`
        : "El promedio semanal fue igual al de la semana anterior.";

  let performanceText;

  if (currentTrainingCount === 0 || previousTrainingCount === 0) {
    performanceText =
      "No hay suficientes entrenamientos en ambas semanas para comparar el rendimiento.";
  } else if (performanceDifference > 0) {
    performanceText = "Además, mejoró tu porcentaje de entrenamientos óptimos.";
  } else if (performanceDifference < 0) {
    performanceText =
      "Sin embargo, bajó tu porcentaje de entrenamientos óptimos.";
  } else {
    performanceText = "Tu rendimiento se mantiene similar.";
  }

  const restText =
    currentRestDays > 0
      ? `Esta semana registraste ${currentRestDays} ${
          currentRestDays === 1 ? "día de descanso" : "días de descanso"
        }.`
      : "";

  return `${caloriesText} ${weightText} ${performanceText} ${restText}`.trim();
}

function getWeekDates(referenceDate) {
  const monday = new Date(referenceDate);
  const day = monday.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + difference);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return date;
  });
}

function parseLocalDate(date) {
  return new Date(`${date}T00:00:00`);
}

function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekRange(dates) {
  const first = dates[0];
  const last = dates[dates.length - 1];

  return `${first.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  })} – ${last.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}
