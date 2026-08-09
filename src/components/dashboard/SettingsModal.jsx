import { useEffect, useState } from "react";
import { Save, Settings, X } from "lucide-react";

export default function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
}) {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setForm(settings);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

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

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-xl rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-black">
              <Settings size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Configuración</h2>

              <p className="text-sm text-zinc-400">
                Define tu etapa y tus objetivos actuales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Cerrar configuración"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-zinc-400">
              Meta diaria de calorías
            </span>

            <input
              type="number"
              min="1"
              name="goalCalories"
              value={form.goalCalories}
              onChange={handleChange}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none transition focus:border-lime-400"
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
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none transition focus:border-lime-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-zinc-400">Objetivo actual</span>

            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none transition focus:border-lime-400"
            >
              <option value="Perder peso">Perder peso</option>

              <option value="Mantener peso">Mantener peso</option>

              <option value="Ganar peso">Ganar peso</option>
            </select>
          </label>

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black transition hover:bg-lime-300"
            >
              <Save size={19} />
              Guardar cambios
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
