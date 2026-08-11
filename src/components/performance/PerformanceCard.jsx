import {
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  Moon,
} from "lucide-react";

export default function PerformanceCard({ records }) {
  const validPerformances = ["Óptimo", "Regular", "Fallido", "Descanso"];

  const validRecords = records
    .filter(
      (record) => record.date && validPerformances.includes(record.performance),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const referenceDate = new Date();

  const weekDates = getWeekDates(referenceDate);

  const weeklyData = weekDates.map((date) => {
    const dateKey = formatDateKey(date);

    const record = validRecords.find((item) => item.date === dateKey);

    return {
      date: dateKey,
      label: formatWeekday(date),
      performance: record?.performance ?? null,
      calories: record?.calories ?? null,
    };
  });

  const weeklyCounts = weeklyData.reduce(
    (counts, item) => {
      if (item.performance === "Óptimo") {
        counts.optimal += 1;
      }

      if (item.performance === "Regular") {
        counts.regular += 1;
      }

      if (item.performance === "Fallido") {
        counts.failed += 1;
      }

      if (item.performance === "Descanso") {
        counts.rest += 1;
      }

      return counts;
    },
    {
      optimal: 0,
      regular: 0,
      failed: 0,
      rest: 0,
    },
  );

  const completedSessions =
    weeklyCounts.optimal + weeklyCounts.regular + weeklyCounts.failed;

  const performanceIsPreliminary = completedSessions < 3;

  const optimalPercentage = completedSessions
    ? Math.round((weeklyCounts.optimal / completedSessions) * 100)
    : 0;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Rendimiento</h2>

            <p className="text-sm text-zinc-400">
              Calidad de tus entrenamientos semanales
            </p>
          </div>
        </div>

        <span className="text-sm text-zinc-400">
          {formatWeekRange(weekDates)}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-7 gap-2">
        {weeklyData.map((item) => (
          <DayCard key={item.date} item={item} />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PerformanceStat
          label="Óptimo"
          value={weeklyCounts.optimal}
          icon={<CheckCircle2 size={22} />}
          className="text-emerald-400"
        />

        <PerformanceStat
          label="Regular"
          value={weeklyCounts.regular}
          icon={<AlertCircle size={22} />}
          className="text-amber-400"
        />

        <PerformanceStat
          label="Fallido"
          value={weeklyCounts.failed}
          icon={<XCircle size={22} />}
          className="text-red-400"
        />

        <PerformanceStat
          label="Descanso"
          value={weeklyCounts.rest}
          icon={<Moon size={22} />}
          className="text-sky-400"
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Rendimiento óptimo semanal</p>

            <p className="mt-1 text-3xl font-bold">{optimalPercentage}%</p>
          </div>

          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{
              width: `${optimalPercentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          {getPerformanceMessage({
            completedSessions,
            optimalPercentage,
            restDays: weeklyCounts.rest,
            performanceIsPreliminary,
          })}
        </p>
      </div>
    </section>
  );
}

function DayCard({ item }) {
  const styles = getPerformanceStyles(item.performance);

  return (
    <div
      className={`min-w-0 rounded-xl border p-2 text-center ${styles.container}`}
      title={getDayTitle(item)}
    >
      <p className="text-[11px] uppercase text-zinc-400">{item.label}</p>

      <div className={`my-2 flex justify-center ${styles.icon}`}>
        {getPerformanceIcon(item.performance)}
      </div>

      <p className={`truncate text-[10px] font-semibold ${styles.text}`}>
        {item.performance ?? "Sin dato"}
      </p>
    </div>
  );
}

function PerformanceStat({ label, value, icon, className }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
      <div className={`mb-2 flex justify-center ${className}`}>{icon}</div>

      <p className="text-2xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-zinc-400">{label}</p>
    </div>
  );
}

function getPerformanceIcon(performance) {
  if (performance === "Óptimo") {
    return <CheckCircle2 size={20} />;
  }

  if (performance === "Regular") {
    return <AlertCircle size={20} />;
  }

  if (performance === "Fallido") {
    return <XCircle size={20} />;
  }

  if (performance === "Descanso") {
    return <Moon size={20} />;
  }

  return <MinusCircle size={20} />;
}

function getPerformanceStyles(performance) {
  const styles = {
    Óptimo: {
      container: "border-emerald-500/30 bg-emerald-500/10",
      icon: "text-emerald-400",
      text: "text-emerald-400",
    },

    Regular: {
      container: "border-amber-500/30 bg-amber-500/10",
      icon: "text-amber-400",
      text: "text-amber-400",
    },

    Fallido: {
      container: "border-red-500/30 bg-red-500/10",
      icon: "text-red-400",
      text: "text-red-400",
    },

    Descanso: {
      container: "border-sky-500/30 bg-sky-500/10",
      icon: "text-sky-400",
      text: "text-sky-400",
    },
  };

  return (
    styles[performance] ?? {
      container: "border-zinc-800 bg-zinc-950",
      icon: "text-zinc-600",
      text: "text-zinc-500",
    }
  );
}

function getDayTitle(item) {
  if (!item.performance) {
    return `${formatFullDate(item.date)}: sin registro`;
  }

  const calories = item.calories
    ? ` · ${Number(item.calories).toLocaleString("es-MX")} kcal`
    : "";

  return `${formatFullDate(item.date)}: ${item.performance}${calories}`;
}

function getPerformanceMessage({
  completedSessions,
  optimalPercentage,
  restDays,
  performanceIsPreliminary,
}) {
  if (completedSessions === 0) {
    if (restDays > 0) {
      return "Esta semana solo tienes días de descanso registrados.";
    }

    return "Todavía no tienes entrenamientos registrados esta semana.";
  }
  if (performanceIsPreliminary) {
    return "Semana en progreso. El porcentaje es preliminar y puede cambiar conforme registres más entrenamientos.";
  }

  if (optimalPercentage >= 80) {
    return "Tu rendimiento semanal ha sido excelente. Los días de descanso no afectan este porcentaje.";
  }

  if (optimalPercentage >= 50) {
    return "Tu rendimiento semanal es bueno, aunque todavía puede mejorar. Los días de descanso no se incluyen en el cálculo.";
  }

  return "Esta semana tuviste pocos entrenamientos óptimos; revisa descanso, calorías y recuperación.";
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

function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekday(date) {
  return date
    .toLocaleDateString("es-MX", {
      weekday: "short",
    })
    .replace(".", "")
    .slice(0, 3);
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

function formatFullDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
