// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
// export const db = getFirestore(app);
// export const auth = getAuth(app);

// export const createUser = async (
//   email: string,
//   password: string,
//   profileData?: { isStudent: string; hasJob: string; hasDependents: string }
// ) => {
//   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//   const data = {
//     email,
//     createdAt: serverTimestamp(),
//     isStudent: profileData?.isStudent || "",
//     hasJob: profileData?.hasJob || "",
//     hasDependents: profileData?.hasDependents || "",
//   };
//   await setDoc(doc(db, "users", userCredential.user.uid), data);
//   return userCredential;
// };

// export const signIn = async (email: string, password: string) => {
//   return signInWithEmailAndPassword(auth, email, password);
// };

// export const logOut = async () => {
//   return signOut(auth);
// };

// export const signInWithGoogle = async () => {
//   const provider = new GoogleAuthProvider();
//   return signInWithPopup(auth, provider);
// };

// In your firebase.ts file:
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
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
    // Initialize all profile fields with empty values
    institutionType: "",
    isUCStudent: "",
    financialAid: "",
    jobTraining: "",
    housingStatus: "",
    needsHousingAssistance: "",
    hasInsurance: "",
    eligibleForHealthcare: "",
    healthcareNeeds: "",
    dependentsCount: "",
    incomeBracket: "",
    specificInstitution: "",
    major: "",
    financialAidTypes: [],
    employmentType: "",
    insuranceType: "",
    veteran: "",
    disability: "",
    dependentsAges: "",
    zipCode: "",
    state: "",
    firstName: "",
    lastName: "",
    address: "",
    highSchoolGradDate: "",
    isCaliStudent: "",
    isCSUStudent: "",
    isCCStudent: "",
    university: "",
    gradeLevel: "",
    gpa: "",
    ssn: "",
    dob: "",
    age: "",
    phoneNumber: ""
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

// Updated signInWithGoogle function
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  // Get user info from Google
  const user = result.user;
  const userEmail = user.email || "";
  const displayName = user.displayName || "";
  let firstName = "";
  let lastName = "";
  
  // Split display name into first and last name
  if (displayName) {
    const nameParts = displayName.split(" ");
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }
  
  // Check if user document already exists in Firestore
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  
  if (!userDocSnap.exists()) {
    // This is a new user, create their profile
    const userData = {
      email: userEmail,
      firstName: firstName,
      lastName: lastName,
      createdAt: serverTimestamp(),
      isStudent: "",
      hasJob: "",
      hasDependents: "",
      // Initialize all other fields with empty values
      institutionType: "",
      isUCStudent: "",
      financialAid: "",
      jobTraining: "",
      housingStatus: "",
      needsHousingAssistance: "",
      hasInsurance: "",
      eligibleForHealthcare: "",
      healthcareNeeds: "",
      dependentsCount: "",
      incomeBracket: "",
      specificInstitution: "",
      major: "",
      financialAidTypes: [],
      employmentType: "",
      insuranceType: "",
      veteran: "",
      disability: "",
      dependentsAges: "",
      zipCode: "",
      state: "",
      address: "",
      highSchoolGradDate: "",
      isCaliStudent: "",
      isCSUStudent: "",
      isCCStudent: "",
      university: "",
      gradeLevel: "",
      gpa: "",
      ssn: "",
      dob: "",
      age: "",
      phoneNumber: ""
    };
    
    await setDoc(userDocRef, userData);
  }
  
  return result;
};