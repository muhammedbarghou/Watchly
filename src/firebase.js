import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWT4QLuB6YOZ3Xg5UDFGQ5b4KMJOEVUe0",
  authDomain: "watchly-d16b7.firebaseapp.com",
  projectId: "watchly-d16b7",
  storageBucket: "watchly-d16b7.appspot.com",
  messagingSenderId: "179645494978",
  appId: "1:179645494978:web:5978f1e405fc0f31232d5b",
  measurementId: "G-QFMX4DYKX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, storage, auth, analytics, googleProvider };