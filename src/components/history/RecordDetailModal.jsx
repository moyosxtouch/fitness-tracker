import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { formatLongDate, isValidNumber } from "./historyUtils";

export default function RecordDetailModal({
  record,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState(() => createEditForm(record));

  useEffect(() => {
    setForm(createEditForm(record));
  }, [record]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (isEditing) {
          onCancelEdit();
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";
    };
  }, [isEditing, onCancelEdit, onClose]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const calories = Number(form.calories);

    const weight = Number(form.weight);

    const sleepHours = form.sleepHours !== "" ? Number(form.sleepHours) : null;

    const recovery = form.recovery !== "" ? Number(form.recovery) : null;

    if (
      !form.date ||
      !Number.isFinite(calories) ||
      calories <= 0 ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      alert("Introduce fecha, calorías y peso válidos.");

      return;
    }

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

    onSave({
      ...record,
      date: form.date,
      calories,
      weight,
      performance: form.performance,
      sleepHours,
      recovery,
      notes: form.notes.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isEditing) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur sm:p-5">
          <div>
            <p className="text-sm text-zinc-500">
              {isEditing ? "Editar registro" : "Registro diario"}
            </p>

            <h3 className="mt-1 text-xl font-bold sm:text-2xl">
              {formatLongDate(isEditing ? form.date : record.date)}
            </h3>
          </div>

          <button
            type="button"
            onClick={isEditing ? onCancelEdit : onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <EditField
                label="Fecha"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />

              <EditField
                label="Calorías"
                type="number"
                name="calories"
                value={form.calories}
                onChange={handleChange}
              />

              <EditField
                label="Peso"
                type="number"
                step="0.1"
                name="weight"
                value={form.weight}
                onChange={handleChange}
              />

              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-wide text-zinc-500">
                  Rendimiento
                </span>

                <select
                  name="performance"
                  value={form.performance}
                  onChange={handleChange}
                  className="min-h-11 rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base outline-none focus:border-lime-400"
                >
                  <option value="Óptimo">Óptimo</option>

                  <option value="Regular">Regular</option>

                  <option value="Fallido">Fallido</option>

                  <option value="Descanso">Descanso</option>
                </select>
              </label>

              <EditField
                label="Sueño"
                type="number"
                step="0.5"
                name="sleepHours"
                value={form.sleepHours}
                onChange={handleChange}
                placeholder="Ej. 7.5"
              />

              <EditField
                label="Recuperación"
                type="number"
                name="recovery"
                value={form.recovery}
                onChange={handleChange}
                placeholder="1–10"
              />
            </div>

            <label className="mt-3 grid gap-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                Notas
              </span>

              <textarea
                name="notes"
                rows="3"
                value={form.notes}
                onChange={handleChange}
                className="resize-none rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base outline-none focus:border-lime-400"
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-lime-400 px-4 py-3 font-bold text-black transition hover:bg-lime-300"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <DetailBox
                label="Calorías"
                value={`${Number(record.calories).toLocaleString(
                  "es-MX",
                )} kcal`}
              />

              <DetailBox
                label="Peso"
                value={`${Number(record.weight).toFixed(1)} kg`}
              />

              <DetailBox
                label="Rendimiento"
                value={record.performance || "Sin registro"}
              />

              <DetailBox
                label="Sueño"
                value={
                  isValidNumber(record.sleepHours)
                    ? `${Number(record.sleepHours).toFixed(1)} h`
                    : "Sin dato"
                }
              />

              <DetailBox
                label="Recuperación"
                value={
                  isValidNumber(record.recovery)
                    ? `${Number(record.recovery)}/10`
                    : "Sin dato"
                }
              />
            </div>

            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                Notas
              </p>

              <p className="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
                {record.notes || "Sin notas registradas."}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={onStartEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 font-semibold text-sky-400 transition hover:bg-sky-500/20"
              >
                <Pencil size={18} />
                Editar
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function EditField({ label, type, name, value, onChange, step, placeholder }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        placeholder={placeholder}
        className="min-h-11 rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-base outline-none focus:border-lime-400"
      />
    </label>
  );
}

function createEditForm(record) {
  return {
    date: record.date,
    calories: record.calories !== undefined ? String(record.calories) : "",
    weight: record.weight !== undefined ? String(record.weight) : "",
    performance: record.performance || "Óptimo",
    sleepHours:
      record.sleepHours !== null && record.sleepHours !== undefined
        ? String(record.sleepHours)
        : "",
    recovery:
      record.recovery !== null && record.recovery !== undefined
        ? String(record.recovery)
        : "",
    notes: record.notes || "",
  };
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-base font-bold sm:text-lg">{value}</p>
    </div>
  );
}
