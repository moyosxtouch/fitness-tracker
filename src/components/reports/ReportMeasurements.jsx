const measurementFields = [
  {
    key: "waist",
    label: "Cintura",
  },
  {
    key: "chest",
    label: "Pecho",
  },
  {
    key: "arm",
    label: "Brazo",
  },
  {
    key: "thigh",
    label: "Muslo",
  },
  {
    key: "hips",
    label: "Cadera",
  },
];

export default function ReportMeasurements({ measurements }) {
  const validMeasurements = [...measurements]
    .filter((measurement) => measurement?.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (validMeasurements.length === 0) {
    return null;
  }

  const initialMeasurement = validMeasurements[0];
  const finalMeasurement = validMeasurements.at(-1);

  return (
    <div className="report-measurements mb-6">
      <div className="mb-3">
        <h4 className="font-bold">Evolución de medidas corporales</h4>

        <p className="mt-1 text-sm text-zinc-500">
          Comparación entre la primera y la última medición del periodo.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400">
              <th className="p-3">Medida</th>
              <th className="p-3">Inicial</th>
              <th className="p-3">Final</th>
              <th className="p-3">Cambio</th>
            </tr>
          </thead>

          <tbody>
            {measurementFields.map(({ key, label }) => {
              const initialValue = parseMeasurement(initialMeasurement[key]);
              const finalValue = parseMeasurement(finalMeasurement[key]);

              const change =
                initialValue !== null && finalValue !== null
                  ? finalValue - initialValue
                  : null;

              return (
                <tr key={key} className="border-b border-zinc-800">
                  <td className="p-3 font-semibold">{label}</td>

                  <td className="p-3">{formatMeasurement(initialValue)}</td>

                  <td className="p-3">{formatMeasurement(finalValue)}</td>

                  <td className="p-3 font-semibold">{formatChange(change)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function parseMeasurement(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function formatMeasurement(value) {
  return value !== null ? `${value.toFixed(1)} cm` : "—";
}

function formatChange(value) {
  if (value === null) {
    return "—";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)} cm`;
}
