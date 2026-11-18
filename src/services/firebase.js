import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBL44LYVwGX7_RFlpokONquQ506DyqIogU",
  authDomain: "bookmycut-e54f9.firebaseapp.com",
  projectId: "bookmycut-e54f9",
  storageBucket: "bookmycut-e54f9.firebasestorage.app",
  messagingSenderId: "525054584130",
  appId: "1:525054584130:web:9e5df7c8baf15d3cd854db",
  measurementId: "G-082FRCHMGP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();