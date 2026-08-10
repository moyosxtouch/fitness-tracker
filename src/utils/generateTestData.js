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

const TREND_CONFIG = {
  descending: {
    startWeight: 78,
    endWeight: 69.5,
    baseCalories: 1850,
    calorieDrift: -100,
  },

  maintenance: {
    startWeight: 70,
    endWeight: 70,
    baseCalories: 2050,
    calorieDrift: 0,
  },

  ascending: {
    startWeight: 68,
    endWeight: 74,
    baseCalories: 2300,
    calorieDrift: 100,
  },
};

export function generateTestData(days = 365, options = {}) {
  const { trend = "descending", endDate = new Date() } = options;

  const config = TREND_CONFIG[trend] ?? TREND_CONFIG.descending;

  const records = [];

  let temporaryWeightBoost = 0;

  for (let index = 0; index < days; index++) {
    const daysFromEnd = days - 1 - index;

    const date = new Date(endDate);

    date.setDate(date.getDate() - daysFromEnd);

    const progress = days === 1 ? 1 : index / (days - 1);

    const expectedWeight =
      config.startWeight + (config.endWeight - config.startWeight) * progress;

    /*
     * Fluctuación diaria normal.
     */
    const dailyNoise = randomBetween(-0.28, 0.28);

    /*
     * Algunos días simulamos una comida alta
     * en carbohidratos/sodio.
     *
     * El efecto puede mantenerse 1–2 días.
     */
    if (Math.random() < 0.07) {
      temporaryWeightBoost = randomBetween(0.3, 0.55);
    } else {
      temporaryWeightBoost *= randomBetween(0.25, 0.55);

      if (temporaryWeightBoost < 0.05) {
        temporaryWeightBoost = 0;
      }
    }

    const weight = Number(
      (expectedWeight + dailyNoise + temporaryWeightBoost).toFixed(1),
    );

    const isRestDay = date.getDay() === 0 || Math.random() < 0.08;

    const recoveryData = generateRecoveryData({
      isRestDay,
    });

    const calories = generateCalories({
      progress,
      isRestDay,
      trend,
      config,
    });

    const performance = isRestDay
      ? "Descanso"
      : generatePerformance({
          calories,
          sleepHours: recoveryData.sleepHours,
          recovery: recoveryData.recovery,
        });

    records.push({
      id: crypto.randomUUID(),

      date: formatDateKey(date),

      calories,

      weight,

      performance,

      sleepHours: recoveryData.sleepHours,

      recovery: recoveryData.recovery,

      notes: generateNote(performance),
    });
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

function generateCalories({ progress, isRestDay, config }) {
  const baseCalories = config.baseCalories + config.calorieDrift * progress;

  let calories = baseCalories + randomBetween(-180, 180);

  if (isRestDay) {
    calories -= randomBetween(50, 130);
  }

  /*
   * Refeed / comida alta
   * aproximadamente 1 de cada 10 días.
   */
  if (!isRestDay && Math.random() < 0.1) {
    calories += randomBetween(250, 500);
  }

  return Math.round(Math.max(1400, Math.min(2800, calories)));
}

function generateRecoveryData({ isRestDay }) {
  /*
   * Sueño no perfectamente distribuido.
   */
  let sleepHours = randomBetween(5.5, 8.5);

  /*
   * Algunos días particularmente buenos.
   */
  if (Math.random() < 0.18) {
    sleepHours += randomBetween(0.3, 0.8);
  }

  /*
   * Algunos días de poco sueño.
   */
  if (Math.random() < 0.15) {
    sleepHours -= randomBetween(0.8, 1.5);
  }

  sleepHours = Math.max(4, Math.min(9.5, sleepHours));

  sleepHours = Math.round(sleepHours * 2) / 2;

  /*
   * Recuperación parcialmente relacionada
   * con el sueño, pero no determinada
   * completamente por él.
   */
  let recovery = 4 + (sleepHours - 5) * 1.15 + randomBetween(-1.5, 1.5);

  if (isRestDay) {
    recovery += randomBetween(0.2, 1);
  }

  recovery = Math.round(Math.max(1, Math.min(10, recovery)));

  return {
    sleepHours,
    recovery,
  };
}

function generatePerformance({ calories, sleepHours, recovery }) {
  let score = 0;

  /*
   * Sueño.
   */
  if (sleepHours >= 7.5) {
    score += 2;
  } else if (sleepHours >= 6.5) {
    score += 1;
  } else if (sleepHours < 5.5) {
    score -= 2;
  }

  /*
   * Recuperación percibida.
   */
  if (recovery >= 8) {
    score += 3;
  } else if (recovery >= 6) {
    score += 1;
  } else if (recovery <= 4) {
    score -= 3;
  }

  /*
   * Calorías bajas pueden influir,
   * pero no son el factor dominante.
   */
  if (calories < 1550) {
    score -= 1;
  }

  /*
   * Ruido para que la relación
   * no sea perfecta.
   */
  score += randomBetween(-1.5, 1.5);

  if (score >= 2) {
    return "Óptimo";
  }

  if (score >= -1.5) {
    return "Regular";
  }

  return "Fallido";
}

function generateNote(performance) {
  if (performance === "Descanso") {
    return randomItem([
      "Día de descanso",
      "Recuperación",
      "Caminata ligera",
      "Descanso completo",
    ]);
  }

  if (performance === "Fallido") {
    return randomItem([
      "Poco sueño",
      "Fatiga acumulada",
      "Entrenamiento incompleto",
      "Bajo nivel de energía",
    ]);
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
