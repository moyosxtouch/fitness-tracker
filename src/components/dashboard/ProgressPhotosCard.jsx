import { useEffect, useMemo, useState } from "react";
import { Camera, Cloud, LoaderCircle } from "lucide-react";
import { compressImage, formatFileSize } from "../../utils/imageCompression";
import PhotoComparison from "./PhotoComparison";
import {
  connectGoogleDrive,
  downloadGoogleDrivePhoto,
  getOrCreateFitnessTrackerFolder,
  isGoogleDriveConnected,
  uploadGoogleDrivePhoto,
} from "../../services/googleDriveService";
import { useAuth } from "../../context/AuthContext";
import ProgressPhotoForm from "./progress/ProgressPhotoForm";
import { generateTestPhotos } from "../../utils/generateTestPhotos";
import ProgressGallery from "./progress/ProgressGallery";
import {
  getUserProgressSessions,
  saveUserProgressSession,
} from "../../services/firestoreService";
import {
  findWeightForDate,
  getLocalDate,
  hasValidNumber,
  parseOptionalNumber,
} from "./progress/progressUtils";
import {
  deleteProgressPhoto,
  getProgressPhotos,
  saveProgressPhoto,
} from "../../utils/photoStorage";
import {
  deleteMeasurementByDate,
  getMeasurements,
  saveMeasurement,
} from "../../utils/measurementStorage";

export default function ProgressPhotosCard({ records, onShowToast }) {
  const { user } = useAuth();
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [editingProgress, setEditingProgress] = useState(null);

  const [form, setForm] = useState({
    date: getLocalDate(),
    waist: "",
    chest: "",
    arm: "",
    thigh: "",
    hips: "",
    weight: "",
    front: null,
    side: null,
    back: null,
  });

  const [loading, setLoading] = useState(true);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [driveConnected, setDriveConnected] = useState(() =>
    isGoogleDriveConnected(),
  );

  const [driveConnecting, setDriveConnecting] = useState(false);
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
      const savedMeasurements = getMeasurements();

      setProgressPhotos(photos);
      setMeasurements(savedMeasurements);
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

  function startEditingProgress(progress) {
    const sessionMeasurements = measurements.find(
      (item) => item.date === progress.date,
    );

    setEditingProgress(progress);

    setForm({
      date: progress.date,

      weight: hasValidNumber(progress.weight) ? String(progress.weight) : "",

      waist: sessionMeasurements?.waist
        ? String(sessionMeasurements.waist)
        : "",

      chest: sessionMeasurements?.chest
        ? String(sessionMeasurements.chest)
        : "",

      arm: sessionMeasurements?.arm ? String(sessionMeasurements.arm) : "",

      thigh: sessionMeasurements?.thigh
        ? String(sessionMeasurements.thigh)
        : "",

      hips: sessionMeasurements?.hips ? String(sessionMeasurements.hips) : "",

      front: progress.front ?? null,
      side: progress.side ?? null,
      back: progress.back ?? null,
    });

    setSelectedProgress(null);

    requestAnimationFrame(() => {
      document.getElementById("progress-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!driveConnected || !isGoogleDriveConnected()) {
      onShowToast?.({
        title: "Conecta Google Drive",
        message:
          "Debes conectar Drive antes de guardar una sesión fotográfica.",
        type: "error",
      });

      setDriveConnected(false);

      return;
    }

    if (!form.front && !form.side && !form.back) {
      onShowToast?.({
        title: "Agrega una fotografía",
        message: "Selecciona al menos una foto de progreso.",
        type: "error",
      });

      return;
    }

    try {
      const wasEditing = Boolean(editingProgress);

      const weight =
        form.weight.trim() !== ""
          ? Number(form.weight)
          : findWeightForDate(records, form.date);

      const sessionId = editingProgress?.id ?? crypto.randomUUID();

      const existingDriveFiles = editingProgress?.driveFiles ?? {};

      const driveFiles = {};

      for (const position of ["front", "side", "back"]) {
        const photo = form[position];

        if (!photo) {
          continue;
        }

        const uploadedPhoto = await uploadGoogleDrivePhoto({
          blob: photo,
          sessionId,
          position,
          fileId: existingDriveFiles[position]?.id ?? null,
        });

        driveFiles[position] = uploadedPhoto;
      }

      const sessionMeasurements = {
        waist: parseOptionalNumber(form.waist),
        chest: parseOptionalNumber(form.chest),
        arm: parseOptionalNumber(form.arm),
        thigh: parseOptionalNumber(form.thigh),
        hips: parseOptionalNumber(form.hips),
      };

      const progress = {
        id: sessionId,
        date: form.date,
        weight: Number.isFinite(weight) ? weight : null,

        front: form.front,
        side: form.side,
        back: form.back,

        driveFiles,

        createdAt: editingProgress?.createdAt ?? new Date().toISOString(),

        updatedAt: wasEditing ? new Date().toISOString() : null,
      };

      await saveUserProgressSession(user.uid, {
        id: progress.id,
        date: progress.date,
        weight: progress.weight,
        measurements: sessionMeasurements,
        driveFiles,
        createdAt: progress.createdAt,
      });

      await saveProgressPhoto(progress);

      if (editingProgress && editingProgress.date !== form.date) {
        deleteMeasurementByDate(editingProgress.date);
      }

      const hasMeasurements = Object.values(sessionMeasurements).some(
        (value) => value !== null,
      );

      if (hasMeasurements) {
        saveMeasurement({
          date: form.date,
          weight: progress.weight,
          ...sessionMeasurements,
        });
      }

      setMeasurements(getMeasurements());

      setProgressPhotos((previousPhotos) => {
        const photosWithoutCurrent = previousPhotos.filter(
          (item) => item.id !== progress.id,
        );

        return [progress, ...photosWithoutCurrent].sort((a, b) =>
          b.date.localeCompare(a.date),
        );
      });

      setForm({
        date: getLocalDate(),
        weight: "",
        waist: "",
        chest: "",
        arm: "",
        thigh: "",
        hips: "",
        front: null,
        side: null,
        back: null,
      });

      setEditingProgress(null);

      onShowToast?.({
        title: wasEditing ? "Sesión actualizada" : "Fotos sincronizadas",
        message:
          "Las fotografías se guardaron en Drive y los datos en Firebase.",
      });
    } catch (error) {
      console.error("No se pudieron sincronizar las fotos:", error);

      if (!isGoogleDriveConnected()) {
        setDriveConnected(false);
      }

      onShowToast?.({
        title: "No se pudo sincronizar",
        message:
          error.message || "Ocurrió un problema guardando las fotografías.",
        type: "error",
      });
    }
  }

  async function handleDelete(id) {
    try {
      const progressToDelete = progressPhotos.find((item) => item.id === id);

      await deleteProgressPhoto(id);

      if (progressToDelete?.date) {
        deleteMeasurementByDate(progressToDelete.date);
      }

      setProgressPhotos((previousPhotos) =>
        previousPhotos.filter((item) => item.id !== id),
      );

      setMeasurements(getMeasurements());

      onShowToast?.({
        title: "Sesión eliminada",
        message: "Las fotografías y medidas de la sesión fueron eliminadas.",
        type: "info",
      });
    } catch (error) {
      console.error("No se pudo eliminar la sesión:", error);

      onShowToast?.({
        title: "No se pudo eliminar",
        message: "Ocurrió un problema eliminando la sesión de progreso.",
        type: "error",
      });
    }
  }
  async function loadCloudPhotos() {
    if (!user) {
      return;
    }

    setLoading(true);

    try {
      const cloudSessions = await getUserProgressSessions(user.uid);

      const downloadedSessions = await Promise.all(
        cloudSessions.map(async (session) => {
          const front = session.driveFiles?.front?.id
            ? await downloadGoogleDrivePhoto(session.driveFiles.front.id)
            : null;

          const side = session.driveFiles?.side?.id
            ? await downloadGoogleDrivePhoto(session.driveFiles.side.id)
            : null;

          const back = session.driveFiles?.back?.id
            ? await downloadGoogleDrivePhoto(session.driveFiles.back.id)
            : null;

          const progress = {
            id: session.id,
            date: session.date,
            weight: session.weight ?? null,
            front,
            side,
            back,
            driveFiles: session.driveFiles ?? {},
            createdAt: session.createdAt ?? new Date().toISOString(),
            updatedAt: null,
          };

          await saveProgressPhoto(progress);

          if (session.measurements) {
            saveMeasurement({
              date: session.date,
              weight: session.weight ?? null,
              waist: session.measurements.waist ?? null,
              chest: session.measurements.chest ?? null,
              arm: session.measurements.arm ?? null,
              thigh: session.measurements.thigh ?? null,
              hips: session.measurements.hips ?? null,
            });
          }

          return progress;
        }),
      );

      const localPhotos = await getProgressPhotos();

      const combinedPhotos = [
        ...downloadedSessions,
        ...localPhotos.filter(
          (localPhoto) =>
            !downloadedSessions.some(
              (cloudPhoto) =>
                cloudPhoto.id === localPhoto.id ||
                cloudPhoto.date === localPhoto.date,
            ),
        ),
      ].sort((a, b) => b.date.localeCompare(a.date));

      setProgressPhotos(combinedPhotos);
      setMeasurements(getMeasurements());
    } finally {
      setLoading(false);
    }
  }
  async function handleConnectGoogleDrive() {
    try {
      setDriveConnecting(true);

      await connectGoogleDrive();
      await getOrCreateFitnessTrackerFolder();
      await loadCloudPhotos();
      setDriveConnected(true);

      onShowToast({
        title: "Google Drive conectado",
        message: "La aplicación ya puede guardar tus fotografías en Drive.",
      });
    } catch (error) {
      console.error("No se pudo conectar Google Drive:", error);

      onShowToast({
        title: "Error de conexión",
        message:
          error.message || "No se pudo autorizar el acceso a Google Drive.",
        type: "error",
      });
    } finally {
      setDriveConnecting(false);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              driveConnected
                ? "bg-lime-400/10 text-lime-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            <Cloud size={20} />
          </div>

          <div>
            <p className="font-semibold">Google Drive</p>

            <p className="text-sm text-zinc-500">
              {driveConnected
                ? "Conectado para sincronizar fotografías"
                : "Conecta tu cuenta para guardar fotografías"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConnectGoogleDrive}
          disabled={driveConnecting || driveConnected}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {driveConnecting && (
            <LoaderCircle className="animate-spin" size={17} />
          )}

          {driveConnecting
            ? "Conectando..."
            : driveConnected
              ? "Conectado"
              : "Conectar Drive"}
        </button>
      </div>
      <ProgressPhotoForm
        form={form}
        previews={previews}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handlePhotoChange={handlePhotoChange}
        handleGenerateTestPhotos={handleGenerateTestPhotos}
      />
      <div className="mb-8">
        <PhotoComparison
          progressPhotos={progressPhotos}
          measurements={measurements}
        />
      </div>
      <ProgressGallery
        loading={loading}
        progressPhotos={progressPhotos}
        measurements={measurements}
        selectedProgress={selectedProgress}
        onSelect={setSelectedProgress}
        onClose={() => setSelectedProgress(null)}
        onEdit={startEditingProgress}
        onDelete={async (progress) => {
          await handleDelete(progress.id);
          setSelectedProgress(null);
        }}
      />
    </section>
  );
}
