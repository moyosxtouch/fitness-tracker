export async function compressImage(
  file,
  { maxSize = 1600, quality = 0.82, outputType = "image/webp" } = {},
) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Archivo de imagen inválido.");
  }

  const imageBitmap = await createImageBitmap(file);

  const { width, height } = calculateDimensions(
    imageBitmap.width,
    imageBitmap.height,
    maxSize,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    imageBitmap.close();
    throw new Error("No se pudo crear el canvas.");
  }

  context.drawImage(imageBitmap, 0, 0, width, height);

  imageBitmap.close();

  const blob = await canvasToBlob(canvas, outputType, quality);

  const extension =
    blob.type === "image/webp"
      ? "webp"
      : blob.type === "image/jpeg"
        ? "jpg"
        : "png";

  const originalName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");

  return new File([blob], `${originalName}-compressed.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

function calculateDimensions(originalWidth, originalHeight, maxSize) {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return {
      width: originalWidth,
      height: originalHeight,
    };
  }

  const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight);

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

function canvasToBlob(canvas, preferredType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        canvas.toBlob(
          (fallbackBlob) => {
            if (fallbackBlob) {
              resolve(fallbackBlob);
            } else {
              reject(new Error("No se pudo comprimir la imagen."));
            }
          },
          "image/jpeg",
          quality,
        );
      },
      preferredType,
      quality,
    );
  });
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
