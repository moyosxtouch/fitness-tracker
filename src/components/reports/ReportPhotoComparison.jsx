import { useEffect, useState } from "react";

const photoAngles = [
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

export default function ReportPhotoComparison({
  initialProgress,
  finalProgress,
  formatDate,
}) {
  const [initialUrls, setInitialUrls] = useState({});
  const [finalUrls, setFinalUrls] = useState({});

  useEffect(() => {
    const createdUrls = [];

    const nextInitialUrls = createPhotoUrls(initialProgress, createdUrls);

    const nextFinalUrls = createPhotoUrls(finalProgress, createdUrls);

    setInitialUrls(nextInitialUrls);
    setFinalUrls(nextFinalUrls);

    return () => {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [initialProgress, finalProgress]);

  if (!initialProgress || !finalProgress) {
    return null;
  }

  const availableAngles = photoAngles.filter(
    ({ key }) => initialUrls[key] || finalUrls[key],
  );

  if (availableAngles.length === 0) {
    return null;
  }

  return (
    <div className="report-photo-comparison mt-6">
      <div className="mb-4">
        <h4 className="font-bold">Comparación fotográfica</h4>

        <p className="mt-1 text-sm text-zinc-500">
          Evolución entre el primer y el último registro fotográfico del
          periodo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {availableAngles.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-zinc-800 p-3">
            <p className="mb-3 text-center font-semibold">{label}</p>

            <div className="grid grid-cols-2 gap-2">
              <ReportPhoto
                label="Inicial"
                date={initialProgress.date}
                url={initialUrls[key]}
                formatDate={formatDate}
              />

              <ReportPhoto
                label="Final"
                date={finalProgress.date}
                url={finalUrls[key]}
                formatDate={formatDate}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPhoto({ label, date, url, formatDate }) {
  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-900">
        {url ? (
          <img
            src={url}
            alt={`${label} ${formatDate(date)}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            Sin fotografía
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-xs font-semibold">{label}</p>

      <p className="mt-1 text-center text-xs text-zinc-500">
        {formatDate(date)}
      </p>
    </div>
  );
}

function createPhotoUrls(progress, createdUrls) {
  if (!progress) {
    return {};
  }

  return photoAngles.reduce((urls, { key }) => {
    const photo = progress[key];

    if (!photo) {
      return urls;
    }

    if (typeof photo === "string") {
      urls[key] = photo;

      return urls;
    }

    if (photo instanceof Blob) {
      const objectUrl = URL.createObjectURL(photo);

      urls[key] = objectUrl;
      createdUrls.push(objectUrl);
    }

    return urls;
  }, {});
}
