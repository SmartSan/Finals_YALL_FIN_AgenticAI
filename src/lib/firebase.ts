
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "qrreceipt-zhjhj",
  "appId": "1:548799767944:web:88826cad03dcb566a8463d",
  "storageBucket": "qrreceipt-zhjhj.firebasestorage.app",
  "apiKey": "AIzaSyAsbBxENufk02TdWbjXXR45kKMR88s9WhA",
  "authDomain": "qrreceipt-zhjhj.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "548799767944"
};

// This function ensures that we initialize the app only once
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getAuthInstance(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirestoreInstance(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}
