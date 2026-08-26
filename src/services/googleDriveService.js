const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
const DRIVE_TOKEN_STORAGE_KEY = "fitness-tracker-drive-token";

const DRIVE_TOKEN_EXPIRATION_KEY = "fitness-tracker-drive-token-expiration";

const DRIVE_API_URL = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3";

const FITNESS_TRACKER_FOLDER_NAME = "Fitness Tracker";

let fitnessTrackerFolderId = null;

let accessToken = sessionStorage.getItem(DRIVE_TOKEN_STORAGE_KEY);

let tokenExpiresAt =
  Number(sessionStorage.getItem(DRIVE_TOKEN_EXPIRATION_KEY)) || 0;

export async function connectGoogleDrive() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Falta VITE_GOOGLE_DRIVE_CLIENT_ID.");
  }

  await waitForGoogleIdentity();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,

      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }

        const expiresInSeconds = Number(response.expires_in) || 3600;

        accessToken = response.access_token;

        tokenExpiresAt = Date.now() + Math.max(expiresInSeconds - 60, 0) * 1000;

        sessionStorage.setItem(DRIVE_TOKEN_STORAGE_KEY, accessToken);

        sessionStorage.setItem(
          DRIVE_TOKEN_EXPIRATION_KEY,
          String(tokenExpiresAt),
        );

        resolve(accessToken);
      },

      error_callback: (error) => {
        reject(
          new Error(
            error.message ??
              error.type ??
              "No se pudo conectar con Google Drive.",
          ),
        );
      },
    });

    tokenClient.requestAccessToken({
      prompt: "",
    });
  });
}

export function isGoogleDriveConnected() {
  const connected = Boolean(accessToken) && Date.now() < tokenExpiresAt;

  if (!connected) {
    clearStoredDriveToken();
  }

  return connected;
}

export function getGoogleDriveAccessToken() {
  if (!isGoogleDriveConnected()) {
    throw new Error("Google Drive no está conectado.");
  }

  return accessToken;
}

export async function disconnectGoogleDrive() {
  if (!accessToken) {
    clearStoredDriveToken();
    return;
  }

  await waitForGoogleIdentity();

  const tokenToRevoke = accessToken;

  clearStoredDriveToken();

  await new Promise((resolve) => {
    window.google.accounts.oauth2.revoke(tokenToRevoke, resolve);
  });
}

function waitForGoogleIdentity() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        window.clearInterval(intervalId);
        resolve();
        return;
      }

      if (Date.now() - startedAt > 10000) {
        window.clearInterval(intervalId);

        reject(new Error("Google Identity Services no pudo cargarse."));
      }
    }, 100);
  });
}
export async function getOrCreateFitnessTrackerFolder() {
  if (fitnessTrackerFolderId) {
    return fitnessTrackerFolderId;
  }

  const query = [
    `name = '${FITNESS_TRACKER_FOLDER_NAME}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
  ].join(" and ");

  const searchParameters = new URLSearchParams({
    q: query,
    spaces: "drive",
    fields: "files(id,name)",
    pageSize: "1",
  });

  const searchResponse = await driveRequest(
    `${DRIVE_API_URL}/files?${searchParameters}`,
  );

  const searchResult = await searchResponse.json();
  const existingFolder = searchResult.files?.[0];

  if (existingFolder) {
    fitnessTrackerFolderId = existingFolder.id;

    return fitnessTrackerFolderId;
  }

  const createResponse = await driveRequest(
    `${DRIVE_API_URL}/files?fields=id,name`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: FITNESS_TRACKER_FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      }),
    },
  );

  const createdFolder = await createResponse.json();

  fitnessTrackerFolderId = createdFolder.id;

  return fitnessTrackerFolderId;
}

export async function uploadGoogleDrivePhoto({
  blob,
  sessionId,
  position,
  fileId = null,
}) {
  if (!(blob instanceof Blob)) {
    throw new Error("La fotografía no es válida.");
  }

  const mimeType = blob.type || "image/jpeg";

  if (fileId) {
    await uploadFileContent(fileId, blob, mimeType);

    return {
      id: fileId,
      mimeType,
      size: blob.size,
    };
  }

  const folderId = await getOrCreateFitnessTrackerFolder();
  const extension = getExtensionFromMimeType(mimeType);
  const fileName = `${sessionId}-${position}.${extension}`;

  const metadataResponse = await driveRequest(
    `${DRIVE_API_URL}/files?fields=id,name`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fileName,
        parents: [folderId],
      }),
    },
  );

  const createdFile = await metadataResponse.json();

  try {
    await uploadFileContent(createdFile.id, blob, mimeType);
  } catch (error) {
    await deleteGoogleDriveFile(createdFile.id).catch(() => {});

    throw error;
  }

  return {
    id: createdFile.id,
    name: createdFile.name,
    mimeType,
    size: blob.size,
  };
}

export async function downloadGoogleDrivePhoto(fileId) {
  const response = await driveRequest(
    `${DRIVE_API_URL}/files/${encodeURIComponent(fileId)}?alt=media`,
  );

  return response.blob();
}

export async function deleteGoogleDriveFile(fileId) {
  if (!fileId) {
    return;
  }

  const response = await fetch(
    `${DRIVE_API_URL}/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getGoogleDriveAccessToken()}`,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    throw await createDriveError(response);
  }
}

async function uploadFileContent(fileId, blob, mimeType) {
  await driveRequest(
    `${DRIVE_UPLOAD_URL}/files/${encodeURIComponent(fileId)}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": mimeType,
      },
      body: blob,
    },
  );
}

async function driveRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getGoogleDriveAccessToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw await createDriveError(response);
  }

  return response;
}

async function createDriveError(response) {
  let message = `Google Drive respondió con error ${response.status}.`;

  try {
    const result = await response.json();

    message = result.error?.message ?? message;
  } catch {
    // La respuesta no contenía JSON.
  }

  return new Error(message);
}

function getExtensionFromMimeType(mimeType) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}
function clearStoredDriveToken() {
  accessToken = null;
  tokenExpiresAt = 0;

  sessionStorage.removeItem(DRIVE_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(DRIVE_TOKEN_EXPIRATION_KEY);
}
