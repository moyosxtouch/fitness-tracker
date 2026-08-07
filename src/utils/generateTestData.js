const NOTES = [
  "Entrenamiento normal",
  "Buen nivel de energía",
  "Pierna pesada",
  "Pecho y hombro",
  "Espalda y bíceps",
  "Entrenamiento de brazo",
  "Dormí muy bien",
  "Poco sueño",
  "Cardio ligero",
  "Caminata 4 km",
  "Entrenamiento intenso",
  "Refeed",
  "Día tranquilo",
  "Buena recuperación",
  "Algo de cansancio",
];

export function generateTestData(days = 365, options = {}) {
  const { startWeight = 94, endWeight = 69.5, endDate = new Date() } = options;

  const records = [];

  for (let index = 0; index < days; index++) {
    const daysFromEnd = days - 1 - index;

    const date = new Date(endDate);

    date.setDate(date.getDate() - daysFromEnd);

    const progress = days === 1 ? 1 : index / (days - 1);

    const expectedWeight = startWeight + (endWeight - startWeight) * progress;

    // Simula fluctuaciones normales del peso.
    const weightNoise = randomBetween(-0.45, 0.45);

    const weight = Number((expectedWeight + weightNoise).toFixed(1));

    const isRestDay = date.getDay() === 0 || Math.random() < 0.08;

    const calories = generateCalories({
      progress,
      isRestDay,
    });

    const performance = isRestDay
      ? "Descanso"
      : generatePerformance(calories, progress);

    records.push({
      id: crypto.randomUUID(),
      date: formatDateKey(date),
      calories,
      weight,
      performance,
      notes: generateNote(performance),
    });
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

function generateCalories({ progress, isRestDay }) {
  /*
   * Al principio simulamos un consumo algo mayor.
   * Conforme pasa el tiempo el promedio baja.
   */
  const baseCalories = 2100 - progress * 350;

  let calories = baseCalories + randomBetween(-180, 180);

  if (isRestDay) {
    calories -= randomBetween(50, 150);
  }

  // Algunos días de refeed.
  if (!isRestDay && Math.random() < 0.12) {
    calories += randomBetween(250, 450);
  }

  return Math.round(Math.max(1450, Math.min(2400, calories)));
}

function generatePerformance(calories, progress) {
  /*
   * Simulamos que un consumo demasiado bajo
   * aumenta ligeramente la posibilidad de
   * rendimiento regular/fallido.
   */

  const random = Math.random();

  if (calories < 1600) {
    if (random < 0.5) {
      return "Óptimo";
    }

    if (random < 0.85) {
      return "Regular";
    }

    return "Fallido";
  }

  // Conforme progresa el año,
  // simulamos cierta adaptación.
  const optimalProbability = 0.68 + progress * 0.12;

  if (random < optimalProbability) {
    return "Óptimo";
  }

  if (random < 0.95) {
    return "Regular";
  }

  return "Fallido";
}

function generateNote(performance) {
  if (performance === "Descanso") {
    const restNotes = [
      "Día de descanso",
      "Recuperación",
      "Caminata ligera",
      "Descanso completo",
    ];

    return randomItem(restNotes);
  }

  if (performance === "Fallido") {
    const failedNotes = [
      "Poco sueño",
      "Fatiga acumulada",
      "Entrenamiento incompleto",
      "Bajo nivel de energía",
    ];

    return randomItem(failedNotes);
  }

  return randomItem(NOTES);
}

function randomBetween(minimum, maximum) {
  return Math.random() * (maximum - minimum) + minimum;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
