import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for your Zolpo project
const firebaseConfig = {
  apiKey: process.env.firebase_api || "demo-key",
  authDomain: "zolpo-24b88.firebaseapp.com",
  projectId: "zolpo-24b88",
  storageBucket: "zolpo-24b88.firebasestorage.app",
  messagingSenderId: "992233222981",
  appId: "1:992233222981:web:a9db0d46a98e360e44842c",
  measurementId: "G-YM3PCNL9SR"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

export default app;