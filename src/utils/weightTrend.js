export function getWeightTrend(records) {
  const validRecords = records
    .filter(
      (record) =>
        record.date &&
        Number.isFinite(Number(record.weight)) &&
        Number(record.weight) > 0,
    )
    .map((record) => ({
      date: record.date,
      weight: Number(record.weight),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (validRecords.length < 7) {
    return createInsufficientResult();
  }

  const weeklyAverages = buildWeeklyAverages(validRecords)
    .filter(
      // Evitamos sacar conclusiones de semanas
      // con un solo pesaje.
      (week) => week.measurements >= 2,
    )
    .slice(-6);

  if (weeklyAverages.length < 4) {
    return {
      ...createInsufficientResult(),
      weeklyAverages,
    };
  }

  const regression = calculateRegression(
    weeklyAverages.map((week) => week.average),
  );

  const latestAverage = weeklyAverages[weeklyAverages.length - 1].average;

  const weeklyChangePercent =
    latestAverage > 0
      ? Number(((regression.slope / latestAverage) * 100).toFixed(2))
      : 0;

  let status;
  let label;

  /*
   * Si todo el intervalo estimado está debajo de 0,
   * existe una tendencia descendente clara.
   */
  if (regression.confidenceHigh < 0) {
    status = "down";
    label = "Descendente";
  } else if (regression.confidenceLow > 0) {
    /*
     * Si todo está arriba de 0,
     * existe una tendencia ascendente clara.
     */
    status = "up";
    label = "Ascendente";
  } else {
    /*
     * Si el intervalo incluye 0,
     * no hay evidencia suficientemente clara
     * de una dirección sostenida.
     */
    status = "stable";
    label = "Estable";
  }

  return {
    status,
    label,

    weeklyChange: Number(regression.slope.toFixed(2)),

    weeklyChangePercent,

    confidenceLow: Number(regression.confidenceLow.toFixed(2)),

    confidenceHigh: Number(regression.confidenceHigh.toFixed(2)),

    weeksUsed: weeklyAverages.length,

    weeklyAverages,

    latestAverage: Number(latestAverage.toFixed(2)),
  };
}

export function isTrendAlignedWithGoal(goal, trend) {
  if (!trend || trend.status === "insufficient") {
    return null;
  }

  if (goal === "Perder peso") {
    return trend.status === "down";
  }

  if (goal === "Mantener peso") {
    return trend.status === "stable";
  }

  if (goal === "Ganar peso") {
    return trend.status === "up";
  }

  return null;
}

function buildWeeklyAverages(records) {
  const weeks = new Map();

  records.forEach((record) => {
    const weekStart = getMondayKey(record.date);

    if (!weeks.has(weekStart)) {
      weeks.set(weekStart, []);
    }

    weeks.get(weekStart).push(record.weight);
  });

  return [...weeks.entries()]
    .map(([weekStart, weights]) => ({
      weekStart,

      average:
        weights.reduce((total, weight) => total + weight, 0) / weights.length,

      measurements: weights.length,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

function calculateRegression(values) {
  const n = values.length;

  const xValues = values.map((_, index) => index);

  const meanX = xValues.reduce((total, value) => total + value, 0) / n;

  const meanY = values.reduce((total, value) => total + value, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let index = 0; index < n; index++) {
    numerator += (xValues[index] - meanX) * (values[index] - meanY);

    denominator += Math.pow(xValues[index] - meanX, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;

  const intercept = meanY - slope * meanX;

  let residualSumSquares = 0;

  for (let index = 0; index < n; index++) {
    const predicted = intercept + slope * xValues[index];

    residualSumSquares += Math.pow(values[index] - predicted, 2);
  }

  const degreesOfFreedom = n - 2;

  const residualVariance =
    degreesOfFreedom > 0 ? residualSumSquares / degreesOfFreedom : 0;

  const slopeStandardError =
    denominator > 0 ? Math.sqrt(residualVariance / denominator) : 0;

  const criticalValue = getTCritical95(degreesOfFreedom);

  const margin = criticalValue * slopeStandardError;

  return {
    slope,
    confidenceLow: slope - margin,
    confidenceHigh: slope + margin,
  };
}

function getTCritical95(df) {
  const values = {
    1: 12.706,
    2: 4.303,
    3: 3.182,
    4: 2.776,
    5: 2.571,
    6: 2.447,
    7: 2.365,
    8: 2.306,
    9: 2.262,
    10: 2.228,
  };

  if (df <= 0) {
    return 0;
  }

  return values[df] ?? 1.96;
}

function getMondayKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  const day = date.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + difference);

  return formatDateKey(date);
}

function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInsufficientResult() {
  return {
    status: "insufficient",
    label: "Recopilando datos",
    weeklyChange: null,
    weeklyChangePercent: null,
    weeksUsed: 0,
    weeklyAverages: [],
    latestAverage: null,
  };
}
