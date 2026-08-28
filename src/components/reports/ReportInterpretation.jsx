export default function ReportInterpretation({
  stats,
  settings,
  measurements,
}) {
  const observations = buildObservations({
    stats,
    settings,
    measurements,
  });

  if (observations.length === 0) {
    return null;
  }

  return (
    <div className="report-interpretation mb-6 rounded-xl border border-zinc-800 p-4">
      <h4 className="font-bold">Resumen del periodo</h4>

      <ul className="mt-3 grid gap-2 text-sm text-zinc-400">
        {observations.map((observation) => (
          <li key={observation} className="flex gap-2">
            <span className="text-lime-400">•</span>

            <span>{observation}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-zinc-500">
        Resumen descriptivo generado a partir de los registros disponibles.
      </p>
    </div>
  );
}

function buildObservations({ stats, settings, measurements }) {
  const observations = [];

  observations.push(
    `El periodo contiene ${stats.recordCount} ${
      stats.recordCount === 1 ? "registro" : "registros"
    } de seguimiento.`,
  );

  if (stats.initialWeight !== null && stats.finalWeight !== null) {
    const weightChange = stats.finalWeight - stats.initialWeight;

    if (Math.abs(weightChange) < 0.05) {
      observations.push(
        `El peso se mantuvo estable en ${stats.finalWeight.toFixed(1)} kg.`,
      );
    } else {
      observations.push(
        `El peso ${weightChange > 0 ? "aumentó" : "disminuyó"} ${Math.abs(
          weightChange,
        ).toFixed(1)} kg, pasando de ${stats.initialWeight.toFixed(
          1,
        )} a ${stats.finalWeight.toFixed(1)} kg.`,
      );
    }
  }

  if (
    stats.averageCalories !== null &&
    Number.isFinite(Number(settings.goalCalories))
  ) {
    const calorieDifference =
      stats.averageCalories - Number(settings.goalCalories);

    if (Math.abs(calorieDifference) < 50) {
      observations.push(
        `El consumo promedio se mantuvo cercano al objetivo de ${Number(
          settings.goalCalories,
        ).toLocaleString("es-MX")} kcal.`,
      );
    } else {
      observations.push(
        `El consumo promedio estuvo ${Math.abs(
          Math.round(calorieDifference),
        ).toLocaleString("es-MX")} kcal ${
          calorieDifference > 0 ? "por encima" : "por debajo"
        } del objetivo configurado.`,
      );
    }
  }

  const waistChange = calculateMeasurementChange(measurements, "waist");

  if (waistChange !== null) {
    if (Math.abs(waistChange) < 0.05) {
      observations.push("La medida de cintura se mantuvo estable.");
    } else {
      observations.push(
        `La cintura ${waistChange > 0 ? "aumentó" : "disminuyó"} ${Math.abs(
          waistChange,
        ).toFixed(1)} cm entre la primera y la última medición.`,
      );
    }
  }

  if (stats.averageRecovery !== null) {
    observations.push(
      `La recuperación promedio registrada fue de ${stats.averageRecovery.toFixed(
        1,
      )}/10.`,
    );
  }

  return observations;
}

function calculateMeasurementChange(measurements, field) {
  const validMeasurements = [...measurements]
    .filter(
      (measurement) =>
        measurement?.date &&
        measurement[field] !== null &&
        measurement[field] !== undefined &&
        measurement[field] !== "" &&
        Number.isFinite(Number(measurement[field])),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  if (validMeasurements.length < 2) {
    return null;
  }

  return (
    Number(validMeasurements.at(-1)[field]) -
    Number(validMeasurements[0][field])
  );
}
