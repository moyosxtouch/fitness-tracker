import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightCard({ records }) {
  const weightRecords = records
    .filter((record) => Number.isFinite(Number(record.weight)))
    .map((record) => ({
      ...record,
      weight: Number(record.weight),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (weightRecords.length === 0) {
    return (
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-2xl font-bold">Peso</h2>

        <p className="text-zinc-400 mt-4">
          Todavía no tienes registros de peso.
        </p>
      </section>
    );
  }

  const firstRecord = weightRecords[0];
  const latestRecord = weightRecords[weightRecords.length - 1];

  const totalDifference = Number(
    (latestRecord.weight - firstRecord.weight).toFixed(1),
  );

  const recentRecords = [...weightRecords].reverse().slice(0, 5);

  const chartData = weightRecords.slice(-12).map((record) => ({
    date: formatShortDate(record.date),
    weight: record.weight,
  }));

  const weights = chartData.map((record) => record.weight);

  const minimumWeight = Math.min(...weights);
  const maximumWeight = Math.max(...weights);

  const yAxisMinimum = Math.floor((minimumWeight - 0.5) * 10) / 10;
  const yAxisMaximum = Math.ceil((maximumWeight + 0.5) * 10) / 10;

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Scale className="text-lime-400" size={28} />

        <div>
          <h2 className="text-2xl font-bold">Peso</h2>

          <p className="text-sm text-zinc-400">
            Evolución de tus últimos registros
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <p className="text-sm text-zinc-400">Peso actual</p>

          <p className="text-4xl font-bold mt-2">
            {latestRecord.weight}

            <span className="text-base font-normal text-zinc-500 ml-2">kg</span>
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <p className="text-sm text-zinc-400">Cambio desde el inicio</p>

          <div className="flex items-center gap-2 mt-2">
            <DifferenceIcon value={totalDifference} />

            <p className="text-3xl font-bold">
              {totalDifference > 0 ? "+" : ""}
              {totalDifference}

              <span className="text-base font-normal text-zinc-500 ml-2">
                kg
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tendencia del peso</h3>

          <span className="text-sm text-zinc-400">
            Últimos {chartData.length} registros
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 15,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#3f3f46"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
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
                domain={[yAxisMinimum, yAxisMaximum]}
                tick={{
                  fill: "#a1a1aa",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                width={45}
              />

              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(1)} kg`,
                  "Peso",
                ]}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Line
                type="monotone"
                dataKey="weight"
                stroke="#a3e635"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#a3e635",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: "#bef264",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Últimos registros</h3>

        <div className="space-y-2">
          {recentRecords.map((record, index) => {
            const previousRecord = recentRecords[index + 1];

            const difference = previousRecord
              ? Number((record.weight - previousRecord.weight).toFixed(1))
              : 0;

            return (
              <div
                key={record.id}
                className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3"
              >
                <span className="text-sm text-zinc-400">
                  {formatDate(record.date)}
                </span>

                <span className="font-semibold">{record.weight} kg</span>

                <div className="flex items-center gap-1 min-w-20 justify-end">
                  <DifferenceIcon value={difference} small />

                  <span className={getDifferenceColor(difference)}>
                    {difference > 0 ? "+" : ""}
                    {difference !== 0 ? `${difference} kg` : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DifferenceIcon({ value, small = false }) {
  const size = small ? 16 : 24;

  if (value < 0) {
    return <TrendingDown size={size} className="text-emerald-400" />;
  }

  if (value > 0) {
    return <TrendingUp size={size} className="text-amber-400" />;
  }

  return <Minus size={size} className="text-zinc-500" />;
}

function getDifferenceColor(value) {
  if (value < 0) {
    return "text-emerald-400 text-sm";
  }

  if (value > 0) {
    return "text-amber-400 text-sm";
  }

  return "text-zinc-500 text-sm";
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}
