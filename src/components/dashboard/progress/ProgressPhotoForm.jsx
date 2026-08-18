import { ImagePlus } from "lucide-react";
import MeasurementField from "./MeasurementField";
import PhotoInput from "./PhotoInput";

export default function ProgressPhotoForm({
  form,
  previews,
  handleSubmit,
  handleChange,
  handlePhotoChange,
  handleGenerateTestPhotos,
}) {
  return (
    <form
      id="progress-form"
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
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
          <span className="text-sm text-zinc-400">Peso</span>

          <input
            type="number"
            step="0.1"
            min="1"
            name="weight"
            placeholder="Se detecta automáticamente si existe"
            value={form.weight}
            onChange={handleChange}
            className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
          />
        </label>
      </div>
      <div className="mb-5">
        <div className="mb-3">
          <p className="font-semibold">Medidas corporales</p>

          <p className="mt-1 text-xs text-zinc-500">
            Opcional · usa centímetros y procura medir siempre en condiciones
            similares.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MeasurementField
            label="Cintura"
            name="waist"
            value={form.waist}
            onChange={handleChange}
          />

          <MeasurementField
            label="Pecho"
            name="chest"
            value={form.chest}
            onChange={handleChange}
          />

          <MeasurementField
            label="Brazo"
            name="arm"
            value={form.arm}
            onChange={handleChange}
          />

          <MeasurementField
            label="Muslo"
            name="thigh"
            value={form.thigh}
            onChange={handleChange}
          />

          <MeasurementField
            label="Cadera"
            name="hips"
            value={form.hips}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PhotoInput
          label="Frontal"
          preview={previews.front}
          onChange={(event) => handlePhotoChange(event, "front")}
        />

        <PhotoInput
          label="Lateral"
          preview={previews.side}
          onChange={(event) => handlePhotoChange(event, "side")}
        />

        <PhotoInput
          label="Espalda"
          preview={previews.back}
          onChange={(event) => handlePhotoChange(event, "back")}
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 p-3 font-bold text-black transition hover:bg-lime-300"
      >
        <ImagePlus size={19} />
        Guardar sesión de progreso
      </button>
      <button
        type="button"
        onClick={handleGenerateTestPhotos}
        className="mt-3 w-full rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 font-semibold text-violet-300 transition hover:bg-violet-500/20"
      >
        🧪 Generar 5 fotos de prueba
      </button>
    </form>
  );
}
