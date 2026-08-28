import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ReportTrendChart({ records, goalCalories }) {
  const data = records.map((record) => ({
    date: formatShortDate(record.date),

    calories: isValidNumber(record.calories) ? Number(record.calories) : null,

    weight: isValidNumber(record.weight) ? Number(record.weight) : null,
  }));

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="report-chart mb-6 break-inside-avoid rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-4">
        <h4 className="font-bold">Evolución de calorías y peso</h4>

        <p className="mt-1 text-xs text-zinc-500">
          Barras: consumo diario · Línea: peso registrado
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <ComposedChart
          width={1000}
          height={220}
          data={data}
          margin={{
            top: 10,
            right: 20,
            bottom: 5,
            left: 0,
          }}
        >
          <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            stroke="#a1a1aa"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />

          <YAxis
            yAxisId="calories"
            stroke="#a3e635"
            tick={{ fontSize: 11 }}
            width={55}
          />

          <YAxis
            yAxisId="weight"
            orientation="right"
            stroke="#a78bfa"
            tick={{ fontSize: 11 }}
            width={45}
            domain={["dataMin - 1", "dataMax + 1"]}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "12px",
            }}
            labelStyle={{
              color: "#ffffff",
            }}
            formatter={(value, name) => {
              if (name === "Calorías") {
                return [`${Number(value).toLocaleString("es-MX")} kcal`, name];
              }

              return [`${Number(value).toFixed(1)} kg`, name];
            }}
          />

          {isValidNumber(goalCalories) && (
            <ReferenceLine
              yAxisId="calories"
              y={Number(goalCalories)}
              stroke="#f59e0b"
              strokeDasharray="6 4"
              label={{
                value: "Meta",
                fill: "#f59e0b",
                fontSize: 11,
              }}
            />
          )}

          <Bar
            yAxisId="calories"
            dataKey="calories"
            name="Calorías"
            fill="#a3e635"
            fillOpacity={0.55}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />

          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            name="Peso"
            stroke="#a78bfa"
            strokeWidth={3}
            dot={{
              r: 3,
              fill: "#a78bfa",
            }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
        <div className="report-chart-legend mt-3 flex items-center justify-center gap-6 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="report-legend-calories h-3 w-3 rounded-sm bg-lime-400" />
            Calorías
          </span>

          <span className="flex items-center gap-2">
            <span className="report-legend-weight h-1 w-6 rounded-full bg-violet-400" />
            Peso
          </span>
        </div>
      </div>
    </div>
  );
}

function formatShortDate(date) {
  if (!date) {
    return "";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

function isValidNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  return Number.isFinite(Number(value));
}
