// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEPwdLuizj53pImFd0DefpSHq-bYQzqdI",
  authDomain: "treinano.firebaseapp.com",
  projectId: "treinano",
  storageBucket: "treinano.firebasestorage.app",
  messagingSenderId: "805170449396",
  appId: "1:805170449396:web:ec5e6cca4456819be2c7a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;