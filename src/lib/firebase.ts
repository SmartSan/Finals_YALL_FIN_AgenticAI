// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
