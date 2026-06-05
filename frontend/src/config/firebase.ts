// Firebase Configuration for Axenta Business Consulting ERP
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBDzPuLRL37CHiGPgqDBW81kL20Dxj6HPo",
  authDomain: "axientaerp.firebaseapp.com",
  projectId: "axientaerp",
  storageBucket: "axientaerp.firebasestorage.app",
  messagingSenderId: "966819059268",
  appId: "1:966819059268:web:a310b5aea9d57668940e11",
  measurementId: "G-TBZSG790TW"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
