const DATABASE_NAME = "fitness-tracker-db";
const DATABASE_VERSION = 1;
const STORE_NAME = "progress-photos";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("date", "date", {
          unique: false,
        });
      }
    };
  });
}

export async function getProgressPhotos() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result.sort((a, b) =>
        b.date.localeCompare(a.date),
      );

      resolve(results);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

export async function saveProgressPhoto(progress) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(progress);

    request.onsuccess = () => {
      resolve(progress);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

export async function deleteProgressPhoto(id) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}

export async function clearProgressPhotos() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
}
