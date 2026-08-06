import { Flame, Scale, Dumbbell, Target, CalendarDays } from "lucide-react";

export default function TodaySummary({ records, settings }) {
  const sortedRecords = [...records].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const latestRecord = sortedRecords[0];

  if (!latestRecord) {
    return (
      <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">{formatCurrentDate()}</p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Fitness Tracker
            </h1>

            <p className="text-zinc-400 mt-3">
              Agrega tu primer registro para comenzar el seguimiento.
            </p>
          </div>

          <div className="self-start bg-lime-400 text-black px-4 py-2 rounded-full font-semibold">
            {settings.mode}
          </div>
        </div>
      </section>
    );
  }

  const calories = Number(latestRecord.calories);
  const weight = Number(latestRecord.weight);

  const remainingCalories = settings.goalCalories - calories;

  const weightDifference = Number((weight - settings.goalWeight).toFixed(1));

  return (
    <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 shadow-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CalendarDays size={16} />

            <span>Último registro: {formatRecordDate(latestRecord.date)}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Fitness Tracker
          </h1>
        </div>

        <div className="self-start bg-lime-400 text-black px-4 py-2 rounded-full font-semibold">
          {settings.mode}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          icon={<Flame size={28} />}
          title="Calorías"
          value={`${calories.toLocaleString("es-MX")} kcal`}
          description={getCaloriesDescription(remainingCalories)}
          color="bg-orange-500"
        />

        <SummaryCard
          icon={<Scale size={28} />}
          title="Peso actual"
          value={`${weight.toFixed(1)} kg`}
          description={getWeightDescription(weightDifference)}
          color="bg-sky-500"
        />

        <SummaryCard
          icon={<Dumbbell size={28} />}
          title="Rendimiento"
          value={latestRecord.performance}
          description={latestRecord.notes || "Sin notas"}
          color={getPerformanceColor(latestRecord.performance)}
        />

        <SummaryCard
          icon={<Target size={28} />}
          title="Objetivo"
          value={`${Number(settings.goalWeight).toFixed(1)} kg`}
          description={`${Number(settings.goalCalories).toLocaleString(
            "es-MX",
          )} kcal diarias`}
          color="bg-violet-500"
        />
      </div>
    </section>
  );
}

function SummaryCard({ icon, title, value, description, color }) {
  return (
    <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800">
      <div
        className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white`}
      >
        {icon}
      </div>

      <p className="text-zinc-400 text-sm">{title}</p>

      <h2 className="text-2xl md:text-3xl font-bold mt-1">{value}</h2>

      <p className="text-xs text-zinc-500 mt-2 truncate" title={description}>
        {description}
      </p>
    </div>
  );
}

function getCaloriesDescription(remaining) {
  if (remaining > 0) {
    return `Faltan ${remaining.toLocaleString("es-MX")} kcal para la meta`;
  }

  if (remaining < 0) {
    return `${Math.abs(remaining).toLocaleString("es-MX")} kcal sobre la meta`;
  }

  return "Meta diaria alcanzada";
}

function getWeightDescription(difference) {
  if (difference > 0) {
    return `${difference.toFixed(1)} kg por encima del objetivo`;
  }

  if (difference < 0) {
    return `${Math.abs(difference).toFixed(1)} kg por debajo del objetivo`;
  }

  return "Peso objetivo alcanzado";
}

function getPerformanceColor(performance) {
  const colors = {
    Óptimo: "bg-emerald-500",
    Regular: "bg-amber-500",
    Fallido: "bg-red-500",
    Descanso: "bg-sky-500",
  };

  return colors[performance] || "bg-zinc-600";
}

function formatRecordDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrentDate() {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
