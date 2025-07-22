// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "qrreceipt-zhjhj",
  "appId": "1:548799767944:web:88826cad03dcb566a8463d",
  "storageBucket": "qrreceipt-zhjhj.firebasestorage.app",
  "apiKey": "AIzaSyAsbBxENufk02TdWbjXXR45kKMR88s9WhA",
  "authDomain": "qrreceipt-zhjhj.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "548799767944"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else if (typeof window !== 'undefined') {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

const isFirebaseInitialized = () => getApps().length > 0;

// @ts-ignore
export { db, auth, app, isFirebaseInitialized };
