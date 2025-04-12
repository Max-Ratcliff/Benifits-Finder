import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const createUser = async (
  email: string,
  password: string,
  profileData?: { isStudent: string; hasJob: string; hasDependents: string }
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const data = {
    email,
    createdAt: serverTimestamp(),
    isStudent: profileData?.isStudent || "",
    hasJob: profileData?.hasJob || "",
    hasDependents: profileData?.hasDependents || "",
  };
  await setDoc(doc(db, "users", userCredential.user.uid), data);
  return userCredential;
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
