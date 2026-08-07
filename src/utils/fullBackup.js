import JSZip from "jszip";
import { getProgressPhotos } from "./photoStorage";

export async function exportFullBackup({ records, settings }) {
  const zip = new JSZip();

  zip.file(
    "data.json",
    JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        records,
        settings,
      },
      null,
      2,
    ),
  );

  const progressPhotos = await getProgressPhotos();

  const manifest = {
    version: 1,
    entries: [],
  };

  const photosFolder = zip.folder("photos");

  for (const progress of progressPhotos) {
    const folderName = progress.date;

    const folder = photosFolder.folder(folderName);

    const entry = {
      id: progress.id,
      date: progress.date,
      weight: progress.weight ?? null,
      createdAt: progress.createdAt ?? null,
      files: {},
    };

    if (progress.front) {
      const name = getFileName("frontal", progress.front);

      folder.file(name, progress.front);

      entry.files.front = `photos/${folderName}/${name}`;
    }

    if (progress.side) {
      const name = getFileName("lateral", progress.side);

      folder.file(name, progress.side);

      entry.files.side = `photos/${folderName}/${name}`;
    }

    if (progress.back) {
      const name = getFileName("espalda", progress.back);

      folder.file(name, progress.back);

      entry.files.back = `photos/${folderName}/${name}`;
    }

    manifest.entries.push(entry);
  }

  zip.file("photos-manifest.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  downloadBlob(blob, `fitness-tracker-backup-completo-${getToday()}.zip`);
}

function getFileName(position, file) {
  let extension = "jpg";

  if (file.type === "image/webp") {
    extension = "webp";
  }

  if (file.type === "image/png") {
    extension = "png";
  }

  return `${position}.${extension}`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
