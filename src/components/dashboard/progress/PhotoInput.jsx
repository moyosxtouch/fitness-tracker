import { useRef } from "react";
import { Camera, Images, UserRound } from "lucide-react";

export default function PhotoInput({ label, preview, onChange }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  function openInput(inputRef) {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.value = "";
    inputRef.current.click();
  }

  return (
    <div>
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>

      <button
        type="button"
        onClick={() => openInput(galleryInputRef)}
        className="group relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 transition hover:border-lime-400"
      >
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

            <p className="mt-1 text-xs">Seleccionar fotografía</p>
          </div>
        )}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-1">
        <button
          type="button"
          onClick={() => openInput(galleryInputRef)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-lime-400 hover:text-white"
        >
          <Images size={16} />
          Galería
        </button>

        <button
          type="button"
          onClick={() => openInput(cameraInputRef)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs font-semibold text-lime-300 transition hover:bg-lime-400/20 md:hidden"
        >
          <Camera size={16} />
          Cámara
        </button>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
