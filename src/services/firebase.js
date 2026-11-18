// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBL44LYVwGX7_RFlpokONquQ506DyqIogU",
  authDomain: "bookmycut-e54f9.firebaseapp.com",
  projectId: "bookmycut-e54f9",
  storageBucket: "bookmycut-e54f9.firebasestorage.app",
  messagingSenderId: "525054584130",
  appId: "1:525054584130:web:9e5df7c8baf15d3cd854db",
  measurementId: "G-082FRCHMGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);