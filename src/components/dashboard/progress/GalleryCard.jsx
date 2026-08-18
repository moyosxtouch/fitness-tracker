import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { formatShortDate, getDaysBetween } from "./progressUtils";

export default function GalleryCard({ progress, onClick, progressPhotos }) {
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

        <div className="absolute right-2 top-2">
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
