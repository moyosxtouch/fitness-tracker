export const CALORIE_MODE_MULTIPLIERS = {
  "Déficit agresivo": 0.75,
  "Déficit moderado": 0.85,
  Mantenimiento: 1,
  "Volumen limpio": 1.05,
  Volumen: 1.1,
};

export function calculateCaloriePlan(profile) {
  if (!profile) {
    return null;
  }

  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.weight);
  const activity = Number(profile.activity);

  if (
    !Number.isFinite(age) ||
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    !Number.isFinite(activity) ||
    age < 18 ||
    height <= 0 ||
    weight <= 0 ||
    activity <= 0
  ) {
    return null;
  }

  const sexAdjustment = profile.sex === "female" ? -161 : 5;

  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + sexAdjustment);

  const maintenance = Math.round(bmr * activity);

  const caloriesByMode = Object.fromEntries(
    Object.entries(CALORIE_MODE_MULTIPLIERS).map(([mode, multiplier]) => [
      mode,
      Math.round((maintenance * multiplier) / 10) * 10,
    ]),
  );

  return {
    bmr,
    maintenance,
    caloriesByMode,
  };
}

export function calculateCaloriesForMode(mode, profile) {
  const plan = calculateCaloriePlan(profile);

  return plan?.caloriesByMode[mode] ?? null;
}
