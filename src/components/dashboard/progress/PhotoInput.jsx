import { UserRound } from "lucide-react";

export default function PhotoInput({ label, preview, onChange }) {
  return (
    <label className="group cursor-pointer">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 transition group-hover:border-lime-400">
        {preview ? (
          <img
            src={preview}
            alt={`Vista previa ${label}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-center text-zinc-500">
            <UserRound size={34} className="mx-auto mb-2" />

            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs">Seleccionar foto</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </label>
  );
}
