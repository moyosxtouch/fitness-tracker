import { getProgressPhotos, saveProgressPhoto } from "./photoStorage";

const TEST_SESSIONS = [
  {
    folder: "2026-04-15",
    weight: 78.5,
  },
  {
    folder: "2026-05-15",
    weight: 75.8,
  },
  {
    folder: "2026-06-15",
    weight: 73.2,
  },
  {
    folder: "2026-07-15",
    weight: 71.0,
  },
  {
    folder: "2026-08-15",
    weight: 69.5,
  },
];

export async function generateTestPhotos() {
  const existing = await getProgressPhotos();

  const existingDates = new Set(
    existing.filter((item) => item.testData).map((item) => item.date),
  );

  const generatedRecords = [];

  for (const session of TEST_SESSIONS) {
    if (existingDates.has(session.folder)) {
      continue;
    }

    const [front, side, back] = await Promise.all([
      loadPhoto(session.folder, "front"),

      loadPhoto(session.folder, "side"),

      loadPhoto(session.folder, "back"),
    ]);

    const progress = {
      id: crypto.randomUUID(),

      date: session.folder,

      weight: session.weight,

      front,
      side,
      back,

      createdAt: new Date().toISOString(),

      testData: true,
    };

    await saveProgressPhoto(progress);

    generatedRecords.push(progress);
  }

  return generatedRecords;
}

async function loadPhoto(folder, position) {
  const path = `/test-photos/${folder}/${position}.jpg`;

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`No se encontró ${path}`);
  }

  const blob = await response.blob();

  return new File([blob], `${position}.jpg`, {
    type: blob.type || "image/jpeg",

    lastModified: Date.now(),
  });
}
