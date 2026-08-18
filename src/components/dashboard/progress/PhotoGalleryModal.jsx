import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ModalStoredPhoto from "./ModalStoredPhoto";
import { formatDate } from "./progressUtils";

export default function PhotoGalleryModal({
  progress,
  measurements,
  onClose,
  onDelete,
  onEdit,
}) {
  const [activePosition, setActivePosition] = useState(
    progress.front ? "front" : progress.side ? "side" : "back",
  );

  useEffect(() => {
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
  }, [onClose]);

  const positions = [
    {
      key: "front",
      label: "Frontal",
    },
    {
      key: "side",
      label: "Lateral",
    },
    {
      key: "back",
      label: "Espalda",
    },
  ];

  const activeFile = progress[activePosition];
  const sessionMeasurements = measurements.find(
    (item) => item.date === progress.date,
  );

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur sm:p-5">
          <div>
            <h3 className="text-xl font-bold">{formatDate(progress.date)}</h3>

            <p className="mt-1 text-sm text-zinc-400">
              {progress.weight
                ? `${Number(progress.weight).toFixed(1)} kg`
                : "Sin peso registrado"}
            </p>
            {sessionMeasurements && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                {sessionMeasurements.waist && (
                  <span>
                    Cintura {Number(sessionMeasurements.waist).toFixed(1)} cm
                  </span>
                )}

                {sessionMeasurements.chest && (
                  <span>
                    Pecho {Number(sessionMeasurements.chest).toFixed(1)} cm
                  </span>
                )}

                {sessionMeasurements.arm && (
                  <span>
                    Brazo {Number(sessionMeasurements.arm).toFixed(1)} cm
                  </span>
                )}

                {sessionMeasurements.thigh && (
                  <span>
                    Muslo {Number(sessionMeasurements.thigh).toFixed(1)} cm
                  </span>
                )}

                {sessionMeasurements.hips && (
                  <span>
                    Cadera {Number(sessionMeasurements.hips).toFixed(1)} cm
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
          <div className="mb-4 flex shrink-0 justify-center">
            <div className="inline-flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
              {positions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  disabled={!progress[key]}
                  onClick={() => setActivePosition(key)}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    activePosition === key
                      ? "bg-lime-400 text-black"
                      : "text-zinc-400 hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center">
            <ModalStoredPhoto
              file={activeFile}
              label={
                positions.find((item) => item.key === activePosition)?.label
              }
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 font-semibold text-zinc-300 transition hover:border-lime-400 hover:text-lime-400"
            >
              <Pencil size={18} />
              Editar sesión
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-12  items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 whitespace-nowrap"
            >
              <Trash2 size={18} />
              Eliminar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
