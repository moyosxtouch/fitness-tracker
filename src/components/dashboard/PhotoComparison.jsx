import { useEffect, useState } from "react";
import { ArrowLeftRight, UserRound, Weight } from "lucide-react";

export default function PhotoComparison({ progressPhotos }) {
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");
  const [position, setPosition] = useState("front");

  useEffect(() => {
    if (progressPhotos.length < 2) {
      setBeforeId("");
      setAfterId("");
      return;
    }

    const beforeExists = progressPhotos.some((item) => item.id === beforeId);

    const afterExists = progressPhotos.some((item) => item.id === afterId);

    if (!beforeExists) {
      setBeforeId(progressPhotos[progressPhotos.length - 1].id);
    }

    if (!afterExists) {
      setAfterId(progressPhotos[0].id);
    }
  }, [progressPhotos, beforeId, afterId]);

  if (progressPhotos.length < 2) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={24} className="text-lime-400" />

          <div>
            <h3 className="font-semibold">Comparación</h3>

            <p className="text-sm text-zinc-500">
              Necesitas al menos dos registros fotográficos para comparar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const before = progressPhotos.find((item) => item.id === beforeId);

  const after = progressPhotos.find((item) => item.id === afterId);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={24} className="text-lime-400" />

          <div>
            <h3 className="font-semibold">Antes / Después</h3>

            <p className="text-sm text-zinc-500">
              Compara dos momentos de tu progreso.
            </p>
          </div>
        </div>

        <div className="flex overflow-hidden rounded-xl border border-zinc-700">
          {[
            ["front", "Frontal"],
            ["side", "Lateral"],
            ["back", "Espalda"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPosition(value)}
              className={`px-3 py-2 text-sm transition ${
                position === value
                  ? "bg-lime-400 font-semibold text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <RecordSelector
          label="Antes"
          value={beforeId}
          onChange={setBeforeId}
          progressPhotos={progressPhotos}
        />

        <RecordSelector
          label="Después"
          value={afterId}
          onChange={setAfterId}
          progressPhotos={progressPhotos}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonPhoto title="ANTES" progress={before} position={position} />

        <ComparisonPhoto title="DESPUÉS" progress={after} position={position} />
      </div>

      {before && after && <ComparisonStats before={before} after={after} />}
    </div>
  );
}

function RecordSelector({ label, value, onChange, progressPhotos }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none focus:border-lime-400"
      >
        {progressPhotos.map((progress) => (
          <option key={progress.id} value={progress.id}>
            {formatDate(progress.date)}
            {progress.weight
              ? ` · ${Number(progress.weight).toFixed(1)} kg`
              : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparisonPhoto({ title, progress, position }) {
  const file = progress?.[position];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-zinc-500">
          {title}
        </span>

        {progress && (
          <span className="text-xs text-zinc-500">
            {formatDate(progress.date)}
          </span>
        )}
      </div>

      <StoredComparisonPhoto file={file} label={title} />

      {progress && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <Weight size={16} />

          {hasValidWeight(progress.weight)
            ? `${Number(progress.weight).toFixed(1)} kg`
            : "Sin peso registrado"}
        </div>
      )}
    </div>
  );
}

function StoredComparisonPhoto({ file, label }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);

    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="text-center text-zinc-600">
          <UserRound size={40} className="mx-auto mb-2" />

          <p className="text-sm">Sin fotografía</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={label}
      className="aspect-[3/4] w-full rounded-2xl object-cover"
    />
  );
}

function ComparisonStats({ before, after }) {
  const beforeWeight = Number(before.weight);
  const afterWeight = Number(after.weight);

  const hasWeights =
    hasValidWeight(before.weight) && hasValidWeight(after.weight);

  const weightDifference = hasWeights
    ? Number((afterWeight - beforeWeight).toFixed(1))
    : null;

  const percentageDifference =
    hasWeights && beforeWeight > 0
      ? Number(((weightDifference / beforeWeight) * 100).toFixed(1))
      : null;

  const daysDifference = getDaysDifference(before.date, after.date);

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ComparisonMetric
        label="Tiempo transcurrido"
        value={`${Math.abs(daysDifference)} días`}
      />

      <ComparisonMetric
        label="Peso inicial"
        value={
          hasValidWeight(before.weight)
            ? `${beforeWeight.toFixed(1)} kg`
            : "Sin dato"
        }
      />

      <ComparisonMetric
        label="Peso final"
        value={
          hasValidWeight(after.weight)
            ? `${afterWeight.toFixed(1)} kg`
            : "Sin dato"
        }
      />

      <ComparisonMetric
        label="Cambio"
        value={
          weightDifference !== null
            ? `${weightDifference > 0 ? "+" : ""}${weightDifference.toFixed(
                1,
              )} kg`
            : "Sin dato"
        }
        secondaryValue={
          percentageDifference !== null
            ? `${
                percentageDifference > 0 ? "+" : ""
              }${percentageDifference.toFixed(1)}%`
            : null
        }
      />
    </div>
  );
}

function ComparisonMetric({ label, value, secondaryValue }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-lg font-bold">{value}</p>

      {secondaryValue && (
        <p className="mt-1 text-sm font-semibold text-lime-400">
          {secondaryValue}
        </p>
      )}
    </div>
  );
}

function hasValidWeight(weight) {
  const value = Number(weight);

  return Number.isFinite(value) && value > 0;
}

function getDaysDifference(firstDate, secondDate) {
  const first = new Date(`${firstDate}T00:00:00`);

  const second = new Date(`${secondDate}T00:00:00`);

  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
