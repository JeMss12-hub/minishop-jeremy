import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyD6yBCnA_0aWUsd8b4qyfcw1n-Nq0ogTGY",
  authDomain: "shop-f4f53.firebaseapp.com",
  projectId: "shop-f4f53",
  storageBucket: "shop-f4f53.firebasestorage.app",
  messagingSenderId: "152442179730",
  appId: "1:152442179730:web:6d452f41191fe96efd564b",
  measurementId: "G-L3BMLHN8ND"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
