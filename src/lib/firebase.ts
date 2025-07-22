
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider } from "firebase/auth";
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

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
