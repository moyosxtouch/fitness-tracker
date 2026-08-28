export function filterRecordsByPeriod(records, startDate, endDate) {
  return records
    .filter((record) => {
      if (!record.date) {
        return false;
      }

      if (startDate && record.date < startDate) {
        return false;
      }

      if (endDate && record.date > endDate) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateReportStats(records) {
  const recordsWithWeight = records.filter((record) =>
    isValidNumber(record.weight),
  );

  const initialWeight =
    recordsWithWeight.length > 0 ? Number(recordsWithWeight[0].weight) : null;

  const finalWeight =
    recordsWithWeight.length > 0
      ? Number(recordsWithWeight[recordsWithWeight.length - 1].weight)
      : null;

  return {
    recordCount: records.length,

    averageCalories: calculateAverage(records, "calories"),

    averageSleep: calculateAverage(records, "sleep"),

    averageRecovery: calculateAverage(records, "recovery"),

    initialWeight,
    finalWeight,

    weightChange:
      initialWeight !== null && finalWeight !== null
        ? finalWeight - initialWeight
        : null,

    performanceDistribution: calculatePerformanceDistribution(records),
  };
}

export function formatReportDate(date) {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calculateAverage(records, field) {
  const values = records
    .map((record) => Number(record[field]))
    .filter(Number.isFinite);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function calculatePerformanceDistribution(records) {
  return records.reduce((distribution, record) => {
    const performance = record.performance?.trim() || "Sin registrar";

    distribution[performance] = (distribution[performance] ?? 0) + 1;

    return distribution;
  }, {});
}

function isValidNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  return Number.isFinite(Number(value));
}
