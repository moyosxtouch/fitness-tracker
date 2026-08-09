import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyForm() {
  return {
    date: getLocalDate(),
    calories: "",
    weight: "",
    performance: "Óptimo",
    sleepHours: "",
    recovery: "",
    notes: "",
  };
}

export default function AddRecordCard({
  onSaveRecord,
  editingRecord,
  onCancelEdit,
}) {
  const [form, setForm] = useState(createEmptyForm);

  useEffect(() => {
    if (editingRecord) {
      setForm({
        id: editingRecord.id,
        date: editingRecord.date,
        calories: String(editingRecord.calories),
        weight: String(editingRecord.weight),
        performance: editingRecord.performance || "Óptimo",
        sleepHours:
          editingRecord.sleepHours !== null &&
          editingRecord.sleepHours !== undefined
            ? String(editingRecord.sleepHours)
            : "",

        recovery:
          editingRecord.recovery !== null &&
          editingRecord.recovery !== undefined
            ? String(editingRecord.recovery)
            : "",
        notes: editingRecord.notes || "",
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [editingRecord]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.date || !form.calories || !form.weight) {
      alert("Completa fecha, calorías y peso.");
      return;
    }

    const calories = Number(form.calories);
    const weight = Number(form.weight);

    if (
      !Number.isFinite(calories) ||
      !Number.isFinite(weight) ||
      calories <= 0 ||
      weight <= 0
    ) {
      alert("Introduce valores válidos.");
      return;
    }
    const sleepHours = form.sleepHours !== "" ? Number(form.sleepHours) : null;

    const recovery = form.recovery !== "" ? Number(form.recovery) : null;

    if (
      sleepHours !== null &&
      (!Number.isFinite(sleepHours) || sleepHours < 0 || sleepHours > 24)
    ) {
      alert("Las horas de sueño deben estar entre 0 y 24.");
      return;
    }

    if (
      recovery !== null &&
      (!Number.isFinite(recovery) || recovery < 1 || recovery > 10)
    ) {
      alert("La recuperación debe estar entre 1 y 10.");
      return;
    }

    onSaveRecord({
      id: form.id,
      date: form.date,
      calories,
      weight,
      performance: form.performance,
      sleepHours,
      recovery,
      notes: form.notes.trim(),
    });

    setForm(createEmptyForm());
  }

  function cancelEdit() {
    setForm(createEmptyForm());
    onCancelEdit();
  }

  const isRestDay = form.performance === "Descanso";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {editingRecord ? "Editar registro" : "Nuevo registro"}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {editingRecord
              ? "Modifica la información y guarda los cambios."
              : "Registra tus calorías, peso y rendimiento del día."}
          </p>
        </div>

        {editingRecord && (
          <button
            type="button"
            onClick={cancelEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            <X size={17} />
            Cancelar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Fecha</span>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Calorías</span>

          <input
            type="number"
            name="calories"
            min="1"
            placeholder="Ej. 1800"
            value={form.calories}
            onChange={handleChange}
            required
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Peso</span>

          <input
            type="number"
            step="0.1"
            min="1"
            name="weight"
            placeholder="Ej. 69.6"
            value={form.weight}
            onChange={handleChange}
            required
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Rendimiento</span>

          <select
            name="performance"
            value={form.performance}
            onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          >
            <option value="Óptimo">Óptimo</option>
            <option value="Regular">Regular</option>
            <option value="Fallido">Fallido</option>
            <option value="Descanso">Descanso</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Horas de sueño</span>

          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            name="sleepHours"
            placeholder="Ej. 7.5"
            value={form.sleepHours}
            onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-zinc-400">Recuperación</span>

          <input
            type="number"
            min="1"
            max="10"
            name="recovery"
            placeholder="1 a 10"
            value={form.recovery}
            onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        {isRestDay && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300 md:col-span-2">
            Este registro contará para calorías y peso, pero no se incluirá
            dentro del porcentaje de rendimiento del gimnasio.
          </div>
        )}

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-zinc-400">Notas</span>

          <textarea
            rows="3"
            name="notes"
            placeholder={
              isRestDay
                ? "Ej. Día de recuperación y caminata ligera"
                : "Ej. Entrenamiento pesado de pierna"
            }
            value={form.notes}
            onChange={handleChange}
            className="resize-none rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 p-3 font-bold text-black transition hover:bg-lime-300 md:col-span-2"
        >
          <Save size={19} />

          {editingRecord ? "Guardar cambios" : "Guardar registro"}
        </button>
      </form>
    </section>
  );
}
