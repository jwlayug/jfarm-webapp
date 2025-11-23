
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsMDflCCad1StzvLJ7yNigZCCDgsBs64E",
  authDomain: "jfarm-dc42c.firebaseapp.com",
  projectId: "jfarm-dc42c",
  storageBucket: "jfarm-dc42c.firebasestorage.app",
  messagingSenderId: "88508177016",
  appId: "1:88508177016:web:ad98acfd290480affceb8d",
  measurementId: "G-W02MJMB7Q1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
