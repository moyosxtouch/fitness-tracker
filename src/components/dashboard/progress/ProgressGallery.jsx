import { Camera } from "lucide-react";
import GalleryCard from "./GalleryCard";
import PhotoGalleryModal from "./PhotoGalleryModal";

export default function ProgressGallery({
  loading,
  progressPhotos,
  measurements,
  selectedProgress,
  onSelect,
  onClose,
  onEdit,
  onDelete,
}) {
  return (
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
                onClick={() => onSelect(progress)}
              />
            </div>
          ))}
        </div>
      )}

      {selectedProgress && (
        <PhotoGalleryModal
          progress={selectedProgress}
          measurements={measurements}
          onClose={onClose}
          onEdit={() => onEdit(selectedProgress)}
          onDelete={() => onDelete(selectedProgress)}
        />
      )}
    </div>
  );
}
