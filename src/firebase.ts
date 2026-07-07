import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "fire_myfolder_apikey",
  authDomain: "hire-u-18.firebaseapp.com",
  projectId: "hire-u-18",
  storageBucket: "hire-u-18.firebasestorage.app",
  messagingSenderId: "291340569564",
  appId: "1:291340569564:web:56597f7cc0fac68bf7dd19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

export default app;
