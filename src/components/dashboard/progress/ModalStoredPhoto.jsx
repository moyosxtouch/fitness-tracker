import { useEffect, useState } from "react";

export default function ModalStoredPhoto({ file, label }) {
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
