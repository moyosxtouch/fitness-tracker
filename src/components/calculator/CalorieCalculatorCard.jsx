import { useMemo, useState } from "react";
import { Calculator, Target } from "lucide-react";
import { calculateCaloriePlan } from "../../utils/calorieCalculator";

const activityLevels = [
  {
    value: "1.2",
    label: "Sedentario",
    description: "Trabajo sentado y poco ejercicio",
  },
  {
    value: "1.375",
    label: "Actividad ligera",
    description: "Entrenamiento de 1 a 3 días por semana",
  },
  {
    value: "1.55",
    label: "Actividad moderada",
    description: "Entrenamiento de 3 a 5 días por semana",
  },
  {
    value: "1.725",
    label: "Actividad alta",
    description: "Entrenamiento de 6 a 7 días por semana",
  },
  {
    value: "1.9",
    label: "Actividad muy alta",
    description: "Ejercicio intenso y trabajo físicamente activo",
  },
];

const caloriePhases = [
  {
    key: "aggressiveDeficit",
    label: "Déficit agresivo",
    description: "25% por debajo del mantenimiento",

    color: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  {
    key: "moderateDeficit",
    label: "Déficit moderado",
    description: "15% por debajo del mantenimiento",

    color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  {
    key: "maintenance",
    label: "Mantenimiento",
    description: "Calorías estimadas para mantener el peso",

    color: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  {
    key: "leanBulk",
    label: "Volumen limpio",
    secondaryLabel: "Lean bulk",
    description: "5% por encima del mantenimiento",

    color: "border-lime-400/30 bg-lime-400/10 text-lime-300",
  },
  {
    key: "bulk",
    label: "Volumen",
    secondaryLabel: "Bulk",
    description: "10% por encima del mantenimiento",

    color: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
];

export default function CalorieCalculatorCard({
  onSelectCalories,
  initialProfile = {},
  latestWeight = null,
}) {
  const [form, setForm] = useState({
    sex: initialProfile.sex ?? "male",
    age: initialProfile.age ?? "",
    height: initialProfile.height ?? "",
    weight:
      latestWeight !== null && latestWeight !== undefined
        ? String(latestWeight)
        : (initialProfile.weight ?? ""),
    activity: initialProfile.activity ?? "1.55",
  });

  const results = useMemo(() => calculateCalories(form), [form]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400">
          <Calculator size={25} />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Calculadora de calorías</h2>

          <p className="text-sm text-zinc-400">
            Estima tus calorías según tus datos y objetivo.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h3 className="mb-4 font-bold">Datos personales</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <CalculatorField label="Sexo biológico">
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
              >
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </CalculatorField>

            <CalculatorField label="Edad">
              <input
                type="number"
                name="age"
                min="18"
                max="100"
                value={form.age}
                onChange={handleChange}
                placeholder="Ej. 39"
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
              />
            </CalculatorField>

            <CalculatorField label="Estatura (cm)">
              <input
                type="number"
                name="height"
                min="120"
                max="230"
                value={form.height}
                onChange={handleChange}
                placeholder="Ej. 170"
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
              />
            </CalculatorField>

            <CalculatorField label="Peso actual (kg)">
              <input
                type="number"
                name="weight"
                min="30"
                max="300"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                placeholder="Ej. 67"
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
              />
            </CalculatorField>

            <CalculatorField label="Nivel de actividad">
              <select
                name="activity"
                value={form.activity}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
              >
                {activityLevels.map((activity) => (
                  <option key={activity.value} value={activity.value}>
                    {activity.label}
                  </option>
                ))}
              </select>

              <span className="text-xs text-zinc-500">
                {
                  activityLevels.find(
                    (activity) => activity.value === form.activity,
                  )?.description
                }
              </span>
            </CalculatorField>
          </div>
        </div>

        <div>
          {!results ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-zinc-500">
              Introduce edad, estatura y peso para calcular tus calorías.
            </div>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <ResultSummary
                  label="Metabolismo basal"
                  value={`${results.bmr.toLocaleString("es-MX")} kcal`}
                />

                <ResultSummary
                  label="Mantenimiento estimado"
                  value={`${results.maintenance.toLocaleString("es-MX")} kcal`}
                />
              </div>

              <div className="grid gap-3">
                {results.phases.map((phase) => (
                  <div
                    key={phase.key}
                    className={`rounded-2xl border p-4 ${phase.color}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {phase.label}

                          {phase.secondaryLabel && (
                            <span className="ml-2 text-xs font-normal opacity-70">
                              ({phase.secondaryLabel})
                            </span>
                          )}
                        </p>

                        <p className="mt-1 text-xs opacity-70">
                          {phase.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {phase.calories.toLocaleString("es-MX")} kcal
                        </p>

                        {onSelectCalories && (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectCalories({
                                calories: phase.calories,
                                mode: phase.label,
                                profile: {
                                  sex: form.sex,
                                  age: form.age,
                                  height: form.height,
                                  weight: form.weight,
                                  activity: form.activity,
                                },
                              })
                            }
                            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-current/20 bg-black/20 px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 hover:bg-black/30 hover:brightness-110 active:translate-y-0 active:scale-95"
                          >
                            <Target size={14} />
                            Usar este objetivo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.phases[0].calories < 1200 && (
                <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  El déficit agresivo produce una ingesta inferior a 1,200 kcal.
                  No se recomienda utilizar este resultado sin orientación
                  profesional.
                </p>
              )}

              <p className="mt-4 text-xs leading-relaxed text-zinc-500">
                Los resultados son estimaciones iniciales. Ajusta las calorías
                conforme a la tendencia de peso, medidas, rendimiento y
                recuperación durante varias semanas.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function CalculatorField({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function ResultSummary({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function calculateCalories(form) {
  const plan = calculateCaloriePlan(form);

  if (!plan) {
    return null;
  }

  const phases = caloriePhases.map((phase) => ({
    ...phase,
    calories: plan.caloriesByMode[phase.label],
  }));

  return {
    bmr: plan.bmr,
    maintenance: plan.maintenance,
    phases,
  };
}
