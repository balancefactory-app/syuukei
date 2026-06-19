import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpKWeDQPXwxIVppqBpYBPFDu_xfoBoBow",
  authDomain: "syuukei-app.firebaseapp.com",
  projectId: "syuukei-app",
  storageBucket: "syuukei-app.firebasestorage.app",
  messagingSenderId: "241997269777",
  appId: "1:241997269777:web:0ef4a5c10860b13d125ab0",
  measurementId: "G-LVCZ4SEQ56"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
