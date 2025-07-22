
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

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
let db: Firestore;

function getFirestoreInstance() {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}


export { app, auth, getFirestoreInstance };
