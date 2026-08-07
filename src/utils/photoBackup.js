import JSZip from "jszip";
import { getProgressPhotos, saveProgressPhoto } from "./photoStorage";

export async function exportPhotoBackup() {
  const progressPhotos = await getProgressPhotos();

  if (progressPhotos.length === 0) {
    throw new Error("No hay fotografías para respaldar.");
  }

  const zip = new JSZip();

  const manifest = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: [],
  };

  for (const progress of progressPhotos) {
    const folderName = sanitizeFolderName(progress.date);

    const folder = zip.folder(folderName);

    const entry = {
      id: progress.id,
      date: progress.date,
      weight: progress.weight ?? null,
      createdAt: progress.createdAt ?? null,
      files: {},
    };

    if (progress.front) {
      const fileName = getPhotoFileName("frontal", progress.front);

      folder.file(fileName, progress.front);

      entry.files.front = `${folderName}/${fileName}`;
    }

    if (progress.side) {
      const fileName = getPhotoFileName("lateral", progress.side);

      folder.file(fileName, progress.side);

      entry.files.side = `${folderName}/${fileName}`;
    }

    if (progress.back) {
      const fileName = getPhotoFileName("espalda", progress.back);

      folder.file(fileName, progress.back);

      entry.files.back = `${folderName}/${fileName}`;
    }

    manifest.entries.push(entry);
  }

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  downloadBlob(blob, `fitness-tracker-fotos-${getToday()}.zip`);
}

export async function importPhotoBackup(file) {
  if (!file) {
    throw new Error("No se seleccionó ningún archivo.");
  }

  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file("manifest.json");

  if (!manifestFile) {
    throw new Error("El respaldo no contiene manifest.json.");
  }

  const manifestText = await manifestFile.async("text");

  const manifest = JSON.parse(manifestText);

  if (!manifest || !Array.isArray(manifest.entries)) {
    throw new Error("El respaldo fotográfico es inválido.");
  }

  let importedCount = 0;

  for (const entry of manifest.entries) {
    const progress = {
      id: entry.id ?? crypto.randomUUID(),

      date: entry.date,

      weight: entry.weight ?? null,

      createdAt: entry.createdAt ?? new Date().toISOString(),

      front: null,
      side: null,
      back: null,
    };

    if (entry.files?.front) {
      progress.front = await readPhotoFromZip(
        zip,
        entry.files.front,
        "frontal",
      );
    }

    if (entry.files?.side) {
      progress.side = await readPhotoFromZip(zip, entry.files.side, "lateral");
    }

    if (entry.files?.back) {
      progress.back = await readPhotoFromZip(zip, entry.files.back, "espalda");
    }

    await saveProgressPhoto(progress);

    importedCount += 1;
  }

  return importedCount;
}

async function readPhotoFromZip(zip, path, fallbackName) {
  const zipFile = zip.file(path);

  if (!zipFile) {
    return null;
  }

  const blob = await zipFile.async("blob");

  const fileName = path.split("/").pop() ?? `${fallbackName}.webp`;

  return new File([blob], fileName, {
    type: blob.type || guessMimeType(fileName),
    lastModified: Date.now(),
  });
}

function getPhotoFileName(position, file) {
  const extension = getExtension(file);

  return `${position}.${extension}`;
}

function getExtension(file) {
  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  const extension = file.name?.split(".").pop()?.toLowerCase();

  return extension || "jpg";
}

function guessMimeType(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "png") {
    return "image/png";
  }

  return "image/jpeg";
}

function sanitizeFolderName(date) {
  return String(date).replace(/[^0-9-]/g, "");
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
