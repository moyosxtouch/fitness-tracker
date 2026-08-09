import { useEffect, useMemo, useState } from "react";
import { Camera, ImagePlus, Trash2, UserRound } from "lucide-react";
import { compressImage, formatFileSize } from "../../utils/imageCompression";
import PhotoComparison from "./PhotoComparison";
import { generateTestPhotos } from "../../utils/generateTestPhotos";
import {
  deleteProgressPhoto,
  getProgressPhotos,
  saveProgressPhoto,
} from "../../utils/photoStorage";

export default function ProgressPhotosCard({ records, onShowToast }) {
  const [progressPhotos, setProgressPhotos] = useState([]);

  const [form, setForm] = useState({
    date: getLocalDate(),
    weight: "",
    front: null,
    side: null,
    back: null,
  });

  const [loading, setLoading] = useState(true);
  const [selectedProgress, setSelectedProgress] = useState(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const previews = useMemo(
    () => ({
      front: form.front ? URL.createObjectURL(form.front) : null,

      side: form.side ? URL.createObjectURL(form.side) : null,

      back: form.back ? URL.createObjectURL(form.back) : null,
    }),
    [form.front, form.side, form.back],
  );

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  async function loadPhotos() {
    try {
      setLoading(true);

      const photos = await getProgressPhotos();

      setProgressPhotos(photos);
    } catch (error) {
      console.error("No se pudieron cargar las fotos:", error);

      onShowToast?.({
        title: "Error al cargar fotos",
        message: "No se pudo acceder al almacenamiento de fotografías.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }
  async function handleGenerateTestPhotos() {
    const confirmed = window.confirm(
      "¿Generar 5 registros fotográficos de prueba?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const generatedRecords = await generateTestPhotos();

      if (generatedRecords.length === 0) {
        onShowToast?.({
          title: "Fotos de prueba existentes",

          message: "Los 5 registros de prueba ya estaban guardados.",

          type: "info",
        });

        return;
      }

      setProgressPhotos((previousPhotos) => {
        const combined = [...generatedRecords, ...previousPhotos];

        const unique = combined.filter(
          (item, index, array) =>
            index === array.findIndex((other) => other.id === item.id),
        );

        return unique.sort((a, b) => b.date.localeCompare(a.date));
      });

      onShowToast?.({
        title: "Fotos de prueba generadas",

        message: `Se agregaron ${generatedRecords.length} sesiones fotográficas.`,

        type: "success",
      });
    } catch (error) {
      console.error("Error generando fotografías de prueba:", error);

      onShowToast?.({
        title: "Error al generar fotos",

        message:
          error.message || "No se pudieron generar las fotografías de prueba.",

        type: "error",
      });
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handlePhotoChange(event, position) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      onShowToast?.({
        title: "Archivo inválido",
        message: "Selecciona una fotografía.",
        type: "error",
      });

      return;
    }

    try {
      const compressed = await compressImage(file);

      setForm((previousForm) => ({
        ...previousForm,
        [position]: compressed,
      }));

      onShowToast?.({
        title: "Foto optimizada",
        message: `${formatFileSize(file.size)} → ${formatFileSize(
          compressed.size,
        )}`,
        type: "info",
      });
    } catch (error) {
      console.error("No se pudo comprimir la fotografía:", error);

      onShowToast?.({
        title: "Error al procesar la foto",
        message: "No se pudo optimizar la imagen.",
        type: "error",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.front && !form.side && !form.back) {
      onShowToast?.({
        title: "Agrega una fotografía",
        message: "Selecciona al menos una foto de progreso.",
        type: "error",
      });

      return;
    }

    try {
      const weight =
        form.weight.trim() !== ""
          ? Number(form.weight)
          : findWeightForDate(records, form.date);

      const progress = {
        id: crypto.randomUUID(),
        date: form.date,

        weight: Number.isFinite(weight) ? weight : null,

        front: form.front,
        side: form.side,
        back: form.back,

        createdAt: new Date().toISOString(),
      };

      await saveProgressPhoto(progress);

      setProgressPhotos((previousPhotos) =>
        [progress, ...previousPhotos].sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
      );

      setForm({
        date: getLocalDate(),
        weight: "",
        front: null,
        side: null,
        back: null,
      });

      onShowToast?.({
        title: "Fotos guardadas",
        message: "Tu progreso fotográfico se guardó correctamente.",
      });
    } catch (error) {
      console.error("No se pudieron guardar las fotos:", error);

      onShowToast?.({
        title: "No se pudo guardar",
        message: "Ocurrió un problema almacenando las fotografías.",
        type: "error",
      });
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("¿Eliminar este registro fotográfico?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteProgressPhoto(id);

      setProgressPhotos((previousPhotos) =>
        previousPhotos.filter((photo) => photo.id !== id),
      );

      onShowToast?.({
        title: "Registro fotográfico eliminado",
        message: "Las fotografías se eliminaron correctamente.",
        type: "info",
      });
    } catch (error) {
      console.error("No se pudieron eliminar las fotos:", error);

      onShowToast?.({
        title: "Error al eliminar",
        message: "No se pudieron borrar las fotografías.",
        type: "error",
      });
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Camera className="text-lime-400" size={28} />

          <div>
            <h2 className="text-2xl font-bold">Progreso fotográfico</h2>

            <p className="text-sm text-zinc-400">
              Registra fotografías para comparar tu evolución física.
            </p>
          </div>
        </div>

        <span className="text-sm text-zinc-500">
          {progressPhotos.length}{" "}
          {progressPhotos.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      <form
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
          Guardar fotografías
        </button>
        <button
          type="button"
          onClick={handleGenerateTestPhotos}
          className="mt-3 w-full rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 font-semibold text-violet-300 transition hover:bg-violet-500/20"
        >
          🧪 Generar 5 fotos de prueba
        </button>
      </form>
      <div className="mb-8">
        <PhotoComparison progressPhotos={progressPhotos} />
      </div>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Galería de progreso</h3>

            <p className="mt-1 text-sm text-zinc-500">
              Selecciona una sesión para ver todas las fotografías.
            </p>
          </div>

          <span className="text-sm text-zinc-500">
            {progressPhotos.length}{" "}
            {progressPhotos.length === 1 ? "sesión" : "sesiones"}
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
            Cargando fotografías...
          </div>
        ) : progressPhotos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <Camera size={36} className="mx-auto mb-3 text-zinc-600" />

            <p className="font-semibold">Todavía no tienes fotografías.</p>

            <p className="mt-2 text-sm text-zinc-500">
              Agrega tu primera sesión de progreso.
            </p>
          </div>
        ) : (
          <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 lg:grid-cols-5">
            {progressPhotos.map((progress) => (
              <div
                key={progress.id}
                className="w-[72vw] max-w-[250px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <GalleryCard
                  progress={progress}
                  progressPhotos={progressPhotos}
                  onClick={() => {
                    setSelectedProgress(progress);
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {selectedProgress && (
          <PhotoGalleryModal
            progress={selectedProgress}
            onClose={() => setSelectedProgress(null)}
            onDelete={async () => {
              const id = selectedProgress.id;

              await handleDelete(id);

              setSelectedProgress(null);
            }}
          />
        )}
      </div>
    </section>
  );
}

function PhotoInput({ label, preview, onChange }) {
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

function GalleryCard({ progress, onClick, progressPhotos }) {
  const cover = progress.front || progress.side || progress.back;

  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!cover) {
      setUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(cover);

    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [cover]);

  const oldestDate =
    progressPhotos.length > 0
      ? progressPhotos.reduce(
          (oldest, item) => (item.date < oldest ? item.date : oldest),
          progressPhotos[0].date,
        )
      : progress.date;

  const days = getDaysBetween(oldestDate, progress.date);

  const weeks = Math.floor(days / 7);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-left transition hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        {url ? (
          <img
            src={url}
            alt={`Progreso ${progress.date}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <UserRound size={38} />
          </div>
        )}

        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          <div className="rounded-full bg-lime-400 px-2 py-1 text-[10px] font-bold text-black">
            Día {days}
          </div>
        </div>

        {progress.testData && (
          <div className="absolute left-2 top-2 rounded-full bg-violet-500/90 px-2 py-1 text-[10px] font-semibold text-white">
            TEST
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-12">
          <p className="text-base font-bold text-white">
            {progress.weight
              ? `${Number(progress.weight).toFixed(1)} kg`
              : "Sin peso"}
          </p>
          <p className="text-[11px] font-semibold text-lime-300">
            Semana {weeks}
          </p>

          <p className="mt-0.5 text-xs text-zinc-300">
            {formatShortDate(progress.date)}
          </p>
        </div>
      </div>
    </button>
  );
}
function PhotoGalleryModal({ progress, onClose, onDelete }) {
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
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
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

function ModalStoredPhoto({ file, label }) {
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

  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-950 text-zinc-600">
        Sin fotografía
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 items-center justify-center">
      <img
        src={url}
        alt={label || "Fotografía de progreso"}
        className="h-full max-h-full w-auto max-w-full rounded-2xl object-contain shadow-xl"
      />
    </div>
  );
}
function StoredPhoto({ file, label }) {
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
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-600">
        <div className="text-center">
          <UserRound size={30} className="mx-auto mb-2" />

          <p className="text-xs">Sin foto {label.toLowerCase()}</p>
        </div>
      </div>
    );
  }

  return (
    <figure>
      <img
        src={url}
        alt={label}
        className="aspect-[3/4] w-full rounded-2xl object-cover"
      />

      <figcaption className="mt-2 text-center text-xs text-zinc-500">
        {label}
      </figcaption>
    </figure>
  );
}

function findWeightForDate(records, date) {
  const record = records.find((item) => item.date === date);

  if (!record) {
    return null;
  }

  const weight = Number(record.weight);

  return Number.isFinite(weight) ? weight : null;
}

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function getDaysBetween(firstDate, currentDate) {
  const first = new Date(`${firstDate}T00:00:00`);

  const current = new Date(`${currentDate}T00:00:00`);

  const difference = current.getTime() - first.getTime();

  return Math.max(0, Math.round(difference / (1000 * 60 * 60 * 24)));
}
function formatShortDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
