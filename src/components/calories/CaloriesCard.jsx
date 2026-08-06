import { useMemo, useState } from "react";
import { Flame } from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CaloriesCard({ records, goalCalories }) {
  const [view, setView] = useState("week");

  const calorieRecords = useMemo(
    () =>
      records
        .filter((record) => Number.isFinite(Number(record.calories)))
        .map((record) => ({
          ...record,
          calories: Number(record.calories),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [records],
  );

  if (calorieRecords.length === 0) {
    return (
      <section className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold">Calorías</h2>

        <p className="text-zinc-400 mt-4">
          Todavía no tienes registros de calorías.
        </p>
      </section>
    );
  }

  const latestRecord = calorieRecords[calorieRecords.length - 1];

  const selectedDate = parseLocalDate(latestRecord.date);

  const weekDates = getWeekDates(selectedDate);

  const weeklyData = weekDates.map((date) => {
    const dateKey = formatDateKey(date);

    const record = calorieRecords.find((item) => item.date === dateKey);

    return {
      date: dateKey,
      label: formatWeekday(date),
      calories: record?.calories ?? 0,
      hasRecord: Boolean(record),
    };
  });

  const monthKey = latestRecord.date.slice(0, 7);

  const monthlyRecords = calorieRecords.filter(
    (record) => record.date.slice(0, 7) === monthKey,
  );

  const monthlyData = monthlyRecords.map((record) => ({
    date: record.date,
    label: record.date.slice(8, 10),
    calories: record.calories,
  }));

  const weeklyEntries = weeklyData.filter((record) => record.hasRecord);

  const weeklyTotal = weeklyEntries.reduce(
    (total, record) => total + record.calories,
    0,
  );

  const weeklyAverage = weeklyEntries.length
    ? Math.round(weeklyTotal / weeklyEntries.length)
    : 0;

  const monthlyTotal = monthlyRecords.reduce(
    (total, record) => total + record.calories,
    0,
  );

  const monthlyAverage = monthlyRecords.length
    ? Math.round(monthlyTotal / monthlyRecords.length)
    : 0;

  const remaining = goalCalories - latestRecord.calories;

  const progress = Math.min(
    Math.round((latestRecord.calories / goalCalories) * 100),
    100,
  );

  return (
    <section className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Flame className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Calorías</h2>

            <p className="text-sm text-zinc-400">
              Seguimiento semanal y mensual
            </p>
          </div>
        </div>

        <div className="flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              view === "week"
                ? "bg-lime-400 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Semana
          </button>

          <button
            type="button"
            onClick={() => setView("month")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              view === "month"
                ? "bg-lime-400 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          title="Último registro"
          value={latestRecord.calories.toLocaleString("es-MX")}
          unit="kcal"
        />

        <Stat
          title="Meta diaria"
          value={Number(goalCalories).toLocaleString("es-MX")}
          unit="kcal"
        />

        <Stat
          title={remaining >= 0 ? "Restantes" : "Excedente"}
          value={Math.abs(remaining).toLocaleString("es-MX")}
          unit="kcal"
        />

        <Stat
          title={view === "week" ? "Promedio semanal" : "Promedio mensual"}
          value={
            view === "week"
              ? weeklyAverage.toLocaleString("es-MX")
              : monthlyAverage.toLocaleString("es-MX")
          }
          unit="kcal"
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>Progreso del último registro</span>

          <span>{progress}%</span>
        </div>

        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime-400 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p
          className={`text-sm mt-2 ${
            remaining < 0 ? "text-amber-400" : "text-zinc-500"
          }`}
        >
          {getRemainingMessage(remaining)}
        </p>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold">
              {view === "week" ? "Consumo semanal" : "Consumo mensual"}
            </h3>

            <p className="text-xs text-zinc-500 mt-1">
              {view === "week"
                ? formatWeekRange(weekDates)
                : formatMonthTitle(selectedDate)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-400">Total</p>

            <p className="font-semibold">
              {(view === "week" ? weeklyTotal : monthlyTotal).toLocaleString(
                "es-MX",
              )}{" "}
              kcal
            </p>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            {view === "week" ? (
              <BarChart
                data={weeklyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="#3f3f46"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fill: "#a1a1aa",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke: "#3f3f46",
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#a1a1aa",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip content={<CaloriesTooltip />} />

                <ReferenceLine
                  y={goalCalories}
                  stroke="#a1a1aa"
                  strokeDasharray="5 5"
                />

                <Bar dataKey="calories" fill="#a3e635" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="#3f3f46"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fill: "#a1a1aa",
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke: "#3f3f46",
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#a1a1aa",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip content={<CaloriesTooltip />} />

                <ReferenceLine
                  y={goalCalories}
                  stroke="#a1a1aa"
                  strokeDasharray="5 5"
                />

                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#a3e635"
                  strokeWidth={3}
                  fill="#a3e635"
                  fillOpacity={0.15}
                  activeDot={{
                    r: 6,
                  }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-zinc-500 mt-2">
          La línea punteada representa tu meta diaria.
        </p>
      </div>
    </section>
  );
}

function Stat({ title, value, unit }) {
  return (
    <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800">
      <p className="text-zinc-400 text-sm">{title}</p>

      <h3 className="text-3xl font-bold mt-2">{value}</h3>

      <span className="text-zinc-500 text-sm">{unit}</span>
    </div>
  );
}

function CaloriesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const calories = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 shadow-xl">
      <p className="text-sm text-zinc-400">{label}</p>

      <p className="font-bold text-white mt-1">
        {Number(calories).toLocaleString("es-MX")} kcal
      </p>
    </div>
  );
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

function formatWeekday(date) {
  const label = date.toLocaleDateString("es-MX", {
    weekday: "short",
  });

  return label.replace(".", "").slice(0, 3);
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

function formatMonthTitle(date) {
  const value = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getRemainingMessage(remaining) {
  if (remaining > 0) {
    return `Faltan ${remaining.toLocaleString(
      "es-MX",
    )} kcal para alcanzar la meta diaria.`;
  }

  if (remaining < 0) {
    return `Superaste la meta por ${Math.abs(remaining).toLocaleString(
      "es-MX",
    )} kcal.`;
  }

  return "Alcanzaste exactamente tu meta diaria.";
}
