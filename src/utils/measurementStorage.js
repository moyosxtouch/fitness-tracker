const MEASUREMENTS_STORAGE_KEY = "fitness-tracker-measurements";

export function getMeasurements() {
  try {
    const savedMeasurements = localStorage.getItem(MEASUREMENTS_STORAGE_KEY);

    if (!savedMeasurements) {
      return [];
    }

    const parsedMeasurements = JSON.parse(savedMeasurements);

    if (!Array.isArray(parsedMeasurements)) {
      return [];
    }

    return parsedMeasurements
      .filter(isValidMeasurement)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("No se pudieron cargar las medidas corporales:", error);

    return [];
  }
}

export function saveMeasurement(measurement) {
  const measurements = getMeasurements();

  const measurementToSave = {
    ...measurement,
    id: measurement.id ?? crypto.randomUUID(),
    createdAt: measurement.createdAt ?? new Date().toISOString(),
  };

  const measurementsWithoutDuplicate = measurements.filter(
    (item) =>
      item.id !== measurementToSave.id && item.date !== measurementToSave.date,
  );

  const updatedMeasurements = [
    measurementToSave,
    ...measurementsWithoutDuplicate,
  ].sort((a, b) => b.date.localeCompare(a.date));

  localStorage.setItem(
    MEASUREMENTS_STORAGE_KEY,
    JSON.stringify(updatedMeasurements),
  );

  return measurementToSave;
}

export function deleteMeasurement(id) {
  const measurements = getMeasurements();

  const updatedMeasurements = measurements.filter(
    (measurement) => measurement.id !== id,
  );

  localStorage.setItem(
    MEASUREMENTS_STORAGE_KEY,
    JSON.stringify(updatedMeasurements),
  );
}

export function clearMeasurements() {
  localStorage.removeItem(MEASUREMENTS_STORAGE_KEY);
}

function isValidMeasurement(measurement) {
  if (!measurement || !measurement.date) {
    return false;
  }

  return (
    isOptionalPositiveNumber(measurement.weight) &&
    isOptionalPositiveNumber(measurement.waist) &&
    isOptionalPositiveNumber(measurement.chest) &&
    isOptionalPositiveNumber(measurement.arm) &&
    isOptionalPositiveNumber(measurement.thigh) &&
    isOptionalPositiveNumber(measurement.hips)
  );
}

function isOptionalPositiveNumber(value) {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  const number = Number(value);

  return Number.isFinite(number) && number > 0;
}
