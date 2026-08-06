import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";

export default function SettingsCard({ settings, onSaveSettings }) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const goalCalories = Number(form.goalCalories);
    const goalWeight = Number(form.goalWeight);

    if (
      !Number.isFinite(goalCalories) ||
      !Number.isFinite(goalWeight) ||
      goalCalories <= 0 ||
      goalWeight <= 0
    ) {
      alert("Introduce objetivos válidos.");
      return;
    }

    onSaveSettings({
      goalCalories,
      goalWeight,
      mode: form.mode,
    });
  }

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-lime-400" size={28} />

        <div>
          <h2 className="text-2xl font-bold">Configuración</h2>

          <p className="text-sm text-zinc-400">Define tu objetivo actual.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Meta diaria de calorías</span>

          <input
            type="number"
            min="1"
            name="goalCalories"
            value={form.goalCalories}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Peso objetivo</span>

          <input
            type="number"
            min="1"
            step="0.1"
            name="goalWeight"
            value={form.goalWeight}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Etapa actual</span>

          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 outline-none focus:border-lime-400"
          >
            <option value="Déficit">Déficit</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Superávit">Superávit</option>
          </select>
        </label>

        <button
          type="submit"
          className="md:col-span-3 inline-flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl p-3 transition"
        >
          <Save size={19} />
          Guardar configuración
        </button>
      </form>
    </section>
  );
}
