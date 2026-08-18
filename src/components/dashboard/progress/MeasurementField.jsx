export default function MeasurementField({ label, name, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-400">{label}</span>

      <div className="relative">
        <input
          type="number"
          step="0.1"
          min="1"
          name={name}
          placeholder="Ej. 80"
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 pr-10 outline-none focus:border-lime-400"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
          cm
        </span>
      </div>
    </label>
  );
}
