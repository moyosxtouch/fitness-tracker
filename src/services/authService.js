import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export async function registerUser({ name, email, password }) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  await updateProfile(credential.user, {
    displayName: normalizedName,
  });

  await setDoc(doc(db, "users", credential.user.uid), {
    displayName: normalizedName,
    email: normalizedEmail,
    avatar: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  return credential.user;
}
export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();

  await sendPasswordResetEmail(auth, normalizedEmail);
}

export function logoutUser() {
  return signOut(auth);
}
