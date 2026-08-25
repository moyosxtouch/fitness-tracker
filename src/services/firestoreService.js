import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export async function getUserData(userId) {
  const recordsSnapshot = await getDocs(
    collection(db, "users", userId, "records"),
  );

  const records = recordsSnapshot.docs
    .map((recordDocument) => recordDocument.data())
    .sort((a, b) => b.date.localeCompare(a.date));

  const settingsSnapshot = await getDoc(
    doc(db, "users", userId, "settings", "main"),
  );

  return {
    records,
    settings: settingsSnapshot.exists() ? settingsSnapshot.data() : null,
  };
}

export function saveUserRecord(userId, record) {
  return setDoc(
    doc(db, "users", userId, "records", record.id),
    {
      ...record,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function deleteUserRecord(userId, recordId) {
  return deleteDoc(doc(db, "users", userId, "records", recordId));
}

export function saveUserSettings(userId, settings) {
  return setDoc(
    doc(db, "users", userId, "settings", "main"),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
export async function getUserProgressSessions(userId) {
  const sessionsSnapshot = await getDocs(
    collection(db, "users", userId, "progressSessions"),
  );

  return sessionsSnapshot.docs
    .map((sessionDocument) => ({
      id: sessionDocument.id,
      ...sessionDocument.data(),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveUserProgressSession(userId, session) {
  const sessionReference = doc(
    db,
    "users",
    userId,
    "progressSessions",
    session.id,
  );

  await setDoc(
    sessionReference,
    {
      ...session,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export async function deleteUserProgressSession(userId, sessionId) {
  await deleteDoc(doc(db, "users", userId, "progressSessions", sessionId));
}
